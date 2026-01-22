# Fanout Exchange Demo

[![RabbitMQ](https://img.shields.io/badge/RabbitMQ-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)](https://www.rabbitmq.com)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Exchange-Fanout](https://img.shields.io/badge/Exchange-Fanout-orange?style=for-the-badge)](https://www.rabbitmq.com/tutorials/amqp-concepts.html#exchanges-fanout)
[![Pub/Sub](https://img.shields.io/badge/Pattern-Pub_Subscribe-green?style=for-the-badge)](#)

This project demonstrates how to use RabbitMQ's **Fanout Exchange** type for broadcasting messages to all bound queues simultaneously.

**Author:** [saranzafar](https://github.com/saranzafar)

## What is a Fanout Exchange?

A **Fanout Exchange** is a RabbitMQ exchange type that routes messages to **all queues** that are bound to it, regardless of the routing key or any other message attributes. It's the simplest exchange type and is ideal for publish/subscribe (pub/sub) patterns.

### Key Features:
- **Broadcasts** messages to all bound queues
- **Ignores routing keys** (binds with empty string)
- Each subscriber gets a **copy of every message**
- Ideal for **event distribution** and **notifications**

## How It Works

### Exchange Configuration
```javascript
const exchange = "new_product_launch";
const exchangeType = "fanout";
await channel.assertExchange(exchange, exchangeType, { durable: true })
```

### File Structure

| File | Description |
|------|-------------|
| `producer.js` | Publishes product announcements to the fanout exchange |
| `pushNotification.js` | Consumer for push notification service |
| `smsNotification.js` | Consumer for SMS notification service |

### Routing Logic

The Fanout Exchange **ignores routing keys** and broadcasts to all bound queues:

```
Message published to exchange
        ↓
   [new_product_launch (fanout)]
        ↓
        ├─→ Queue: push_notifications ──→ Push Notification Consumer
        │
        ├─→ Queue: sms_notifications ──→ SMS Consumer
        │
        ├─→ Queue: email_notifications ──→ Email Consumer
        │
        └─→ Queue: ... (any other bound queues)
```

#### Publisher (producer.js)
```javascript
// Create fanout exchange
await channel.assertExchange(exchange, "fanout", { durable: true })

// Publish with empty routing key (ignored by fanout)
channel.publish(exchange, "", Buffer.from(message), { persistent: true })

// Example product message
announceNewProduct({ 
    id: 123, 
    name: "iphone 19 pro max", 
    price: 200000 
})
```

#### Push Notification Consumer (pushNotification.js)
```javascript
// Create fanout exchange
await channel.assertExchange(exchange, "fanout", { durable: true })

// Create exclusive auto-delete queue
const queue = await channel.assertQueue("", { exclusive: true })

// Bind queue to exchange (routing key is ignored for fanout)
await channel.bindQueue(queue.queue, exchange, "")

// Consume messages
channel.consume(queue.queue, (msg) => {
    if (msg !== null) {
        const product = JSON.parse(msg.content.toString())
        console.log("Sending Push notification for product: ", product.name);
        channel.ack(msg)
    }
})
```

#### SMS Notification Consumer (smsNotification.js)
```javascript
// Same pattern as push notification
await channel.assertExchange(exchange, "fanout", { durable: true })
const queue = await channel.assertQueue("", { exclusive: true })
await channel.bindQueue(queue.queue, exchange, "")

channel.consume(queue.queue, (msg) => {
    if (msg !== null) {
        const product = JSON.parse(msg.content.toString())
        console.log("Sending SMS notification for product: ", product.name);
        channel.ack(msg)
    }
})
```

### Message Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         NEW PRODUCT LAUNCH                           │
│                      (Fanout Exchange)                               │
└─────────────────────────────────────────────────────────────────────┘
                                    │
            ┌───────────────────────┼───────────────────────┐
            │                       │                       │
            ▼                       ▼                       ▼
   ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
   │   Push Notif    │    │    SMS Notif    │    │   Email Notif   │
   │    Consumer     │    │    Consumer     │    │    (add more)   │
   └────────┬────────┘    └────────┬────────┘    └────────┬────────┘
            │                       │                       │
            ▼                       ▼                       ▼
   "Sending Push        "Sending SMS           (Any other subscriber)
    notification for      notification for
    product: iphone       product: iphone
    19 pro max"           19 pro max"
```

## Prerequisites

1. **RabbitMQ** must be installed and running
2. **Node.js** (v12 or higher recommended)
3. **amqplib** package installed

## Installation

```bash
# Navigate to project root
cd /media/saran/Development/play-ground/rabbitmq

# Install dependencies (if not already installed)
npm install amqplib
```

## Running the Demo

### Step 1: Start RabbitMQ
Make sure RabbitMQ is running on your system:

```bash
# For Linux (systemd)
sudo systemctl start rabbitmq-server

# For macOS (Homebrew)
brew services start rabbitmq

# For Windows
# Start RabbitMQ Service from Services app
```

### Step 2: Start the Consumers

Open multiple terminal windows and run each consumer in a separate terminal:

```bash
# Terminal 1 - Push Notification Service
node fanout-exchange/pushNotification.js

# Terminal 2 - SMS Notification Service
node fanout-exchange/smsNotification.js
```

You should see output like:
```
Waiting for msgs:  amq.gen-xxxxxxxxxxxx
Waiting for msgs:  amq.gen-xxxxxxxxxxxx
```

### Step 3: Run the Producer

```bash
node fanout-exchange/producer.js
```

### Expected Output

**Producer:**
```
sent:  {"id":123,"name":"iphone 19 pro max","price":200000}
```

**Push Notification Consumer:**
```
Sending Push notification for product:  iphone 19 pro max
```

**SMS Notification Consumer:**
```
Sending SMS notification for product:  iphone 19 pro max
```

### Adding More Subscribers

To add an email notification service, create `emailNotification.js`:

```javascript
const amqp = require("amqplib")

async function emailNotification() {
    try {
        const connection = await amqp.connect("amqp://localhost")
        const channel = await connection.createChannel()
        const exchange = "new_product_launch";
        
        await channel.assertExchange(exchange, "fanout", { durable: true })
        const queue = await channel.assertQueue("", { exclusive: true })
        await channel.bindQueue(queue.queue, exchange, "")
        
        channel.consume(queue.queue, (msg) => {
            if (msg !== null) {
                const product = JSON.parse(msg.content.toString())
                console.log("Sending Email notification for product: ", product.name);
                channel.ack(msg)
            }
        })
    } catch (error) {
        console.log("Error: ", error);
    }
}
emailNotification()
```

Now when you run the producer, all three consumers will receive the message!

## Use Cases

### When to Use Fanout Exchange

1. **Notifications**: Send notifications to multiple channels (SMS, Push, Email)
2. **Event Broadcasting**: Notify multiple services about an event
3. **Logging/Monitoring**: Send logs to multiple destinations
4. **Chat Applications**: Message delivery to all connected clients
5. **Stock Price Updates**: Broadcast price changes to all subscribers

### Real-World Examples

| Scenario | Exchange Name | Use Case |
|----------|---------------|----------|
| **Product Launch** | `product_launch` | Notify all notification services |
| **Order Updates** | `order_events` | Notify warehouse, CRM, analytics |
| **System Alerts** | `system_alerts` | Alert monitoring, logging, paging |
| **Live Scores** | `sports_scores` | Broadcast to all connected clients |
| **Chat Messages** | `chat_messages` | Deliver to all chat participants |

### Pattern: Adding Subscribers Dynamically

```javascript
// Each new subscriber creates its own queue
const queue = await channel.assertQueue("", { exclusive: true })
await channel.bindQueue(queue.queue, exchange, "")

// Consumer processes messages
channel.consume(queue.queue, callback)

// When connection closes, queue is auto-deleted (exclusive: true)
```

## Comparison with Other Exchanges

| Exchange Type | Routing Based On | Best For |
|---------------|------------------|----------|
| **Fanout** | All bound queues | Pub/Sub broadcasting |
| **Direct** | Exact routing key match | One-to-one routing |
| **Topic** | Routing key patterns (wildcards) | Pattern-based routing |
| **Headers** | Multiple header attributes | Complex attribute-based routing |

### When to Choose Fanout Over Others

- ✅ Use **Fanout** when every subscriber should receive every message
- ✅ Use **Direct** when you need precise routing to specific queues
- ✅ Use **Topic** when you need wildcard pattern matching
- ✅ Use **Headers** when routing depends on message attributes

## Message Persistence

In this demo, messages are made persistent:

```javascript
// Exchange is durable (survives broker restart)
await channel.assertExchange(exchange, "fanout", { durable: true })

// Message is persistent (survives broker restart)
channel.publish(exchange, "", Buffer.from(message), { persistent: true })
```

### Durability Options

| Component | Durable | Auto-Delete | Use Case |
|-----------|---------|-------------|----------|
| Exchange | `durable: true` | - | Messages survive restart |
| Queue | - | `exclusive: true` | Auto-delete on disconnect |
| Message | `persistent: true` | - | Survives broker restart |

**For temporary consumers** (like this demo), `exclusive: true` is perfect:
- Queue is deleted when consumer disconnects
- Allows easy scaling up/down of consumers

## Troubleshooting

### Connection Refused Error
```
Error: connect ECONNREFUSED 127.0.0.1:5672
```
**Solution:** Ensure RabbitMQ is running:
```bash
# Check status
rabbitmqctl status

# Start the service (Linux)
sudo systemctl start rabbitmq-server
```

### Message Not Received
- Check that all consumers are running before the producer
- Verify exchange name matches exactly
- Ensure queues are bound to the exchange
- Check that queue binding uses empty string `""`

### Multiple Consumers on Same Queue
In fanout, each consumer typically has its **own queue**. If multiple consumers share a queue, messages are distributed round-robin:

```javascript
// Shared queue - messages distributed among consumers
await channel.assertQueue("shared_queue", { exclusive: false })
channel.consume("shared_queue", callback)  // Multiple consumers
```

### Queue Name is Auto-Generated
```
Waiting for msgs:  amq.gen-xxxxxxxxxxxx
```
This is **expected** when using `assertQueue("", { exclusive: true })`. The auto-generated name ensures uniqueness.

## Advanced: Default Exchange

RabbitMQ has a built-in **default exchange** (nameless, direct type):

```javascript
// This uses the default exchange
channel.assertQueue("my_queue")
channel.bindQueue("my_queue", "", "my_routing_key")
channel.publish("", "my_routing_key", message)
```

This is useful for simple direct routing without creating a named exchange.

## Advanced: Message Acknowledgment

This demo uses manual acknowledgment:

```javascript
channel.consume(queue.queue, (msg) => {
    if (msg !== null) {
        // Process message
        console.log(JSON.parse(msg.content))
        // Acknowledge successful processing
        channel.ack(msg)
    }
})
```

### Auto-Acknowledge
For simpler cases, use auto-ack:

```javascript
channel.consume(queue.queue, (msg) => {
    console.log(JSON.parse(msg.content))
}, { noAck: true })  // Auto-acknowledge
```

**Note:** With auto-ack, messages are considered delivered immediately. If the consumer crashes message is lost.

, the## Additional Resources

- [RabbitMQ Fanout Exchange Documentation](https://www.rabbitmq.com/tutorials/amqp-concepts.html#exchanges-fanout)
- [RabbitMQ Pub/Sub Tutorial](https://www.rabbitmq.com/tutorials/tutorial-three-javascript.html)
- [amqplib npm package](https://www.npmjs.com/package/amqplib)


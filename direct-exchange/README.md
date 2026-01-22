# Direct Exchange Demo

[![RabbitMQ](https://img.shields.io/badge/RabbitMQ-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)](https://www.rabbitmq.com)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Exchange-Direct](https://img.shields.io/badge/Exchange-Direct-orange?style=for-the-badge)](https://www.rabbitmq.com/tutorials/amqp-concepts.html#exchanges-direct)
[![Exact Match](https://img.shields.io/badge/Routing-Exact_Match-green?style=for-the-badge)](#)

This project demonstrates how to use RabbitMQ's **Direct Exchange** type for message routing based on exact routing key matching.

**Author:** [saranzafar](https://github.com/saranzafar)

## What is a Direct Exchange?

A **Direct Exchange** is a RabbitMQ exchange type that routes messages to queues based on an exact match between the message's routing key and the binding key used when binding a queue to an exchange. It's the simplest and most commonly used exchange type for point-to-point messaging.

### Key Features:
- Routes based on **exact string matching** of routing keys
- One message can go to **one or more queues** based on binding
- Simple and efficient routing
- Ideal for scenarios where routing criteria are known in advance

## How It Works

### Exchange Configuration
```javascript
const exchange = "main_exchange";
const exchangeType = "direct";
await channel.assertExchange(exchange, "direct", { durable: false })
```

### File Structure

| File | Description |
|------|-------------|
| `producer.js` | Publishes email messages to the direct exchange with routing keys |
| `subConsumer.js` | Consumer for subscribed/paid users |
| `normalConsumer.js` | Consumer for normal/free users |

### Routing Logic

The Direct Exchange uses **exact key matching** to route messages:

```
Message with routing key "send_mail_to_normal_user"
        ↓
   [main_exchange (direct)]
        ↓
   Exact match check
        ↓
   Queue: send_mail_to_normal_user ✓ DELIVERED
   Queue: send_mail_to_sub_user      ✗ NOT DELIVERED
```

#### Publisher (producer.js)
```javascript
// Define routing keys
const routingKeyForSubUser = "send_mail_to_sub_user"
const routingKeyForNormalUser = "send_mail_to_normal_user"

// Bind queues to exchange with routing keys
await channel.bindQueue("send_mail_to_sub_user", exchange, routingKeyForSubUser)
await channel.bindQueue("send_mail_to_normal_user", exchange, routingKeyForNormalUser)

// Publish message with specific routing key
channel.publish(exchange, routingKeyForNormalUser, Buffer.from(JSON.stringify(message)))
```

#### Consumer for Sub User (subConsumer.js)
```javascript
// Declare the queue that is bound to the exchange
await channel.assertQueue("send_mail_to_sub_user", { durable: false })

// Consume messages from the queue
channel.consume("send_mail_to_sub_user", (message) => {
    if (message !== null) {
        console.log("Receive message for sub user: ", JSON.parse(message.content));
        channel.ack(message);
    }
})
```

#### Consumer for Normal User (normalConsumer.js)
```javascript
// Declare the queue that is bound to the exchange
await channel.assertQueue("send_mail_to_normal_user", { durable: false })

// Consume messages from the queue
channel.consume("send_mail_to_normal_user", (message) => {
    if (message !== null) {
        console.log("Receive message for normal user: ", JSON.parse(message.content));
        channel.ack(message);
    }
})
```

### Message Flow Diagram

```
┌─────────────────┐
│   Producer      │
│  (producer.js)  │
└────────┬────────┘
         │
         │ publish(routingKey: "send_mail_to_normal_user")
         ▼
┌─────────────────────┐
│  main_exchange      │
│  (type: direct)     │
└──────────┬──────────┘
           │
           │ Routing Key Matching
           ▼
    ┌──────┴──────┐
    │             │
    ▼             ▼
┌───────┐    ┌───────────────┐
│Queue 1│    │Queue 2        │
│sub user│    │normal user    │
└───┬───┘    └───────┬───────┘
    │                │
    ▼                ▼
[NO MATCH]      [MATCH ✓]
                ┌─────┐
                │ Msg │
                └─────┘
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

Open two terminal windows and run each consumer in a separate terminal:

```bash
# Terminal 1 - Sub User Consumer
node direct-exchange/subConsumer.js

# Terminal 2 - Normal User Consumer
node direct-exchange/normalConsumer.js
```

You should see output like:
```
Waiting for messages in send_mail_to_sub_user...
Waiting for messages in send_mail_to_normal_user...
```

### Step 3: Run the Producer

```bash
node direct-exchange/producer.js
```

### Expected Output

**Producer:**
```
Mail data ws sent:  { to: 'abc@gmail.com',
  from: 'harish@gmail.com',
  subject: 'Thank you',
  body: 'Hello ABC!' }
```

**Normal User Consumer:**
```
Receive message for normal user:  { to: 'abc@gmail.com',
  from: 'harish@gmail.com',
  subject: 'Thank you',
  body: 'Hello ABC!' }
```

**Sub User Consumer:**
*(No output - message was sent to normal user queue only)*

### To Test Sub User Routing

Modify `producer.js` to send to sub user:
```javascript
// Change this line:
channel.publish(exchange, routingKeyForNormalUser, Buffer.from(JSON.stringify(message)))

// To:
channel.publish(exchange, routingKeyForSubUser, Buffer.from(JSON.stringify(message)))
```

Then run the producer again. The sub user consumer will receive the message instead.

## Use Cases

### When to Use Direct Exchange

1. **Task Queues**: Routing tasks to specific workers
2. **User Type Routing**: Sending notifications based on user tier (free/premium)
3. **Priority Queues**: Simple priority-based routing
4. **Region-Based Routing**: Routing messages to region-specific queues

### Real-World Examples

| Scenario | Exchange | Routing Keys |
|----------|----------|--------------|
| **Email Notifications** | `email_exchange` | `send_mail`, `notification`, `alert` |
| **Order Processing** | `order_exchange` | `new_order`, `order_update`, `order_cancel` |
| **Payment Processing** | `payment_exchange` | `payment_success`, `payment_failed`, `refund` |
| **User Management** | `user_exchange` | `user_register`, `user_login`, `user_delete` |

### Multiple Bindings Example

One queue can be bound to multiple routing keys:

```javascript
// Bind same queue to multiple routing keys
await channel.bindQueue("send_mail_to_sub_user", exchange, "send_mail_to_sub_user")
await channel.bindQueue("send_mail_to_sub_user", exchange, "premium_notification")
await channel.bindQueue("send_mail_to_sub_user", exchange, "vip_alert")
```

## Comparison with Other Exchanges

| Exchange Type | Routing Based On | Best For |
|---------------|------------------|----------|
| **Direct** | Exact routing key match | One-to-one or one-to-few routing |
| **Topic** | Routing key patterns (wildcards) | Pattern-based routing |
| **Fanout** | Broadcast to all queues | Pub/Sub broadcasting |
| **Headers** | Multiple header attributes | Complex attribute-based routing |

### When to Choose Direct Over Others

- ✅ Use **Direct** when you know the exact routing criteria upfront
- ✅ Use **Topic** when you need wildcard pattern matching
- ✅ Use **Fanout** when every queue should receive every message
- ✅ Use **Headers** when routing depends on multiple attributes

## Queue Durability

In this demo, queues are created with `durable: false`:

```javascript
await channel.assertQueue("send_mail_to_normal_user", { durable: false })
```

### Durable vs Non-Durable

| Property | Durable | Non-Durable |
|----------|---------|-------------|
| **Survives broker restart** | Yes | No |
| **Use Case** | Production messages | Development/testing |
| **Performance** | Slightly slower | Faster |

**For production**, use `durable: true`:
```javascript
await channel.assertQueue("send_mail_to_normal_user", { durable: true })
```

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
- Check that consumers are running before the producer
- Verify routing key matches exactly (case-sensitive)
- Ensure queue names are consistent
- Check for typos in exchange or queue names

### Queue Not Bound
If you see this error:
```
{ Error: NOT_FOUND - no queue 'queue_name'
```
**Solution:** Declare the queue before consuming:
```javascript
await channel.assertQueue("queue_name", { durable: false })
```

### Multiple Consumers on Same Queue
If you want multiple consumers processing the same queue (work queue pattern):
```javascript
// Only ONE consumer should declare the queue
// All consumers consume from the same queue name
channel.consume("shared_queue", callback)
```

This enables **round-robin** distribution among consumers.

## Advanced: Sending to Multiple Queues

You can publish to multiple queues by using the same routing key for multiple bindings:

```javascript
// Producer sends with routing key "alert"
channel.publish(exchange, "alert", Buffer.from(JSON.stringify(message)))

// Both queues are bound to "alert" routing key
await channel.bindQueue("queue_1", exchange, "alert")
await channel.bindQueue("queue_2", exchange, "alert")
```

Result: Message is delivered to **both** queues.

## Additional Resources

- [RabbitMQ Direct Exchange Documentation](https://www.rabbitmq.com/tutorials/amqp-concepts.html#exchanges-direct)
- [RabbitMQ Queues Documentation](https://www.rabbitmq.com/tutorials/amqp-concepts.html#queues)
- [amqplib npm package](https://www.npmjs.com/package/amqplib)


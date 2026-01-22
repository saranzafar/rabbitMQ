# Topic Exchange Demo

This project demonstrates how to use RabbitMQ's **Topic Exchange** type for pattern-based message routing using wildcard characters.

## What is a Topic Exchange?

A **Topic Exchange** is a RabbitMQ exchange type that routes messages based on **wildcard pattern matching** of the routing key. It combines the flexibility of headers exchange with the simplicity of direct exchange, allowing complex routing patterns using dot-separated words and wildcards.

### Key Features:
- Routes based on **pattern matching** (not exact match)
- Supports **wildcards**: `*` (matches one word) and `#` (matches zero or more words)
- Uses **dot-separated** routing keys (e.g., `order.placed`, `payment.processed`)
- Ideal for **category-based** or **hierarchy-based** routing

## How It Works

### Exchange Configuration
```javascript
const exchange = "notification_exchange";
const exchangeType = "topic";
await channel.assertExchange(exchange, exchangeType, { durable: true })
```

### File Structure

| File | Description |
|------|-------------|
| `producer.js` | Publishes messages with various topic routing keys |
| `orderNotificationService.js` | Consumer for order-related notifications |
| `paymentNotificationService.js` | Consumer for payment-related notifications |

### Wildcard Patterns

| Pattern | Meaning | Examples |
|---------|---------|----------|
| `*` | Matches exactly **one word** | `order.*` matches `order.placed`, `order.cancelled` |
| `#` | Matches **zero or more words** | `order.#` matches `order.placed`, `order.placed.success` |

#### Routing Key Examples

```
order.placed        → 1 word after "order"  ✓
order.cancelled     → 1 word after "order"  ✓
order.placed.success→ 2 words after "order" ✗ (doesn't match order.*)
order.#             → 0+ words after "order ✓
```

### Routing Logic

The Topic Exchange matches routing keys against binding patterns:

```
Message: "order.placed" with routing key "order.placed"
         ↓
    [notification_exchange (topic)]
         ↓
    Pattern Matching: "order.*" matches "order.placed" ✓
         ↓
    Queue: order_queue ← DELIVERED

Message: "payment.processed" with routing key "payment.processed"
         ↓
    [notification_exchange (topic)]
         ↓
    Pattern Matching: "payment.*" matches "payment.processed" ✓
         ↓
    Queue: payment_queue ← DELIVERED
```

#### Publisher (producer.js)
```javascript
// Create topic exchange
await channel.assertExchange(exchange, "topic", { durable: true })

// Publish messages with different routing keys
sendMessage("order.placed", { orderId: 1234, status: "placed" })
sendMessage("payment.processed", { paymentId: 1234, status: "processed" })

// Routing key determines which queues receive the message
channel.publish(exchange, "order.placed", Buffer.from(JSON.stringify(message)), { 
    persistent: true 
})
```

#### Order Notification Service (orderNotificationService.js)
```javascript
// Create topic exchange
await channel.assertExchange(exchange, "topic", { durable: true })

// Create durable queue
await channel.assertQueue("order_queue", { durable: true })

// Bind with wildcard pattern - receives all order.* messages
await channel.bindQueue(queue, exchange, "order.*")

// Consume messages
channel.consume(queue, (msg) => {
    if (msg !== null) {
        console.log(`Routing Key: ${msg.fields.routingKey}`)
        console.log(`Content: ${msg.content.toString()}`)
        channel.ack(msg)
    }
})
```

#### Payment Notification Service (paymentNotificationService.js)
```javascript
// Create topic exchange
await channel.assertExchange(exchange, "topic", { durable: true })

// Create durable queue
await channel.assertQueue("payment_queue", { durable: true })

// Bind with wildcard pattern - receives all payment.* messages
await channel.bindQueue(queue, exchange, "payment.*")

// Consume messages
channel.consume(queue, (msg) => {
    if (msg !== null) {
        console.log(`Routing Key: ${msg.fields.routingKey}`)
        console.log(`Content: ${msg.content.toString()}`)
        channel.ack(msg)
    }
})
```

### Message Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                    NOTIFICATION_EXCHANGE                             │
│                        (Topic Exchange)                              │
└─────────────────────────────────────────────────────────────────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
              ▼                     ▼                     ▼
    "order.placed"         "payment.processed"      "shipping.created"
              │                     │                     │
              ▼                     ▼                     ▼
    ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
    │   order_queue   │   │  payment_queue  │   │  (no subscriber)│
    │                 │   │                 │   │                 │
    │ order.placed ✓ │   │ payment.processed✓│   │                 │
    └─────────────────┘   └─────────────────┘   └─────────────────┘
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
# Terminal 1 - Order Notification Service
node topics-exchange/orderNotificationService.js

# Terminal 2 - Payment Notification Service
node topics-exchange/paymentNotificationService.js
```

You should see output like:
```
waiting for message
waiting for message
```

### Step 3: Run the Producer

```bash
node topics-exchange/producer.js
```

### Expected Output

**Producer:**
```
[x] Sent 'order.placed':'{"orderId":1234,"status":"placed"}'
Mes was send! with routing key as order.placed and content as [object Object]
[x] Sent 'payment.processed':'{"paymentId":1234,"status":"processed"}'
Mes was send! with routing key as payment.processed and content as [object Object]
```

**Order Notification Consumer:**
```
[Order Notification] Msg was consumed! with routing key as order.placed and content as {"orderId":1234,"status":"placed"}
```

**Payment Notification Consumer:**
```
[Payment Notification] Msg was consumed! with routing key as payment.processed and content as {"paymentId":1234,"status":"processed"}
```

### Testing Wildcard Patterns

Add more messages to test pattern matching:

```javascript
// In producer.js, add:
sendMessage("order.shipped", { orderId: 5678, status: "shipped" })
sendMessage("order.cancelled", { orderId: 9999, status: "cancelled" })
sendMessage("payment.refunded", { paymentId: 7777, status: "refunded" })

// Add a # pattern to match all order messages
sendMessage("order.placed.success", { orderId: 1111, status: "placed_success" })
```

Expected results:
- `order.placed` → order_queue ✓
- `order.shipped` → order_queue ✓
- `order.cancelled` → order_queue ✓
- `order.placed.success` → order_queue ✗ (doesn't match `order.*`)
- `payment.processed` → payment_queue ✓
- `payment.refunded` → payment_queue ✓

To match `order.placed.success`, use `order.#` pattern.

## Advanced Patterns

### Pattern 1: Multi-level Wildcard (#)

Bind with `#` to receive all messages for a category:

```javascript
// This receives ALL order messages (any sub-category)
await channel.bindQueue(queue, exchange, "order.#")
```

Matches:
- `order.placed` ✓
- `order.placed.success` ✓
- `order.cancelled.refund.processed` ✓

### Pattern 2: Combined Patterns

A queue can have multiple bindings:

```javascript
// Receive all notifications
await channel.bindQueue(queue, exchange, "order.#")
await channel.bindQueue(queue, exchange, "payment.#")
await channel.bindQueue(queue, exchange, "shipping.#")
```

### Pattern 3: Specific + Catch-all

```javascript
// High priority orders
await channel.bindQueue(priorityQueue, exchange, "order.urgent")

// All other orders
await channel.bindQueue(normalQueue, exchange, "order.#")

// Send urgent order
sendMessage("order.urgent", { priority: true })
// → Both queues receive the message!
```

### Pattern 4: Environment-Based Routing

```javascript
// Production only
await channel.bindQueue(prodQueue, exchange, "order.#")

// Development only
await channel.bindQueue(devQueue, exchange, "order.#")

// Send based on environment
sendMessage("order.placed", message)  // Both queues get it
```

## Use Cases

### When to Use Topic Exchange

1. **Microservices Event Routing**: Route events by service and action
2. **Log Aggregation**: Route logs by severity and source
3. **Notification Systems**: Route by category and sub-category
4. **IoT Device Messages**: Route by device type and event type
5. **Financial Transactions**: Route by transaction type and status

### Real-World Examples

| Scenario | Routing Keys | Binding Pattern |
|----------|--------------|-----------------|
| **Order Events** | `order.created`, `order.shipped`, `order.delivered` | `order.*` or `order.#` |
| **Payment Events** | `payment.success`, `payment.failed`, `payment.refunded` | `payment.*` |
| **Log Routing** | `log.error.api`, `log.warn.db`, `log.info.system` | `log.*.*` |
| **Stock Updates** | `stock.aapl.update`, `stock.goog.update` | `stock.*.update` |
| **User Events** | `user.login`, `user.logout`, `user.register` | `user.*` |

### Example: Comprehensive Notification System

```javascript
// Publisher sends various notification types
sendMessage("notification.email.order.confirmation", { type: "email", orderId: 123 })
sendMessage("notification.sms.order.shipping", { type: "sms", orderId: 123 })
sendMessage("notification.push.payment.success", { type: "push", paymentId: 456 })

// Consumer binds to receive all notifications
await channel.bindQueue(queue, exchange, "notification.#")

// Or receive only order-related notifications
await channel.bindQueue(orderQueue, exchange, "notification.email.order.*")
await channel.bindQueue(smsQueue, exchange, "notification.sms.order.*")
```

## Comparison with Other Exchanges

| Exchange Type | Routing Based On | Best For |
|---------------|------------------|----------|
| **Topic** | Wildcard patterns | Category-based routing |
| **Direct** | Exact routing key match | Simple one-to-one routing |
| **Fanout** | Broadcast to all queues | Pub/Sub broadcasting |
| **Headers** | Multiple header attributes | Complex attribute-based routing |

### When to Choose Topic Over Others

- ✅ Use **Topic** when you need flexible pattern matching
- ✅ Use **Direct** when you need exact key matching only
- ✅ Use **Fanout** when every queue should receive every message
- ✅ Use **Headers** when routing depends on multiple attributes

## Routing Key Best Practices

### Naming Conventions

```
# Good examples
order.created
payment.success
user.login
stock.aapl.quote
log.error.database

# Avoid
ORDERCREATED
paymentSuccess
UserLogin
```

### Hierarchy Structure

```
# General to specific
<entity>.<action>.<detail>

# Examples
order.created
order.created.email
order.created.email.confirmation
order.cancelled.refund.processed
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
- Verify routing key matches the pattern exactly
- Ensure wildcards are used correctly (`*` vs `#`)
- Check that queue is bound to the exchange

### Pattern Not Matching
```
# Binding: "order.*"
order.placed      ✓ MATCH
order.cancelled   ✓ MATCH
order             ✗ NO MATCH (no word after dot)
order.placed.shipped ✗ NO MATCH (two words, not one)
```

```
# Binding: "order.#"
order.placed      ✓ MATCH
order.placed.shipped ✓ MATCH
order             ✓ MATCH (zero words)
```

### Durable vs Non-Durable

In this demo, both exchange and queues are durable:

```javascript
// Exchange survives broker restart
await channel.assertExchange(exchange, "topic", { durable: true })

// Queue survives broker restart
await channel.assertQueue(queue, { durable: true })

// Message survives broker restart
channel.publish(exchange, routingKey, Buffer.from(message), { persistent: true })
```

## Message Properties

### Accessing Routing Key in Consumer

```javascript
channel.consume(queue, (msg) => {
    if (msg !== null) {
        // Access routing key used for routing
        const routingKey = msg.fields.routingKey
        console.log(`Received with key: ${routingKey}`)
        
        // Access message content
        const content = msg.content.toString()
        
        channel.ack(msg)
    }
})
```

### Message Fields Available

```javascript
msg.fields.routingKey   // The routing key used
msg.fields.deliveryTag  // Delivery identifier
msg.fields.redelivered  // Was message redelivered?
msg.content             // The message buffer
msg.properties          // Message properties (persistent, headers, etc.)
```

## Advanced: Multiple Bindings per Queue

A queue can be bound to multiple routing patterns:

```javascript
// Single queue receives multiple notification types
await channel.bindQueue(queue, exchange, "order.#")
await channel.bindQueue(queue, exchange, "payment.#")
await channel.bindQueue(queue, exchange, "shipping.#")

// Now this queue gets all order, payment, and shipping messages
```

## Additional Resources

- [RabbitMQ Topic Exchange Documentation](https://www.rabbitmq.com/tutorials/amqp-concepts.html#exchanges-topic)
- [RabbitMQ Topic Tutorial](https://www.rabbitmq.com/tutorials/tutorial-five-javascript.html)
- [amqplib npm package](https://www.npmjs.com/package/amqplib)


# Priority Queue Demo

[![RabbitMQ](https://img.shields.io/badge/RabbitMQ-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)](https://www.rabbitmq.com)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Queue-Priority](https://img.shields.io/badge/Queue-Priority-red?style=for-the-badge)](#)
[![Priority-0--10](https://img.shields.io/badge/Priority-0--10-green?style=for-the-badge)](#)

This project demonstrates how to use RabbitMQ's **Priority Queue** feature for message processing based on priority levels.

**Author:** [saranzafar](https://github.com/saranzafar)

## What is a Priority Queue?

A **Priority Queue** is a RabbitMQ queue type that delivers messages to consumers based on their priority level. Messages with higher priority are delivered first, ensuring critical messages are processed before less important ones.

### Key Features:
- Messages are delivered in **priority order** (highest first)
- Priority range: **0-10** (10 = highest priority)
- Critical messages get processed immediately
- Ideal for scenarios requiring message prioritization

## How It Works

### Queue Configuration
```javascript
await channel.assertQueue(QUEUE_NAME, {
    durable: false,
    arguments: {
        "x-max-priority": 10  // Priority range: 0-10
    }
})
```

### File Structure

| File | Description |
|------|-------------|
| `producer.js` | Publishes messages with different priority levels |
| `consumer.js` | Consumes messages from the priority queue |

### Priority Queue Logic

The Priority Queue uses **priority values** to determine delivery order:

```
Messages sent to queue (in order of sending):
        ↓
   Priority 1: Weekly Newsletter
   Priority 5: Order Confirmation
   Priority 8: Password Reset
   Priority 10: Security Alert
   Priority 2: Maintenance Notice
   Priority 6: Payment Reminder
        ↓
   RabbitMQ reorders by priority (highest first)
        ↓
   Messages delivered to consumer:
   Priority 10 → Priority 8 → Priority 6 → Priority 5 → Priority 2 → Priority 1
```

#### Producer (producer.js)
```javascript
// Define queue with priority support
await channel.assertQueue(QUEUE_NAME, {
    durable: false,
    arguments: {
        "x-max-priority": 10
    }
})

// Send message with priority
channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(message)), {
    priority: message.priority  // 0-10
})
```

#### Consumer (consumer.js)
```javascript
// Declare the priority queue
await channel.assertQueue(QUEUE_NAME, {
    durable: false,
    arguments: {
        "x-max-priority": 10
    }
})

// Consume messages (delivered in priority order)
channel.consume(QUEUE_NAME, (message) => {
    if (message !== null) {
        console.log(`Priority ${message.properties.priority}: ${content.subject}`);
        channel.ack(message);
    }
})
```

### Message Flow Diagram

```
┌─────────────────────────────────────────────────┐
│              Producer (producer.js)              │
│  Sends messages with different priorities:      │
│  - Priority 1: Newsletter                       │
│  - Priority 5: Order Confirmation               │
│  - Priority 8: Password Reset                   │
│  - Priority 10: Security Alert (URGENT)         │
└────────────────────┬────────────────────────────┘
                     │ sendToQueue() with priority
                     ▼
┌─────────────────────────────────────────────────┐
│            priority_mail_queue                  │
│            (x-max-priority: 10)                 │
│                                                 │
│  Messages stored in priority order:             │
│  ┌─────────────────────────────────┐           │
│  │ Priority 10: Security Alert     │ ← TOP    │
│  │ Priority 8: Password Reset      │          │
│  │ Priority 6: Payment Reminder    │          │
│  │ Priority 5: Order Confirmation  │          │
│  │ Priority 2: Maintenance Notice  │          │
│  │ Priority 1: Weekly Newsletter   │ ← BOTTOM │
│  └─────────────────────────────────┘           │
└────────────────────┬────────────────────────────┘
                     │ Consumer receives highest priority first
                     ▼
┌─────────────────────────────────────────────────┐
│              Consumer (consumer.js)              │
│                                                 │
│  [RECEIVED] Priority 10: Security Alert         │
│  [RECEIVED] Priority 8: Password Reset Request  │
│  [RECEIVED] Priority 6: Payment Due Reminder    │
│  [RECEIVED] Priority 5: Order Confirmation      │
│  [RECEIVED] Priority 2: System Maintenance      │
│  [RECEIVED] Priority 1: Weekly Newsletter       │
└─────────────────────────────────────────────────┘
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

### Step 2: Start the Consumer

```bash
# Terminal 1 - Start the consumer
node priority-queue/consumer.js
```

You should see output like:
```
=== Priority Queue Demo ===

Waiting for messages... (Press Ctrl+C to exit)
```

### Step 3: Run the Producer

```bash
# Terminal 2 - Run the producer
node priority-queue/producer.js
```

### Expected Output

**Producer:**
```
=== Priority Queue Demo ===

[SENT] Priority 1: Weekly Newsletter
[SENT] Priority 5: Your Order Confirmation
[SENT] Priority 8: Password Reset Request
[SENT] Priority 10: URGENT: Security Alert
[SENT] Priority 2: System Maintenance Notice
[SENT] Priority 6: Payment Due Reminder

All messages sent to priority queue!
Higher priority messages will be delivered first.

Producer connection closing...
```

**Consumer:**
```
=== Priority Queue Demo ===

Waiting for messages... (Press Ctrl+C to exit)

[RECEIVED] Priority 10: URGENT: Security Alert
  From: security@company.com | To: user4@example.com
  Body: Unusual login activity detected on your account!

[RECEIVED] Priority 8: Password Reset Request
  From: alerts@company.com | To: user3@example.com
  Body: Someone requested to reset your password.

[RECEIVED] Priority 6: Payment Due Reminder
  From: billing@company.com | To: user6@example.com
  Body: Your payment is due in 3 days.

[RECEIVED] Priority 5: Your Order Confirmation
  From: support@company.com | To: user2@example.com
  Body: Your order #12345 has been confirmed.

[RECEIVED] Priority 2: System Maintenance Notice
  From: updates@company.com | To: user5@example.com
  Body: Scheduled maintenance this weekend.

[RECEIVED] Priority 1: Weekly Newsletter
  From: newsletter@company.com | To: user1@example.com
  Body: Check out this week's updates!
```

## Priority Levels

| Priority | Level | Use Case |
|----------|-------|----------|
| **10** | Critical | Security alerts, urgent notifications, system failures |
| **8-9** | High | Password resets, account changes, fraud alerts |
| **5-7** | Medium | Order confirmations, payment reminders, shipping updates |
| **3-4** | Low | Marketing emails, non-urgent notifications |
| **1-2** | Very Low | Newsletters, updates, general communications |

### Example Priority Scenarios

```javascript
const messages = [
    {
        subject: "Account Hacked!",
        priority: 10,  // CRITICAL - Process immediately
    },
    {
        subject: "Password Reset",
        priority: 8,   // HIGH - Process soon
    },
    {
        subject: "Order Shipped",
        priority: 5,   // MEDIUM - Normal processing
    },
    {
        subject: "Weekly Newsletter",
        priority: 1,   // LOW - Process when free
    }
];
```

## Use Cases

### When to Use Priority Queue

1. **Incident Management**: Critical alerts before routine notifications
2. **E-commerce**: Order confirmations before marketing emails
3. **Customer Support**: VIP customer requests ahead of regular tickets
4. **Healthcare**: Emergency notifications before appointment reminders
5. **Financial Services**: Fraud alerts before account statements

### Real-World Examples

| Scenario | Priority | Example Messages |
|----------|----------|------------------|
| **Security** | 10 | Account compromise, unauthorized access |
| **Transactions** | 8-9 | Payment processing, fraud detection |
| **Orders** | 5-7 | Confirmations, shipping updates |
| **Marketing** | 1-3 | Newsletters, promotions, offers |

### Code Example: Multiple Priority Levels

```javascript
// Send messages with different priorities
const messages = [
    { subject: "Security Alert", priority: 10, type: "critical" },
    { subject: "New Order", priority: 6, type: "transaction" },
    { subject: "Product Update", priority: 3, type: "marketing" }
];

messages.forEach(msg => {
    channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(msg)), {
        priority: msg.priority
    });
});
```

## Comparison with Standard Queues

| Feature | Standard Queue | Priority Queue |
|---------|---------------|----------------|
| **Delivery Order** | FIFO (First In, First Out) | Highest priority first |
| **Message Ordering** | Preserved | Reordered by priority |
| **Use Case** | Simple task queuing | Urgent vs routine tasks |
| **Complexity** | Simple | Slightly more complex |

### When to Use Each

- ✅ Use **Standard Queue** when all messages have equal importance
- ✅ Use **Priority Queue** when some messages are more urgent than others

## Queue Durability

In this demo, queues are created with `durable: false`:

```javascript
await channel.assertQueue(QUEUE_NAME, {
    durable: false,
    arguments: {
        "x-max-priority": 10
    }
})
```

### Durable vs Non-Durable

| Property | Durable | Non-Durable |
|----------|---------|-------------|
| **Survives broker restart** | Yes | No |
| **Use Case** | Production messages | Development/testing |
| **Performance** | Slightly slower | Faster |

**For production**, use `durable: true`:
```javascript
await channel.assertQueue(QUEUE_NAME, {
    durable: true,
    arguments: {
        "x-max-priority": 10
    }
})
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

### Messages Not Delivered in Priority Order
- Verify `x-max-priority` is set on the queue
- Ensure `priority` is set in `sendToQueue()` options
- Check that priority values are within the defined range (0 to x-max-priority)

### Queue Declaration Error
```
{ error: { name: 'Error', message: 'x-max-priority must be an integer between 0 and 255' } }
```
**Solution:** Ensure `x-max-priority` is an integer between 0-255:
```javascript
arguments: {
    "x-max-priority": 10  // Correct: integer between 0-255
}
```

### Consumer Not Receiving Messages
- Check that consumer is running before producer sends messages
- Verify queue name matches between producer and consumer
- Ensure `channel.ack(message)` is called after processing

### Priority Not Working
If messages are still delivered FIFO instead of by priority:
1. Verify queue was declared with `x-max-priority`
2. Check that `priority` option is set in `sendToQueue()`
3. Restart the consumer after queue configuration changes

## Advanced: Multiple Consumers

For load balancing with priority queues, you can have multiple consumers:

```javascript
// All consumers receive messages from the same priority queue
// Messages are distributed round-robin among consumers
// BUT still delivered in priority order

channel.consume(QUEUE_NAME, (message) => {
    // Process message
    channel.ack(message);
});
```

### Important Note
When using multiple consumers on a priority queue, messages are still delivered in priority order, but processing is distributed among consumers.

## Combining with Exchanges

Priority queues can also be used with exchanges:

```javascript
// Create a priority queue bound to an exchange
await channel.assertExchange("my_exchange", "direct", { durable: false });
await channel.assertQueue(QUEUE_NAME, {
    durable: false,
    arguments: { "x-max-priority": 10 }
});
await channel.bindQueue(QUEUE_NAME, "my_exchange", "priority_messages");

// Publish with priority through exchange
channel.publish("my_exchange", "priority_messages", Buffer.from(message), {
    priority: 5
});
```

## Additional Resources

- [RabbitMQ Priority Queue Documentation](https://www.rabbitmq.com/priority.html)
- [RabbitMQ Queues Documentation](https://www.rabbitmq.com/tutorials/amqp-concepts.html#queues)
- [amqplib npm package](https://www.npmjs.com/package/amqplib)


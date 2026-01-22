# Lazy Queue Demo

[![RabbitMQ](https://img.shields.io/badge/RabbitMQ-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)](https://www.rabbitmq.com)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Lazy-Queue](https://img.shields.io/badge/Queue-Lazy-blue?style=for-the-badge)](#)
[![Disk-Based](https://img.shields.io/badge/Storage-Disk-green?style=for-the-badge)](#)

This project demonstrates how to use RabbitMQ's **Lazy Queue** feature for efficient message storage with minimal memory usage.

**Author:** [saranzafar](https://github.com/saranzafar)

## What is a Lazy Queue?

A **Lazy Queue** is a RabbitMQ queue type that stores messages on disk as much as possible, minimizing memory usage. Messages are only loaded into memory when they need to be delivered to consumers.

### Key Features:
- **Disk-Based Storage**: Messages stored on disk by default
- **Memory Efficient**: Minimal RAM usage even with large message backlog
- **High Throughput**: Optimized for storing large volumes of messages
- **Persistent Messages**: Messages survive broker restart

## How It Works

### Queue Configuration

```javascript
// Create a lazy queue
await channel.assertQueue(queueName, {
    durable: true,
    arguments: {
        'x-queue-mode': 'lazy'  // Store messages on disk
    }
})
```

### File Structure

| File | Description |
|------|-------------|
| `producer.js` | Publishes messages to the lazy queue |
| `consumer.js` | Consumes messages from the lazy queue |

### Lazy Queue Logic

```
Producer publishes message
        ↓
   [Lazy Queue]
        ↓
   Message stored on disk
        ↓
   Consumer connects
        ↓
   Message loaded to memory
        ↓
   Message delivered to consumer
```

#### Producer (producer.js)
```javascript
// Create lazy queue
await channel.assertQueue(queueName, {
    durable: true,
    arguments: {
        'x-queue-mode': 'lazy'
    }
})

// Publish persistent message
channel.publish(exchangeName, routingKey, Buffer.from(message), {
    persistent: true  // Message survives broker restart
})
```

#### Consumer (consumer.js)
```javascript
// Connect to lazy queue
await channel.assertQueue(queueName, {
    durable: true,
    arguments: {
        'x-queue-mode': 'lazy'
    }
})

// Consume messages
channel.consume(queueName, (msg) => {
    if (msg !== null) {
        console.log(`Received: ${msg.content.toString()}`)
        channel.ack(msg)
    }
})
```

### Message Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      PRODUCER (producer.js)                     │
│  Publishes persistent messages to the lazy queue:               │
│  - Messages are stored on disk immediately                      │
│  - Minimal memory usage                                         │
│  - Messages survive broker restart                              │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ publish() with persistent: true
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              lazy_notifications_queue                           │
│              (x-queue-mode: lazy)                               │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Message Storage Strategy:                              │   │
│  │  ✓ Messages stored on disk                              │   │
│  │  ✓ Only loaded to memory when delivered                 │   │
│  │  ✓ Minimal RAM usage                                    │   │
│  │  ✓ Survives broker restart                              │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ Consumer requests message
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     CONSUMER (consumer.js)                      │
│                                                                  │
│  [MESSAGE LOADED FROM DISK]                                     │
│  [MESSAGE DELIVERED]                                            │
│  Received: Hello, this is a lazy notification message!          │
└─────────────────────────────────────────────────────────────────┘
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

Make sure RabbitMQ is running:

```bash
# For Linux (systemd)
sudo systemctl start rabbitmq-server

# For macOS (Homebrew)
brew services start rabbitmq

# For Docker
docker run --name rabbitmq -p 5672:5672 -p 15672:15672 -d rabbitmq:management
```

### Step 2: Start the Consumer

```bash
# Terminal 1 - Start the consumer
node lazy-queue/consumer.js
```

You should see output like:
```
Waiting for messages in lazy_notifications_queue. To exit press CTRL+C
```

### Step 3: Run the Producer

```bash
# Terminal 2 - Run the producer
node lazy-queue/producer.js
```

### Expected Output

**Producer:**
```
Sent message: Hello, this is a lazy notification message!
```

**Consumer:**
```
Waiting for messages in lazy_notifications_queue. To exit press CTRL+C
Received message: Hello, this is a lazy notification message!
```

## Use Cases

### When to Use Lazy Queue

1. **Batch Processing**: Large volumes of messages processed in batches
2. **Audit Logging**: Persistent logs that need to survive restarts
3. **Event Sourcing**: Store events for replay
4. **Background Jobs**: Jobs processed asynchronously
5. **Message Backlog**: Queues with large message buildup

### Real-World Examples

| Scenario | Benefit |
|----------|---------|
| **Notification System** | Store millions of notifications with minimal RAM |
| **Order Processing** | Persistent orders survive broker restarts |
| **Audit Trail** | All actions logged and stored on disk |
| **Data Migration** | Large datasets transferred with disk-based storage |
| **Backup Queues** | Messages preserved until manually processed |

### Comparison with Default Queues

| Feature | Default Queue | Lazy Queue |
|---------|---------------|------------|
| **Storage** | Memory first, disk overflow | Disk first |
| **Memory Usage** | Higher with large backlog | Minimal |
| **Throughput** | Faster for small messages | Optimized for volume |
| **Latency** | Lower for immediate delivery | Slight delay for disk I/O |
| **Message Size** | Limited by available RAM | Supports large messages |
| **Restart Survival** | Messages may be lost | All messages preserved |

### When to Choose Each

- ✅ Use **Lazy Queue** when:
  - Large message volumes expected
  - Memory is limited
  - Messages must survive broker restart
  - Messages are processed in batches
  - Large message payloads

- ✅ Use **Default Queue** when:
  - Low message volume
  - Minimal latency required
  - Messages don't need to survive restart
  - Small message payloads

## Queue Durability

In this demo, queues are created with `durable: true`:

```javascript
await channel.assertQueue(queueName, {
    durable: true,
    arguments: {
        'x-queue-mode': 'lazy'
    }
})
```

### Durability Options

| Property | Durable | Non-Durable |
|----------|---------|-------------|
| **Survives broker restart** | Yes | No |
| **Queue survives restart** | Yes | No |
| **Message persistence** | Optional | Not available |
| **Use Case** | Production, critical messages | Development, temporary queues |

### Message Persistence

Messages are published with `persistent: true` for maximum durability:

```javascript
channel.publish(exchangeName, routingKey, Buffer.from(message), {
    persistent: true  // Message written to disk
})
```

## Performance Considerations

### Lazy Queue Advantages

```javascript
// Optimized for high-volume scenarios
await channel.assertQueue('high_volume_queue', {
    durable: true,
    arguments: {
        'x-queue-mode': 'lazy',
        'x-max-length': 1000000,  // Limit queue size
        'x-overflow': 'reject-publish-dlx'  // Handle overflow
    }
})
```

### Configuration Options

| Option | Description | Example |
|--------|-------------|---------|
| `x-queue-mode` | Queue storage mode | `'lazy'` or `'default'` |
| `x-max-length` | Maximum queue size | `1000000` |
| `x-max-length-bytes` | Maximum queue size in bytes | `10737418240` (10GB) |
| `x-overflow` | Overflow behavior | `'reject-publish-dlx'` |

## Troubleshooting

### Connection Refused

```bash
# Error: connect ECONNREFUSED 127.0.0.1:5672

# Solution: Ensure RabbitMQ is running
rabbitmqctl status
sudo systemctl start rabbitmq-server
```

### Queue Not Found

```javascript
// Error: NOT_FOUND - no queue 'queue_name'

# Solution: Declare queue before consuming
await channel.assertQueue(queueName, {
    durable: true,
    arguments: { 'x-queue-mode': 'lazy' }
})
```

### Message Not Delivered

- Check that consumer is running before producer sends messages
- Verify exchange and queue bindings
- Ensure `persistent: true` is set on published messages
- Check queue mode is correctly set to `'lazy'`

### High Disk Usage

**Solution:** Implement queue limits:
```javascript
await channel.assertQueue(queueName, {
    durable: true,
    arguments: {
        'x-queue-mode': 'lazy',
        'x-max-length': 100000,  // Limit to 100k messages
        'x-overflow': 'reject-publish-dlx'
    }
})
```

## Advanced: Combining with Other Features

### Lazy Queue with Dead Letter Exchange

```javascript
// Create lazy queue with DLX
await channel.assertQueue('lazy_with_dlx', {
    durable: true,
    arguments: {
        'x-queue-mode': 'lazy',
        'x-dead-letter-exchange': 'dlx_exchange',
        'x-dead-letter-routing-key': 'dead_letter'
    }
})
```

### Lazy Queue with Priority

```javascript
// Lazy queue with priority support
await channel.assertQueue('lazy_priority_queue', {
    durable: true,
    arguments: {
        'x-queue-mode': 'lazy',
        'x-max-priority': 10
    }
})
```

## Monitoring Lazy Queues

Access RabbitMQ Management UI at **http://localhost:15672** to monitor:

| Metric | Description |
|--------|-------------|
| **Messages** | Total messages in queue |
| **Ready** | Messages ready for delivery |
| **Unacked** | Messages delivered but not acknowledged |
| **Memory** | Memory used by queue |
| **Disk Reads** | Number of messages read from disk |

## Additional Resources

- [RabbitMQ Lazy Queues Documentation](https://www.rabbitmq.com/lazy-queues.html)
- [RabbitMQ Queue Options](https://www.rabbitmq.com/queues.html)
- [RabbitMQ Durability](https://www.rabbitmq.com/persistence-conf.html)
- [amqplib npm package](https://www.npmjs.com/package/amqplib)


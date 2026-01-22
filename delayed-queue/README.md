# Delayed Queue Demo

[![RabbitMQ](https://img.shields.io/badge/RabbitMQ-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)](https://www.rabbitmq.com)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Delayed-Exchange](https://img.shields.io/badge/Plugin-Delayed_Message_Exchange-red?style=for-the-badge)](https://github.com/rabbitmq/rabbitmq-delayed-message-exchange)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com)

This project demonstrates how to use RabbitMQ's **Delayed Message Exchange** plugin for scheduling messages to be delivered after a specified delay.

**Author:** [saranzafar](https://github.com/saranzafar)

## What is a Delayed Queue?

A **Delayed Queue** uses the RabbitMQ Delayed Message Exchange plugin to schedule messages for future delivery. Messages are held by the plugin for a specified delay before being routed to their destination queues.

### Key Features:
- **Message Scheduling**: Delay messages for seconds, minutes, or hours
- **Amazon Order Processing**: Perfect for order processing workflows
- **Batch Processing**: Delay orders before processing
- **No TTL Limitations**: More reliable than message TTL approach

## Prerequisites

1. **Docker** installed and running
2. **Docker Compose** installed
3. **Node.js** (v12 or higher recommended)
4. **Delayed Message Exchange Plugin** (included in Docker setup)

## Installation

### Step 1: Clone and Setup

```bash
# Navigate to project root
cd /media/saran/Development/play-ground/rabbitmq

# Install dependencies
npm install
```

### Step 2: Download Delayed Message Exchange Plugin

The plugin is automatically included in the Docker setup. If you need to download manually:

```bash
# Download the plugin from releases
# Visit: https://github.com/rabbitmq/rabbitmq-delayed-message-exchange/releases

# For RabbitMQ 4.x, download:
# rabbitmq_delayed_message_exchange-4.2.0.ez

# Enable the plugin (if running locally)
rabbitmq-plugins enable rabbitmq_delayed_message_exchange
```

### Step 3: Start RabbitMQ with Docker

```bash
# Start RabbitMQ with delayed message exchange plugin
docker compose up -d

# Verify RabbitMQ is running
docker ps

# Access Management UI
# Open: http://localhost:15672
# Default credentials: guest / guest
```

**Port Explanation:**
- `5672` - AMQP protocol port (for applications)
- `15672` - HTTP management API and UI

## How It Works

### Exchange Configuration

```javascript
// Create a delayed message exchange
await channel.assertExchange(EXCHANGE_NAME, "x-delayed-message", {
    durable: false,
    arguments: {
        "x-delayed-type": "direct"  // The underlying exchange type
    }
})

// Send a delayed message
channel.publish(EXCHANGE_NAME, ROUTING_KEY, Buffer.from(message), {
    headers: {
        "x-delay": 5000  // Delay in milliseconds (5 seconds)
    }
})
```

### File Structure

| File | Description |
|------|-------------|
| `producer.js` | Creates Amazon orders and sends to delayed queue |
| `consumer.js` | Processes orders after delay expires |

### Delayed Queue Logic

```
Amazon Order Created
        ↓
   [Order Exchange (x-delayed-message)]
        ↓
   Message held with x-delay header
        ↓
   Wait for delay (3-7 seconds)
        ↓
   Message routed to order queue
        ↓
   [Order Processing Queue]
        ↓
   Consumer updates order status
```

#### Producer (producer.js)
```javascript
// Create delayed message exchange
await channel.assertExchange(EXCHANGE_NAME, "x-delayed-message", {
    durable: false,
    arguments: {
        "x-delayed-type": "direct"
    }
})

// Send message with delay
channel.publish(EXCHANGE_NAME, ROUTING_KEY, Buffer.from(JSON.stringify(order)), {
    headers: {
        "x-delay": order.delay  // Delay in milliseconds
    }
})
```

#### Consumer (consumer.js)
```javascript
// Create the order processing queue
await channel.assertQueue(QUEUE_NAME, { durable: false })

// Bind queue to exchange
await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, ROUTING_KEY)

// Consume messages
channel.consume(QUEUE_NAME, (message) => {
    if (message !== null) {
        const order = JSON.parse(message.content)
        console.log(`Order Processed: ${order.orderId}`)
        channel.ack(message)
    }
})
```

### Message Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRODUCER (producer.js)                       │
│  Creates Amazon orders with different processing delays:        │
│  - ORD-001: 3 seconds delay                                     │
│  - ORD-002: 5 seconds delay                                     │
│  - ORD-003: 7 seconds delay                                     │
│  - ORD-004: 4 seconds delay                                     │
│  - ORD-005: 6 seconds delay                                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ publish() with x-delay header
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                  order_exchange                                  │
│                  (x-delayed-message)                            │
│                                                                  │
│  Messages are held by the plugin for their specified delay      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ After delay expires
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                 order_processing_queue                           │
│                                                                  │
│  Messages delivered in delay order:                              │
│  1. ORD-001 (3s)  2. ORD-004 (4s)  3. ORD-002 (5s)              │
│  4. ORD-005 (6s)  5. ORD-003 (7s)                                │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ Consumer receives messages
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   CONSUMER (consumer.js)                        │
│                                                                  │
│  [ORDER PROCESSED] ORD-001 - Wireless Headphones                │
│  [ORDER PROCESSED] ORD-004 - Laptop Stand                       │
│  [ORDER PROCESSED] ORD-002 - Smart Watch                        │
│  [ORDER PROCESSED] ORD-005 - USB Hub                            │
│  [ORDER PROCESSED] ORD-003 - Bluetooth Speaker                  │
└─────────────────────────────────────────────────────────────────┘
```

## Running the Demo

### Step 1: Start RabbitMQ with Docker

```bash
# Start RabbitMQ with delayed message exchange plugin
docker compose up -d

# Check if RabbitMQ is running
docker ps

# You should see:
# CONTAINER ID   IMAGE           COMMAND                  STATUS
# abc123def456   rabbitmq:3.12   "docker-entrypoint.s…"   Up 5 seconds
```

### Step 2: Start the Consumer

```bash
# Terminal 1 - Start the consumer
node delayed-queue/consumer.js
```

You should see output like:
```
Starting Order Status Consumer...
Order Processing Consumer Started...
Waiting for orders to process...
```

### Step 3: Run the Producer

```bash
# Terminal 2 - Run the producer
node delayed-queue/producer.js
```

### Expected Output

**Producer:**
```
=== Amazon Order Processing - Delayed Queue Demo ===

Batch Creating Orders...
Orders will be processed after their delay expires

[ORDER CREATED] ORD-001 - Wireless Headphones
   Customer: John Doe | Batch: BATCH-001
   Delay: 3000ms | Will process at: 10:30:03 AM

[ORDER CREATED] ORD-002 - Smart Watch
   Customer: Jane Smith | Batch: BATCH-001
   Delay: 5000ms | Will process at: 10:30:05 AM

[ORDER CREATED] ORD-003 - Bluetooth Speaker
   Customer: Bob Johnson | Batch: BATCH-001
   Delay: 7000ms | Will process at: 10:30:07 AM

[ORDER CREATED] ORD-004 - Laptop Stand
   Customer: Alice Brown | Batch: BATCH-002
   Delay: 4000ms | Will process at: 10:30:04 AM

[ORDER CREATED] ORD-005 - USB Hub
   Customer: Charlie Wilson | Batch: BATCH-002
   Delay: 6000ms | Will process at: 10:30:06 AM

All orders sent to delayed queue!
Waiting for orders to be processed...
```

**Consumer:**
```
Starting Order Status Consumer...
Order Processing Consumer Started...
Waiting for orders to process...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ORDER PROCESSED: ORD-001
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Item: Wireless Headphones
   Customer: John Doe
   Price: $79.99
   Batch ID: BATCH-001
   Status: pending → processing
   Received at: 10:30:03 AM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Database Updated: Order ORD-001 status changed to 'processing'
   Order ORD-001 is now ready for fulfillment
```

## Use Cases

### When to Use Delayed Queue

1. **Order Processing**: Delay order processing for batch operations
2. **Scheduled Notifications**: Send reminders at specific times
3. **Retry Logic**: Retry failed operations after delay
4. **Rate Limiting**: Control message flow rate
5. **Time-Based Workflows**: Any workflow requiring time delays

### Real-World Examples

| Scenario | Delay | Use Case |
|----------|-------|----------|
| **Order Confirmation** | 5 minutes | Wait before sending confirmation email |
| **Cart Reminder** | 24 hours | Reminder for abandoned cart |
| **Payment Retry** | 30 seconds | Retry failed payment |
| **Review Request** | 7 days | Ask for review after delivery |
| **Subscription Renewal** | 30 days | Notify before subscription expires |

### Amazon Order Processing Flow

```
1. Customer places order
2. Order sent to delayed queue
3. Wait for batch processing window (e.g., 5 minutes)
4. Process all orders in batch
5. Update order status in database
6. Send order confirmation
```

## Comparison: Delayed Exchange vs Message TTL

| Feature | Delayed Exchange | Message TTL |
|---------|-----------------|-------------|
| **Accuracy** | High precision | May vary |
| **Message Order** | Preserved by delay | FIFO only |
| **Plugin Required** | Yes | No |
| **Memory Usage** | Efficient | Can grow |
| **Complex Delays** | Supported | Limited |

### When to Use Each

- ✅ Use **Delayed Exchange** for precise scheduling and complex workflows
- ✅ Use **Message TTL** for simple timeouts without plugin

## Docker Setup

### Dockerfile

```dockerfile
FROM rabbitmq:3.12-management

# Download and enable delayed message exchange plugin
RUN apt-get update && apt-get install -y wget && \
    wget -q https://github.com/rabbitmq/rabbitmq-delayed-message-exchange/releases/download/v4.2.0/rabbitmq_delayed_message_exchange-4.2.0.ez && \
    mv rabbitmq_delayed_message_exchange-4.2.0.ez /opt/rabbitmq/plugins/ && \
    rabbitmq-plugins enable --offline rabbitmq_delayed_message_exchange

EXPOSE 5672 15672
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  rabbitmq:
    build: .
    container_name: rabbitmq-delayed
    ports:
      - "5672:5672"
      - "15672:15672"
    environment:
      RABBITMQ_DEFAULT_USER: guest
      RABBITMQ_DEFAULT_PASS: guest
    healthcheck:
      test: rabbitmq-diagnostics -q ping
      interval: 30s
      timeout: 10s
      retries: 5
```

### Starting with Docker

```bash
# Build and start RabbitMQ
docker compose up -d

# View logs
docker compose logs -f

# Stop RabbitMQ
docker compose down

# Stop and remove volumes
docker compose down -v
```

## Troubleshooting

### Plugin Not Enabled

If you see this error:
```
{ error: { name: 'Error', message: ' exchange type 'x-delayed-message' not supported' } }
```

**Solution:** Enable the delayed message exchange plugin:
```bash
# Check if plugin is enabled
rabbitmq-plugins list

# Enable the plugin
rabbitmq-plugins enable rabbitmq_delayed_message_exchange

# Restart RabbitMQ
docker compose restart
```

### Connection Refused

```bash
# Error: connect ECONNREFUSED 127.0.0.1:5672

# Solution: Ensure RabbitMQ Docker is running
docker ps
docker compose ps
docker compose start rabbitmq
```

### Plugin Download Failed

If the plugin download fails in Dockerfile:
```bash
# Manually download the plugin
wget https://github.com/rabbitmq/rabbitmq-delayed-message-exchange/releases/download/v4.2.0/rabbitmq_delayed_message_exchange-4.2.0.ez

# Copy to RabbitMQ plugins directory
docker cp rabbitmq_delayed_message_exchange-4.2.0.ez rabbitmq-delayed:/opt/rabbitmq/plugins/

# Enable the plugin
docker exec rabbitmq-delayed rabbitmq-plugins enable rabbitmq_delayed_message_exchange

# Restart RabbitMQ
docker restart rabbitmq-delayed
```

### Message Not Delivered

- Check that consumer is running before producer sends messages
- Verify exchange name and routing key match
- Ensure `x-delay` header is set correctly (in milliseconds)
- Check RabbitMQ management UI for message counts

## Advanced: Multiple Delayed Queues

You can have multiple delayed exchanges for different delay types:

```javascript
// Short delay exchange (up to 1 minute)
await channel.assertExchange("short_delay_exchange", "x-delayed-message", {
    durable: false,
    arguments: { "x-delayed-type": "direct" }
})

// Long delay exchange (up to 24 hours)
await channel.assertExchange("long_delay_exchange", "x-delayed-message", {
    durable: false,
    arguments: { "x-delayed-type": "direct" }
})

// Send to short delay (5 seconds)
channel.publish("short_delay_exchange", "urgent", message, {
    headers: { "x-delay": 5000 }
})

// Send to long delay (24 hours)
channel.publish("long_delay_exchange", "scheduled", message, {
    headers: { "x-delay": 86400000 }  // 24 hours in milliseconds
})
```

## Advanced: Delay Based on Priority

```javascript
const delays = {
    "critical": 1000,    // 1 second
    "high": 5000,        // 5 seconds
    "medium": 30000,     // 30 seconds
    "low": 300000        // 5 minutes
}

// Send message with priority-based delay
channel.publish(EXCHANGE_NAME, ROUTING_KEY, Buffer.from(message), {
    headers: {
        "x-delay": delays[order.priority]
    }
})
```

## Additional Resources

- [RabbitMQ Delayed Message Exchange Plugin](https://github.com/rabbitmq/rabbitmq-delayed-message-exchange)
- [RabbitMQ Plugins Documentation](https://www.rabbitmq.com/plugins.html)
- [RabbitMQ Management Plugin](https://www.rabbitmq.com/management.html)
- [amqplib npm package](https://www.npmjs.com/package/amqplib)
- [RabbitMQ Docker Image](https://hub.docker.com/_/rabbitmq)


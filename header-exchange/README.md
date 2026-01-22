# Header Exchange Demo

[![RabbitMQ](https://img.shields.io/badge/RabbitMQ-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)](https://www.rabbitmq.com)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Exchange-Headers](https://img.shields.io/badge/Exchange-Headers-orange?style=for-the-badge)](https://www.rabbitmq.com/tutorials/amqp-concepts.html#exchanges-headers)
[![Attribute Routing](https://img.shields.io/badge/Routing-Attribute_Based-green?style=for-the-badge)](#)

This project demonstrates how to use RabbitMQ's **Headers Exchange** type for message routing based on message attributes/headers instead of routing keys.

**Author:** [saranzafar](https://github.com/saranzafar)

## What is a Header Exchange?

A **Headers Exchange** is a RabbitMQ exchange type that routes messages based on message header attributes rather than a routing key string. This provides more flexible message routing capabilities compared to direct, fanout, or topic exchanges.

### Key Features:
- Routes based on **multiple header attributes**
- Supports two matching modes:
  - `x-match: all` - AND logic (all headers must match)
  - `x-match: any` - OR logic (at least one header must match)
- Headers can contain arbitrary key-value pairs

## How It Works

### Exchange Configuration
```javascript
const exchange = "header_exchange";
const exchangeType = "headers";
await channel.assertExchange(exchange, exchangeType, { durable: true })
```

### File Structure

| File | Description |
|------|-------------|
| `producer.js` | Publishes messages with various header configurations |
| `newVideoNotifications.js` | Consumer for new video notifications |
| `liveStreamNotifications.js` | Consumer for live stream notifications |
| `commentsLikeNotifications.js` | Consumer for comment/like notifications |

### Message Routing Logic

#### 1. New Video Notifications (AND Logic)
**Publisher:**
```javascript
announceNewProduct(
  { "x-match": "all", "notification-type": "new_video", "content_type": "video" },
  "New music video uploaded"
)
```
**Consumer:**
```javascript
await channel.bindQueue(q.queue, exchange, "", {
    "x-match": "all", // Match ALL headers
    "notification-type": "new_video",
    "content_type": "video"
})
```
**Behavior:** Message is delivered only if BOTH `notification-type=new_video` AND `content_type=video`.

#### 2. Live Stream Notifications (AND Logic)
**Publisher:**
```javascript
announceNewProduct(
  { "x-match": "all", "notification-type": "live-stream", "content_type": "gaming" },
  "Gaming live stream started!"
)
```
**Consumer:**
```javascript
await channel.bindQueue(q.queue, exchange, "", {
    "x-match": "all", // Match ALL headers
    "notification-type": "live-stream",
    "content_type": "gaming"
})
```
**Behavior:** Message is delivered only if BOTH `notification-type=live-stream` AND `content_type=gaming`.

#### 3. Comment/Like Notifications (OR Logic)
**Publisher:**
```javascript
announceNewProduct(
  { "x-match": "any", "notification-type-comment": "comment", "content_type": "vlog" },
  "New comment on your vlog!"
)
announceNewProduct(
  { "x-match": "any", "notification-type-like": "like", "content_type": "vlog" },
  "Someone liked your comment!"
)
```
**Consumer:**
```javascript
// First binding - for comment notifications
await channel.bindQueue(q.queue, exchange, "", {
    "x-match": "any", // Match ANY header
    "notification-type-comment": "comment",
    "content_type": "vlog"
})

// Second binding - for like notifications
await channel.bindQueue(q.queue, exchange, "", {
    "x-match": "any", // Match ANY header
    "notification-type-like": "like",
    "content_type": "vlog"
})
```
**Behavior:** Message is delivered if EITHER `notification-type-comment=comment` OR `notification-type-like=like` (combined with `content_type=vlog`).

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
# Terminal 1 - New Video Consumer
node header-exchange/newVideoNotifications.js

# Terminal 2 - Live Stream Consumer
node header-exchange/liveStreamNotifications.js

# Terminal 3 - Comments/Likes Consumer
node header-exchange/commentsLikeNotifications.js
```

You should see output like:
```
Waiting for new video notifications: amq.gen-xxxxxxxxxxxx
Waiting for live stream notifications: amq.gen-xxxxxxxxxxxx
Waiting for matching notifications: amq.gen-xxxxxxxxxxxx
```

### Step 3: Run the Producer

```bash
node header-exchange/producer.js
```

### Expected Output

**Producer:**
```
Sent notification!
Sent notification!
Sent notification!
Sent notification!
```

**Consumers:**
```
Received new video notification: New music video uploaded
Received live stream notification: Gaming live stream started!
Received comment/like notification: New comment on your vlog!
Received comment/like notification: Someone liked your comment!
```

## Use Cases

### When to Use Header Exchange

1. **Complex Routing Logic**: When you need to route based on multiple attributes
2. **Attribute-Based Routing**: When routing depends on message metadata rather than topic patterns
3. **AND/OR Logic Requirements**: When you need both AND and OR matching capabilities

### Real-World Examples

| Scenario | Headers |
|----------|---------|
| **Priority Messages** | `{ "x-match": "all", "priority": "high", "type": "alert" }` |
| **Region-Based Routing** | `{ "x-match": "any", "region": "US", "region": "EU", "region": "APAC" }` |
| **Content Type Filtering** | `{ "x-match": "all", "format": "video", "quality": "4k" }` |
| **Multi-Criteria Notifications** | `{ "x-match": "all", "user-tier": "premium", "category": "sports" }` |

## Comparison with Other Exchanges

| Exchange Type | Routing Based On | Best For |
|---------------|------------------|----------|
| **Direct** | Exact routing key match | Simple one-to-one routing |
| **Topic** | Routing key patterns (wildcards) | Pattern-based routing |
| **Fanout** | Broadcast to all queues | Pub/Sub broadcasting |
| **Headers** | Multiple header attributes | Complex attribute-based routing |

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

### No Messages Received
- Check that all consumers are running before the producer
- Verify header attributes match exactly (case-sensitive)
- Ensure exchange name is consistent across all files

### Consumer Queue Name Shows `amq.gen-xxxxx`
This is expected behavior. The `assertQueue("", { exclusive: true })` creates an auto-generated queue name. The queue will be deleted when the connection closes.

## Additional Resources

- [RabbitMQ Headers Exchange Documentation](https://www.rabbitmq.com/tutorials/amqp-concepts.html#exchanges-headers)
- [amqplib npm package](https://www.npmjs.com/package/amqplib)


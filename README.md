# RabbitMQ Exchange Types Demo

[![RabbitMQ](https://img.shields.io/badge/RabbitMQ-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)](https://www.rabbitmq.com)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![AMQP](https://img.shields.io/badge/AMQP-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)](https://www.rabbitmq.com/amqp-0-9-1.html)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com)

A comprehensive, hands-on guide to understanding and implementing all four RabbitMQ exchange types with real-world examples and ready-to-run code.

**Author:** [saranzafar](https://github.com/saranzafar)

---

## Quick Navigation

| [Direct Exchange](direct-exchange/README.md) | [Topic Exchange](topics-exchange/README.md) | [Fanout Exchange](fanout-exchange/README.md) | [Headers Exchange](header-exchange/README.md) | [Priority Queue](priority-queue/README.md) | [Delayed Queue](delayed-queue/README.md) |
| :---: | :---: | :---: | :---: | :---: | :---: |
| Exact Match | Wildcard Patterns | Broadcast | Header Attributes | Priority-Based Delivery | Delayed Message Scheduling |

## Table of Contents

- [What is RabbitMQ?](#what-is-rabbitmq)
- [What are RabbitMQ Exchanges?](#what-are-rabbitmq-exchanges)
- [Exchange Types Covered](#exchange-types-covered)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Exchange Types Explained](#exchange-types-explained)
- [Running the Demos](#running-the-demos)
- [Best Practices](#best-practices)
- [Contributing](#contributing)
- [License](#license)

---

## What is RabbitMQ?

RabbitMQ is a **message broker** that enables applications to communicate with each other asynchronously. It implements the Advanced Message Queuing Protocol (AMQP) and provides a reliable way for different parts of an application to exchange messages without tight coupling.

### Key Benefits

- **Decoupling**: Producers and consumers work independently
- **Reliability**: Messages can persist, retry, and acknowledge delivery
- **Scalability**: Distribute work across multiple consumers
- **Flexibility**: Multiple messaging patterns and exchange types

---

## What are RabbitMQ Exchanges?

Exchanges are **message routing agents** that receive messages from producers and route them to queues based on rules called **bindings**. Think of an exchange as a postal sorting office — it decides where each message should go based on its routing rules.

### Exchange Anatomy

```
┌─────────────────────────────────────────────────────────────────────┐
│                              PRODUCER                                │
│  Publishes messages with routing information                         │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                             EXCHANGE                                 │
│  Receives messages and routes them based on exchange type           │
│  and binding rules                                                   │
└───────────────┬─────────────────┬─────────────────┬─────────────────┘
                │                 │                 │
                ▼                 ▼                 ▼
┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐
│      QUEUE 1      │ │      QUEUE 2      │ │      QUEUE 3      │
└─────────┬─────────┘ └─────────┬─────────┘ └─────────┬─────────┘
          │                     │                     │
          ▼                     ▼                     ▼
┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐
│    CONSUMER 1     │ │    CONSUMER 2     │ │    CONSUMER 3     │
└───────────────────┘ └───────────────────┘ └───────────────────┘
```

---

## Exchange Types Covered

This repository demonstrates all four standard RabbitMQ exchange types and advanced queue features:

| Exchange Type | Routing Strategy | Best Use Case |
|--------------|------------------|---------------|
| **Direct** | Exact routing key match | Simple point-to-point routing |
| **Topic** | Wildcard pattern matching | Category-based routing |
| **Fanout** | Broadcast to all queues | Pub/Sub broadcasting |
| **Headers** | Multiple attribute matching | Complex attribute-based routing |
| **Priority Queue** | Message priority levels | Urgent vs routine message processing |
| **Delayed Queue** | Time-based message scheduling | Scheduled/delayed message delivery |

---

## Quick Start

### Prerequisites

- **Docker** installed (for RabbitMQ)
- **Node.js** (v12 or higher)
- **npm** or **yarn**

### Start RabbitMQ with Docker

```bash
# Run RabbitMQ container with management plugin
docker run --name rabbitmq -p 5672:5672 -p 15672:15672 -d rabbitmq:management

# Verify RabbitMQ is running
docker ps

# Access Management UI
# Open: http://localhost:15672
# Default credentials: guest / guest
```

**Port Explanation:**

- `5672` - AMQP protocol port (for applications)
- `15672` - HTTP management API and UI

### Install Dependencies

```bash
# Navigate to project root
cd /media/saran/Development/play-ground/rabbitmq

# Install amqplib package
npm install
```

### Run a Demo

```bash
# Example: Run Direct Exchange Demo
node direct-exchange/producer.js

# In another terminal:
node direct-exchange/normalConsumer.js
node direct-exchange/subConsumer.js
```

---

## Project Structure

```
rabbitmq/
├── package.json                  # Project dependencies
├── README.md                     # This file
├── direct-exchange/              # Direct Exchange Demo
│   ├── README.md                 # Detailed documentation
│   ├── producer.js               # Sends messages to specific queues
│   ├── normalConsumer.js         # Consumer for normal users
│   └── subConsumer.js            # Consumer for subscribed users
├── topic-exchange/               # Topic Exchange Demo
│   ├── README.md                 # Detailed documentation
│   ├── producer.js               # Sends messages with routing keys
│   ├── orderNotificationService.js  # Order-related notifications
│   └── paymentNotificationService.js # Payment-related notifications
├── fanout-exchange/              # Fanout Exchange Demo
│   ├── README.md                 # Detailed documentation
│   ├── producer.js               # Broadcasts product launches
│   ├── pushNotification.js       # Push notification consumer
│   └── smsNotification.js        # SMS notification consumer
├── header-exchange/              # Headers Exchange Demo
│   ├── README.md                 # Detailed documentation
│   ├── producer.js               # Sends messages with headers
│   ├── newVideoNotifications.js  # Video notification consumer
│   ├── liveStreamNotifications.js # Live stream consumer
│   └── commentsLikeNotifications.js # Comment/like consumer
├── priority-queue/               # Priority Queue Demo
│   ├── README.md                 # Detailed documentation
│   ├── producer.js               # Sends messages with priority levels
│   └── consumer.js               # Consumes messages in priority order
└── delayed-queue/                # Delayed Queue Demo
    ├── README.md                 # Detailed documentation
    ├── producer.js               # Creates orders with delay
    ├── consumer.js               # Processes delayed orders
    ├── Dockerfile                # RabbitMQ with delayed plugin
    └── docker-compose.yml        # Docker setup for delayed queue
```

---

## Exchange Types Explained

### 1. Direct Exchange

**Routing based on exact routing key matching**

The simplest exchange type that routes messages to queues based on an **exact match** between the message's routing key and the binding key.

```javascript
// Publisher
channel.publish(exchange, "order.placed", message)

// Consumer binding
channel.bindQueue(queue, exchange, "order.placed")
```

**Use Cases:**

- Task queues for specific workers
- User-type routing (free/premium)
- Priority-based message routing
- Region-specific routing

**[Learn More →](direct-exchange/README.md)**

---

### 2. Topic Exchange

**Routing based on wildcard pattern matching**

Routes messages using **wildcard patterns** (`*` for one word, `#` for zero or more words) in dot-separated routing keys.

```javascript
// Publisher
channel.publish(exchange, "order.shipped", message)

// Consumer binding - receives all order messages
channel.bindQueue(queue, exchange, "order.#")
```

**Use Cases:**

- Microservices event routing
- Log aggregation by severity and source
- Notification systems with categories
- IoT device message routing

**[Learn More →](topic-exchange/README.md)**

---

### 3. Fanout Exchange

**Broadcasts messages to all bound queues**

Routes messages to **all queues** bound to the exchange, ignoring routing keys entirely.

```javascript
// Publisher - routing key is ignored
channel.publish(exchange, "", message)

// All bound queues receive the message
channel.bindQueue(queue1, exchange, "")
channel.bindQueue(queue2, exchange, "")
channel.bindQueue(queue3, exchange, "")
```

**Use Cases:**

- Push notifications to multiple channels
- Event broadcasting to multiple services
- Live score updates
- Chat message delivery

**[Learn More →](fanout-exchange/README.md)**

---

### 4. Headers Exchange

**Routing based on message header attributes**

Routes messages based on **multiple header attributes** with `x-match: all` (AND) or `x-match: any` (OR) logic.

```javascript
// Publisher with headers
channel.publish(exchange, "", message, {
    headers: {
        "content-type": "video",
        "priority": "high"
    }
})

// Consumer binding
channel.bindQueue(queue, exchange, "", {
    "x-match": "all",
    "content-type": "video",
    "priority": "high"
})
```

**Use Cases:**

- Complex attribute-based routing
- Multi-criteria filtering
- Content-type and format filtering
- Priority and tier-based routing

**[Learn More →](header-exchange/README.md)**

---

### 5. Priority Queue

**Message delivery based on priority levels**

A RabbitMQ queue type that delivers messages to consumers based on their **priority level**. Messages with higher priority are delivered first, ensuring critical messages are processed before less important ones.

```javascript
// Create a priority queue with max priority of 10
await channel.assertQueue(queueName, {
    durable: false,
    arguments: {
        "x-max-priority": 10  // Priority range: 0-10
    }
})

// Send message with priority
channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
    priority: message.priority  // 0-10, where 10 is highest
})
```

**Priority Levels:**

| Priority | Level | Example |
|----------|-------|---------|
| **10** | Critical | Security alerts, system failures |
| **8-9** | High | Password resets, fraud alerts |
| **5-7** | Medium | Order confirmations, shipping updates |
| **3-4** | Low | Marketing emails, promotions |
| **1-2** | Very Low | Newsletters, general updates |

**Use Cases:**

- Incident management (critical alerts first)
- E-commerce (order confirmations before marketing)
- Customer support (VIP customers ahead of regular)
- Healthcare (emergency notifications first)
- Financial services (fraud alerts before statements)

**[Learn More →](priority-queue/README.md)**

---

### 6. Delayed Queue

**Time-based message scheduling with Delayed Message Exchange Plugin**

The **Delayed Queue** uses the RabbitMQ Delayed Message Exchange plugin to schedule messages for future delivery. Messages are held by the plugin for a specified delay before being routed to their destination queues.

```javascript
// Create a delayed message exchange
await channel.assertExchange(EXCHANGE_NAME, "x-delayed-message", {
    durable: false,
    arguments: {
        "x-delayed-type": "direct"  // The underlying exchange type
    }
})

// Send a delayed message (delay in milliseconds)
channel.publish(EXCHANGE_NAME, ROUTING_KEY, Buffer.from(message), {
    headers: {
        "x-delay": 5000  // 5 seconds delay
    }
})
```

**Amazon Order Processing Flow:**

```
Amazon Order → Batch Creating → Order Processing → Exchange → Queue → Update Order
```

**Delay Examples:**

| Delay | Use Case |
|-------|----------|
| **3-7 seconds** | Batch order processing |
| **5 minutes** | Order confirmation delay |
| **24 hours** | Cart abandonment reminder |
| **30 days** | Subscription renewal notice |

**Use Cases:**

- Scheduled notifications
- Order batch processing
- Retry failed operations
- Time-based workflows
- Rate limiting

**[Learn More →](delayed-queue/README.md)**

---

## Running the Demos

Each exchange type has its own folder with a detailed README and runnable examples.

### Step 1: Start RabbitMQ

```bash
docker run --name rabbitmq -p 5672:5672 -p 15672:15672 -d rabbitmq:management
```

### Step 2: Choose an Exchange Type

```bash
# Option 1: Direct Exchange
cd direct-exchange
# Run producer in one terminal
node producer.js
# Run consumers in other terminals
node normalConsumer.js
node subConsumer.js

# Option 2: Topic Exchange
cd topic-exchange
node producer.js
node orderNotificationService.js
node paymentNotificationService.js

# Option 3: Fanout Exchange
cd fanout-exchange
node producer.js
node pushNotification.js
node smsNotification.js

# Option 4: Headers Exchange
cd header-exchange
node producer.js
node newVideoNotifications.js
node liveStreamNotifications.js
node commentsLikeNotifications.js

# Option 5: Priority Queue
cd priority-queue
# Run consumer in one terminal first
node consumer.js
# Run producer in another terminal
node producer.js

# Option 6: Delayed Queue (Requires Docker)
cd delayed-queue
# Start RabbitMQ with delayed plugin
docker compose up -d
# Run consumer in one terminal
node consumer.js
# Run producer in another terminal
node producer.js
```

### Step 3: View Results

Check the consumer terminals to see messages being received based on the exchange type's routing logic.

### Step 4: Monitor with Management UI

Open **<http://localhost:15672>** in your browser to:

- View queues and exchanges
- Monitor message rates
- Check bindings and connections
- Manage exchanges and queues

---

## Best Practices

### 1. Exchange Configuration

```javascript
// Always use durable exchanges for production
await channel.assertExchange(exchange, type, { durable: true })

// Use auto-delete for temporary exchanges
await channel.assertExchange(exchange, type, { autoDelete: true })
```

### 2. Queue Configuration

```javascript
// Durable queues survive broker restart
await channel.assertQueue(queueName, { durable: true })

// Exclusive queues are auto-deleted when connection closes
await channel.assertQueue("", { exclusive: true })
```

### 3. Message Acknowledgment

```javascript
// Manual acknowledgment (recommended)
channel.consume(queue, (msg) => {
    if (msg) {
        // Process message
        channel.ack(msg)
    }
})
```

### 4. Error Handling

```javascript
try {
    // RabbitMQ operations
} catch (error) {
    console.error('RabbitMQ Error:', error)
    // Implement retry logic
}
```

---

## Exchange Type Selection Guide

```
Need exact routing?                    → Use DIRECT
Need pattern matching?                 → Use TOPIC
Need broadcast to all?                 → Use FANOUT
Need header-based routing?             → Use HEADERS
Need priority-based delivery?          → Use PRIORITY QUEUE
Need time-based scheduling?            → Use DELAYED QUEUE
```

### Quick Decision Tree

```
                    Message Routing Needed
                              │
                              ▼
                   Do all consumers need
                   every message?
                    /         \
                  YES          NO
                   │            │
                   ▼            ▼
               FANOUT       Exact match
                   │         required?
                   │           /    \
                   │         YES     NO
                   │           │       │
                   ▼           ▼       ▼
               (Pub/Sub)   DIRECT   Wildcards
                                       needed?
                                         /   \
                                       YES    NO
                                        │      │
                                        ▼      ▼
                                      TOPIC  Headers or
                                             Priority?
                                              /   \
                                           YES     NO
                                            │      │
                                            ▼      ▼
                                        HEADERS PRIORITY
                                                           QUEUE
```

---

## Common Errors & Solutions

### Connection Refused

```bash
# Error: connect ECONNREFUSED 127.0.0.1:5672

# Solution: Ensure RabbitMQ is running
docker ps
docker start rabbitmq  # if stopped
```

### Queue Not Found

```javascript
// Error: NOT_FOUND - no queue 'queue_name'

// Solution: Declare queue before consuming
await channel.assertQueue(queueName, { durable: false })
```

### Message Not Delivered

- Check exchange and queue bindings
- Verify routing key matches exactly
- Ensure consumer is running before producer
- Check message acknowledgment

---

## Management UI Reference

Access RabbitMQ Management UI at **<http://localhost:15672>**

| Feature | Description |
|---------|-------------|
| **Overview** | System health and metrics |
| **Queues** | Queue status and message count |
| **Exchanges** | Exchange management and bindings |
| **Connections** | Active client connections |
| **Admin** | User management and permissions |

---

## Learning Path

1. **Start with Direct Exchange** - Simplest to understand
2. **Move to Topic Exchange** - Add pattern matching
3. **Explore Fanout Exchange** - Learn pub/sub pattern
4. **Master Headers Exchange** - Complex attribute routing
5. **Use Priority Queue** - Priority-based message delivery
6. **Implement Delayed Queue** - Time-based message scheduling

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the ISC License.

---

## Resources

- [RabbitMQ Official Documentation](https://www.rabbitmq.com/documentation.html)
- [RabbitMQ Tutorials](https://www.rabbitmq.com/tutorials/)
- [amqplib NPM Package](https://www.npmjs.com/package/amqplib)
- [RabbitMQ Management Plugin](https://www.rabbitmq.com/management.html)
- [AMQP 0-9-1 Protocol](https://www.rabbitmq.com/tutorials/amqp-concepts.html)

---

## Happy Messaging! 🚀

If you found this helpful, please ⭐ star the repository!

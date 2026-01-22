const amqp = require("amqplib")

const QUEUE_NAME = "priority_mail_queue";

async function receiveMessages() {
    try {
        const connection = await amqp.connect("amqp://localhost")
        const channel = await connection.createChannel()

        // Assert the same priority queue
        await channel.assertQueue(QUEUE_NAME, {
            durable: false,
            arguments: {
                "x-max-priority": 10
            }
        });

        console.log("Waiting for messages... (Press Ctrl+C to exit)\n");

        // Consume messages from the priority queue
        // RabbitMQ automatically delivers higher priority messages first
        channel.consume(QUEUE_NAME, (message) => {
            if (message !== null) {
                const content = JSON.parse(message.content);
                console.log(`[RECEIVED] Priority ${message.properties.priority}: ${content.subject}`);
                console.log(`  From: ${content.from} | To: ${content.to}`);
                console.log(`  Body: ${content.body}\n`);
                channel.ack(message);
            }
        }, { noAck: false });

    } catch (error) {
        console.log("Error: ", error);
    }
}

// Start producer and consumer
console.log("=== Priority Queue Demo ===\n");
receiveMessages();


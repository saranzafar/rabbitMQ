const amqp = require("amqplib")

const QUEUE_NAME = "priority_mail_queue";

async function sendMail() {
    try {
        const connection = await amqp.connect("amqp://localhost")
        const channel = await connection.createChannel()

        // Assert a priority queue with max priority level of 10
        // Messages with higher priority numbers will be delivered first
        await channel.assertQueue(QUEUE_NAME, {
            durable: false,
            arguments: {
                "x-max-priority": 10  // Priority range: 0-10 (10 = highest)
            }
        });

        // Messages with different priorities
        const messages = [
            {
                to: "user1@example.com",
                from: "newsletter@company.com",
                subject: "Weekly Newsletter",
                body: "Check out this week's updates!",
                priority: 1  // Low priority
            },
            {
                to: "user2@example.com",
                from: "support@company.com",
                subject: "Your Order Confirmation",
                body: "Your order #12345 has been confirmed.",
                priority: 5  // Medium priority
            },
            {
                to: "user3@example.com",
                from: "alerts@company.com",
                subject: "Password Reset Request",
                body: "Someone requested to reset your password.",
                priority: 8  // High priority
            },
            {
                to: "user4@example.com",
                from: "security@company.com",
                subject: "URGENT: Security Alert",
                body: "Unusual login activity detected on your account!",
                priority: 10  // Highest priority
            },
            {
                to: "user5@example.com",
                from: "updates@company.com",
                subject: "System Maintenance Notice",
                body: "Scheduled maintenance this weekend.",
                priority: 2  // Low priority
            },
            {
                to: "user6@example.com",
                from: "billing@company.com",
                subject: "Payment Due Reminder",
                body: "Your payment is due in 3 days.",
                priority: 6  // Medium-high priority
            }
        ];

        // Send all messages to the priority queue
        messages.forEach(message => {
            channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(message)), {
                priority: message.priority  // Set message priority (0-10)
            });
            console.log(`[SENT] Priority ${message.priority}: ${message.subject}`);
        });

        console.log("\nAll messages sent to priority queue!");
        console.log("Higher priority messages will be delivered first.\n");

        // Keep connection open for consumer to receive messages
        setTimeout(() => {
            console.log("Producer connection closing...");
            connection.close();
        }, 2000);

    } catch (error) {
        console.log("Error: ", error);
    }
}

sendMail();


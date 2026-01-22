const amqp = require("amqplib")

async function consumeCommentsLikeNotifications() {
    try {
        const connection = await amqp.connect("amqp://localhost")
        const channel = await connection.createChannel()

        const exchange = "header_exchange";
        const exchangeType = "headers";

        await channel.assertExchange(exchange, exchangeType, { durable: true })

        const q = await channel.assertQueue("", { exclusive: true })
        console.log("Waiting for matching notifications: ", q.queue);

        // For comment notifications
        await channel.bindQueue(q.queue, exchange, "", {
            "x-match": "any",
            "notification-type-comment": "comment",
            "content_type": "vlog"
        })

        // For like notifications
        await channel.bindQueue(q.queue, exchange, "", {
            "x-match": "any",
            "notification-type-like": "like",
            "content_type": "vlog"
        })

        channel.consume(q.queue, (msg) => {
            if (msg !== null) {
                const message = msg.content.toString()
                console.log("Received comment/like notification: ", message);
                channel.ack(msg)
            }
        })

    } catch (error) {
        console.log("Error: ", error);

    }
}
consumeCommentsLikeNotifications()

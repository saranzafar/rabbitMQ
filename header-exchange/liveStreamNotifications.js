const amqp = require("amqplib")

async function consumeLiveStreamNotifications() {
    try {
        const connection = await amqp.connect("amqp://localhost")
        const channel = await connection.createChannel()

        const exchange = "header_exchange";
        const exchangeType = "headers";

        await channel.assertExchange(exchange, exchangeType, { durable: true })

        const q = await channel.assertQueue("", { exclusive: true })
        console.log("Waiting for live stream notifications: ", q.queue);

        await channel.bindQueue(q.queue, exchange, "", {
            "x-match": "all", //match all headers
            "notification-type": "live-stream",
            "content_type": "gaming"
        })

        channel.consume(q.queue, (msg) => {
            if (msg !== null) {
                const message = msg.content.toString()
                console.log("Received live stream notification: ", message);
                channel.ack(msg)
            }
        })

    } catch (error) {
        console.log("Error: ", error);

    }
}
consumeLiveStreamNotifications()
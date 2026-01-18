const amqp = require("amqplib")

async function receiveMessage() {
    try {
        const connection = await amqp.connect("amqp://localhost")
        const channel = await connection.createChannel()
        const exchange = "notification_exchange";
        const queue = "order_queue";

        await channel.assertExchange(exchange, "topic", { durable: true })
        await channel.assertQueue(queue, { durable: true })

        await channel.bindQueue(queue, exchange, "order.*")

        console.log("waiting for message");
        channel.consume(
            queue,
            (msg) => {
                if (msg !== null) console.log(`[Order Notification] Msg was consumed! with routing key as ${msg.fields.routingKey} and content as ${msg.content.toString()}`);
                channel.ack(msg)
            },
            { noAck: false }
        )

    } catch (error) {
        console.log("Error: ", error);
    }
}

receiveMessage()
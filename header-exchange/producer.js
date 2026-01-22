const amqp = require("amqplib")

async function announceNewProduct(headers, message) {
    try {
        const connection = await amqp.connect("amqp://localhost")
        const channel = await connection.createChannel()
        const exchange = "header_exchange";
        const exchangeType = "headers";

        await channel.assertExchange(exchange, exchangeType, { durable: true })

        channel.publish(exchange, "", Buffer.from(message), {
            persistent: true,
            headers: headers
        })
        console.log("Sent nofitication!");

        setTimeout(() => {
            connection.close()
        }, 500);

    } catch (error) {
        console.log("Error: ", error);

    }
}

announceNewProduct({ "x-match": "all", "notification-type": "new_video", "content_type": "video" }, "New music video uploaded")
announceNewProduct({ "x-match": "all", "notification-type": "live-stream", "content_type": "gaming" }, "Gaming live stream started!")
announceNewProduct({ "x-match": "any", "notification-type-comment": "comment", "content_type": "vlog" }, "New comment on your vlog!")
announceNewProduct({ "x-match": "any", "notification-type-like": "like", "content_type": "vlog" }, "comeone liked your comment!")

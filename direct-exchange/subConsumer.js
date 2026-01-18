const amqp = require("amqplib")

async function receiveMessageForSubUser() {
    try {
        const connection = await amqp.connect("amqp://localhost")
        const channel = await connection.createChannel()

        await channel.assertQueue("send_mail_to_sub_user", { durable: false })

        channel.consume("send_mail_to_sub_user", (message) => {
            if (message !== null) {
                console.log("Receive message for sub user: ", JSON.parse(message.content));
                channel.ack(message);
            }
        })

    } catch (error) {
        console.log("Error: ", error);
    }
}

receiveMessageForSubUser()
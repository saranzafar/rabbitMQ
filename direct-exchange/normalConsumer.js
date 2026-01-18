const amqp = require("amqplib")

async function receiveMessageForNormalUser() {
    try {
        const connection = await amqp.connect("amqp://localhost")
        const channel = await connection.createChannel()

        await channel.assertQueue("send_mail_to_normal_user", { durable: false })

        channel.consume("send_mail_to_normal_user", (message) => {
            if (message !== null) {
                console.log("Receive message for normal user: ", JSON.parse(message.content));
                channel.ack(message);
            }
        })

    } catch (error) {
        console.log("Error: ", error);
    }
}

receiveMessageForNormalUser()
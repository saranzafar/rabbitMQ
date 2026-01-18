const amqp = require("amqplib")

async function sendMail() {
    try {
        const connection = await amqp.connect("amqp://localhost")
        const channel = await connection.createChannel()
        const exchange = "main_exchange";
        const routingKeyForSubUser = "send_mail_to_sub_user"
        const routingKeyForNormalUser = "send_mail_to_normal_user"

        const message = {
            to: "abc@gmail.com",
            from: "harish@gmail.com",
            subject: "Thank you",
            body: "Hello ABC!"
        }

        await channel.assertExchange(exchange, "direct", { durable: false })
        await channel.assertQueue("send_mail_to_sub_user", { durable: false });
        await channel.assertQueue("send_mail_to_normal_user", { durable: false });

        await channel.bindQueue("send_mail_to_sub_user", exchange, routingKeyForSubUser)
        await channel.bindQueue("send_mail_to_normal_user", exchange, routingKeyForNormalUser)

        channel.publish(exchange, routingKeyForNormalUser, Buffer.from(JSON.stringify(message)))
        console.log("Mail date ws sent: ", message);

        setTimeout(() => {
            connection.close()
        }, 500);

    } catch (error) {
        console.log("Error: ", error);

    }
}
sendMail()
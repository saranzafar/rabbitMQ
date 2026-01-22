const amqp = require('amqplib');

async function consumeMessages() {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    const queueName = 'lazy_notifications_queue';

    await channel.assertQueue(queueName, {
        durable: true,
        arguments: { 'x-queue-mode': 'lazy' } // Ensure the queue is lazy
    });

    console.log(`Waiting for messages in ${queueName}. To exit press CTRL+C`);

    channel.consume(queueName, (msg) => {
        if (msg !== null) {
            console.log(`Received message: ${msg.content.toString()}`);
            channel.ack(msg);
        }
    }, {
        noAck: false
    });
}

consumeMessages().catch(console.error);
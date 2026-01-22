const amqp = require('amqplib');

async function setup(message) {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    const exchangeName = 'notifications_exchange';
    const queueName = 'lazy_notifications_queue';
    const routingKey = 'notifications.key';

    await channel.assertExchange(exchangeName, 'direct', { durable: true });
    await channel.assertQueue(queueName, {
        durable: true,
        arguments: { 'x-queue-mode': 'lazy' } //store messages on disk as much as possible
    });

    await channel.bindQueue(queueName, exchangeName, routingKey);
    channel.publish(exchangeName, routingKey, Buffer.from(message), { persistent: true });

    console.log(`Sent message: ${message}`);

    setTimeout(() => {
        connection.close();
        process.exit(0);
    }, 500);
}

setup('Hello, this is a lazy notification message!');
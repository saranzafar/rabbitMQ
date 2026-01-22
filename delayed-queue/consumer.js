const amqp = require("amqplib")

// ==============================
// AMAZON ORDER PROCESSING FLOW
// ==============================
// Amazon Order → Batch Creating → Order Processing → Exchange → Queue → Update Order
// ==============================

const EXCHANGE_NAME = "order_exchange";
const QUEUE_NAME = "order_processing_queue";
const ROUTING_KEY = "order.process";

// ==============================
// CONSUMER: Update Order Status
// ==============================
async function updateOrderStatus() {
    try {
        const connection = await amqp.connect("amqp://localhost")
        const channel = await connection.createChannel()

        // Assert the exchange and queue
        await channel.assertExchange(EXCHANGE_NAME, "direct", { durable: false })
        await channel.assertQueue(QUEUE_NAME, { durable: false })
        await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, ROUTING_KEY)

        console.log("Order Processing Consumer Started...")
        console.log("Waiting for orders to process...\n")

        // Consume messages from the order processing queue
        channel.consume(QUEUE_NAME, (message) => {
            if (message !== null) {
                const order = JSON.parse(message.content)
                console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
                console.log(`ORDER PROCESSED: ${order.orderId}`)
                console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
                console.log(`   Item: ${order.item}`)
                console.log(`   Customer: ${order.customer}`)
                console.log(`   Price: $${order.price}`)
                console.log(`   Batch ID: ${order.batchId}`)
                console.log(`   Status: ${order.status} → processing`)
                console.log(`   Received at: ${new Date().toLocaleTimeString()}`)
                console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")
                
                // Simulate updating order status in database
                order.status = "processing"
                console.log(`Database Updated: Order ${order.orderId} status changed to 'processing'`)
                console.log(`   Order ${order.orderId} is now ready for fulfillment\n`)
                
                channel.ack(message)
            }
        }, { noAck: false })

    } catch (error) {
        console.log("Error: ", error)
    }
}

// Start consumer
console.log("Starting Order Status Consumer...\n")
updateOrderStatus()


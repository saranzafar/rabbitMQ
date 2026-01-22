const amqp = require("amqplib")

// ==============================
// AMAZON ORDER PROCESSING FLOW
// ==============================
// Amazon Order → Batch Creating → Order Processing → Exchange → Queue → Update Order
// ==============================

const EXCHANGE_NAME = "order_exchange";
const DELAYED_QUEUE_NAME = "delayed_order_queue";
const ROUTING_KEY = "order.process";

// ==============================
// PRODUCER: Create Amazon Orders
// ==============================
async function createAmazonOrder() {
    try {
        const connection = await amqp.connect("amqp://localhost")
        const channel = await connection.createChannel()

        // Create the main exchange for order processing
        await channel.assertExchange(EXCHANGE_NAME, "direct", { durable: false })

        // Create the delayed queue with TTL (Time To Live)
        // Messages in this queue will be forwarded after expiration
        await channel.assertQueue(DELAYED_QUEUE_NAME, {
            durable: false,
            arguments: {
                "x-message-ttl": 5000,
                "x-dead-letter-exchange": EXCHANGE_NAME,
                "x-dead-letter-routing-key": ROUTING_KEY
            }
        })

        // Simulate batch creating Amazon orders
        const orders = [
            {
                orderId: "ORD-001",
                customer: "John Doe",
                item: "Wireless Headphones",
                price: 79.99,
                status: "pending",
                batchId: "BATCH-001",
                delay: 3000
            },
            {
                orderId: "ORD-002",
                customer: "Jane Smith",
                item: "Smart Watch",
                price: 199.99,
                status: "pending",
                batchId: "BATCH-001",
                delay: 5000
            },
            {
                orderId: "ORD-003",
                customer: "Bob Johnson",
                item: "Bluetooth Speaker",
                price: 49.99,
                status: "pending",
                batchId: "BATCH-001",
                delay: 7000
            },
            {
                orderId: "ORD-004",
                customer: "Alice Brown",
                item: "Laptop Stand",
                price: 39.99,
                status: "pending",
                batchId: "BATCH-002",
                delay: 4000
            },
            {
                orderId: "ORD-005",
                customer: "Charlie Wilson",
                item: "USB Hub",
                price: 29.99,
                status: "pending",
                batchId: "BATCH-002",
                delay: 6000
            }
        ]

        console.log("=== Amazon Order Processing - Delayed Queue Demo ===\n")
        console.log("Batch Creating Orders...")
        console.log("Orders will be processed after their delay expires\n")

        orders.forEach((order) => {
            const message = Buffer.from(JSON.stringify(order))
            channel.sendToQueue(DELAYED_QUEUE_NAME, message, {
                expiration: order.delay.toString()
            })
            console.log(`[ORDER CREATED] ${order.orderId} - ${order.item}`)
            console.log(`   Customer: ${order.customer} | Batch: ${order.batchId}`)
            console.log(`   Delay: ${order.delay}ms | Will process at: ${new Date(Date.now() + order.delay).toLocaleTimeString()}\n`)
        })

        console.log("All orders sent to delayed queue!")
        console.log("Waiting for orders to be processed...\n")

        setTimeout(() => {
            console.log("Producer connection closing...")
            connection.close()
        }, 10000)

    } catch (error) {
        console.log("Error: ", error)
    }
}

// Start producer
console.log("Starting Amazon Order Processing Producer...\n")
createAmazonOrder()


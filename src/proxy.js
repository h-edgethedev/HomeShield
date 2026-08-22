const dns2 = require("dns2")

const { UDPClient } = dns2

const resolve = UDPClient({
    dns: "1.1.1.1",
    port: 53
}) // Cloudflare upstream server requirements

const server = dns2.createServer({
    udp: true,
    handle: async (request, send, rinfo) => {
        const question = request.questions[0]
        console.log(`DNS REQUEST`)
        console.log(`Domain: ${question.name}`)
        console.log(`Type: ${question.type}`)
        console.log(`Client: ${rinfo.address}`)// extracting the questions
        try {
            const response = await resolve(question.name, question.type) //Asking cloudflare for the response
            console.log("Received response from UPstream")
            send(response)//Sending the response back
            console.log("Response sent to Client")
        } catch (error) {
            console.error("DNS lookup failed: ", error)
        }
    }
})

server.on("listening", () => {
    console.log("🛡️ HomeShield DNS Proxy");
    console.log("Listening on 127.0.0.1:5333");
    console.log("Upstream DNS: 1.1.1.1");//Server Listens on dns requests fron this address
})

server.on("requestError", error => {
    console.error("Server error:", error);
});

server.listen({
    udp:{
        port: 5333,
        address: "127.0.0.1"
    }
})//It listens for dns requests from port 5333 and the domain address
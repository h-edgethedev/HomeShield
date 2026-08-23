const { Packet } = require("dns2")
const dns2 = require("dns2")

const blocklist= [
    "ads.example.com",
    "tracker.example.com",
    "pornhub.com"
]

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

        const typeName = Packet.TYPE_NAME[question.type] //converting the type number to a type name
        console.log(`Type name: ${typeName}`) 

        try {
            const response = await resolve(question.name, typeName) //Asking cloudflare for the response
            console.log(`Client request ID: ${request.header.id}`)
            console.log(`Upstream response ID: ${response.header.id}`)
            response.header.id = request.header.id // converting the response id to the client's request id before sending the request to the id
            console.log("Received response from UPstream")
            send(response)//Sending the response back
            console.log("Response sent to Client")
        } 
        catch (error) {
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
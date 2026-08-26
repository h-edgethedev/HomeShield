const fs = require("fs")
const path = require("path")
const { Packet } = require("dns2")
const dns2 = require("dns2")
const { json } = require("stream/consumers")
const { UDPClient } = dns2
require("dotenv").config()

//Loading ENV files
const UPSTREAM_DNS = process.env.UPSTREAM_DNS //|| "10.182.140.164"
const UPSTREAM_PORT = Number(process.env.UPSTREAM_PORT) || 53

// Creating the cache:
const cache = new Map()

const resolve = UDPClient({
    dns: UPSTREAM_DNS,
    port: UPSTREAM_PORT
}) // Cloudflare upstream server requirements

const blocklistData = fs.readFileSync("blocklist.txt", "utf8") //Extracting list of blocked domains from the blocklist.txt file

const blocklist = blocklistData.split("\n").map(domain => domain.trim().toLowerCase()).filter(domain => domain !== "") //Basically just converting the domains in the blocklist to lowercase and filtering empty lines

function isBlocked(domain) {
    return blocklist.some(blockedDomain => {
        return domain === blockedDomain || domain.endsWith("." + blockedDomain)
    })
} //This function is the new one that checks if the domain exists in the blocklist txt file

const server = dns2.createServer({
    udp: true,
    handle: async (request, send, rinfo) => {
        const question = request.questions[0]
        const domain = question.name.toLowerCase()
        //Checking our Blocklist for existing domains
        if (isBlocked(domain)) {
            console.log(`BLOCKED: ${domain}`)
            const response = Packet.createResponseFromRequest(request)
            response.header.rcode = Packet.RCODE.NXDOMAIN
            send(response)
            return
        }
        console.log(`DNS REQUEST`)
        console.log(`Domain: ${question.name}`)
        console.log(`Type: ${question.type}`)
        console.log(`Client: ${rinfo.address}`)// extracting the questions

        const typeName = Packet.TYPE_NAME[question.type] //converting the type number to a type name
        console.log(`Type name: ${typeName}`)

        //Chacking cache if response exists:

        try {
            if (cache.has(domain)) {
                console.log(`Cache Hit: ${domain}`)
                const cachedResponse = cache.get(domain)
                cachedResponse.header.id = request.header.id
                send(cachedResponse)
                return
            }
            console.log(`Cache Miss: ${domain}`)
            const response = await resolve(question.name, typeName) //Asking cloudflare for the response
            console.log(`Client request ID: ${request.header.id}`)
            console.log(`Upstream response ID: ${response.header.id}`)
            //Setting Cache to the requested domain
            cache.set(domain, response)
            console.log(`Cached Domain: ${domain}`)
            response.header.id = request.header.id // converting the response id to the client's request id before sending the request to the id
            console.log("Received response from UPstream")
            send(response)//Sending the response back
            console.log("Response sent to Client")
            // console.log(`Answers: ${JSON.stringify(response.answers)}`)
            console.log("_________________________________________________________\n")
        }
        catch (error) {
            console.error("DNS lookup failed: ", error)
        }
    }
})

server.on("listening", () => {
    console.log("🛡️ HomeShield DNS Proxy");
    console.log("Listening on 0.0.0.0:5333 (all interfaces)");
    console.log(`Upstream DNS: ${UPSTREAM_DNS}\n`);//Server Listens on dns requests fron this address
})

server.on("requestError", error => {
    console.error("Server error:", error);
});

server.on("error", error => {
    console.error("Server error event:", error);
});

try {
    server.listen({
        udp: {
            port: 5333,
            address: "0.0.0.0"
        }
    })
    console.log("Server listen() called successfully");
} catch (error) {
    console.error("Failed to start server:", error);
}

// Keep process alive
process.on("uncaughtException", error => {
    console.error("Uncaught exception:", error);
});

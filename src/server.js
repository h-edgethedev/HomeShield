const dns2 = require("dns2");

const { Packet } = dns2;

const server = dns2.createServer({
    udp: true,

    handle: (request, send, rinfo) => {
        console.log("DNS REQUEST RECEIVED");

        const question = request.questions[0];

        console.log("Domain:", question.name);
        console.log("Type:", question.type);
        console.log("Client:", rinfo.address);

        const response = Packet.createResponseFromRequest(request);

        send(response);
    }
});

server.on("requestError", (error) => {
    console.error("Request error:", error);
});

server.on("listening", () => {
    console.log("HomeShield is listening");
});

server.listen({
    udp: {
        port: 5333,
        address: "0.0.0.0"
    }
});
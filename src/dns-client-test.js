const { UDPClient } = require("dns2");
require("dotenv").config()


const PORT = Number(process.env.PORT)

const resolve = UDPClient({
    dns: "192.168.8.197",
    port: PORT
});

resolve("vercel.app")
    .then(response => {
        console.log("Response received!");
        console.log(response);
    })
    .catch(error => {
        console.error("DNS client error:", error);
    });
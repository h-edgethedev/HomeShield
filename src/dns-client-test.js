const { UDPClient } = require("dns2");
require("dotenv").config()


const PORT = Number(process.env.PORT)

const resolve = UDPClient({
    dns: "192.168.8.198",
    port: PORT
});

resolve("ads.example.com")
    .then(response => {
        console.log("Response received!");
        console.log(response);
    })
    .catch(error => {
        console.error("DNS client error:", error);
    });

const cache = new Map()
cache.set("google.com", "216.58.223.238")
console.log(cache.get("google.com"))
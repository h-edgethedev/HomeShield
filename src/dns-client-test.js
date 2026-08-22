const { UDPClient } = require("dns2");

const resolve = UDPClient({
    dns: "127.0.0.1",
    port: 5333
});

resolve("google.com")
    .then(response => {
        console.log("Response received!");
        console.log(response);
    })
    .catch(error => {
        console.error("DNS client error:", error);
});
const { UDPClient } = require("dns2")

const resolve = UDPClient({
    dns: "1.1.1.1",
    port: 53    
})

resolve("youtube.com")
    .then(response => {
        console.log("Response received from UPSTream DNS: ")
        console.log(response)
    })
    .catch(error => {
        console.error(`DNS error: ${error}`)
    })
const express = require("express")
const path = require("path")
import { getStats } from "../services/tracker"

function startDashboardServer(port = 3000) {
    const app = express()
    app.use(express.static(path.join(__dirname, "../../public")))

    //Json API for polling 
    app.get("/api/stats", (req, res)=>{
        res.json(getStats())
    })
    app.listen(port, ()=>{
        console.log(`Dashboard active at http://localhost:${port}`)
    })
}

module.exports = {startDashboardServer}
const express = require('express')
const path = require('path')
const http = require('http')
const mongo = require('./db')
const app = express()
mongo()

app.use(express.json())
app.use('/api/auth', require('./routes/auth'))

app.get('/main.js', (req,res) => {
    res.sendFile(__dirname + '/public/main.js')
})
app.get('/simplepeer.min.js', (req,res) => {
    res.sendFile(__dirname + '/node_modules/simple-peer/simplepeer.min.js')
})
app.get('/*', (req,res) => {
    res.sendFile(__dirname + '/public/index.html')
})

const httpServer = http.createServer(app)
require('./socket/io')(httpServer)
httpServer.listen(4000, () => {
    console.log("listening to port 4000")
})
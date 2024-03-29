// server.js

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const router = require("./routes/index");
const http = require('http');
const { ValidationError } = require('express-validation');
const WebSocket = require('ws');
const moment = require("moment");
const app = express();
require('events').EventEmitter.defaultMaxListeners = 500;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Allow all origins
  res.header('Access-Control-Allow-Methods', 'GET, POST'); // Allow only GET and POST requests
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});
app.get("/", (req, res) => {
  return res.status(200).json({ message: "Server Running" });
});
app.get("/today", (req, res) => {
  return res.status(200).json({ message: moment().format('YYYY-MM-DD') });
   
});

app.use("/api", router);
app.use(function (err, req, res, next) {
  if (err instanceof ValidationError) {
    return res.status(422).json({ status: "error", message: err.details.body[0].message })
  }
  return res.status(500).json(err)
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const notificationMessage = "Hello! This is your hourly notification.";

wss.on('connection', function connection(ws) {
    console.log('Client connected');

    // Send initial notification on connection
    ws.send(notificationMessage);

    // Handle WebSocket errors
    ws.on('error', function error(err) {
        console.error('WebSocket error:', err);
    });
});
function generateNotification() {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(notificationMessage);
        }
    });
}

// Set up interval to trigger the notification every hour
setInterval(generateNotification, 60 * 1000); 
server.listen(5070, () => {
  console.log(`Server Running here  👉 http://localhost:5070`);
});

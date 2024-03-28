// server.js

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const router = require("./routes/index");
const http = require('http');
const { ValidationError } = require('express-validation');
const setupSocket = require("./config/websoket.config");

const app = express();
require('events').EventEmitter.defaultMaxListeners = 500;
// const corsOptions = {
//   origin: "*",
// };

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

app.use("/api", router);
app.use(function (err, req, res, next) {
  if (err instanceof ValidationError) {
    return res.status(422).json({ status: "error", message: err.details.body[0].message })
  }
  return res.status(500).json(err)
});

const server = http.createServer(app);
const io = setupSocket(server);
function sendNotification(io, notification) {
  io.emit('notification', notification);
}
setInterval(() => {
  const notification = "This is a notification!";
  sendNotification(io, notification);
}, 2000);
server.listen(5070, () => {
  console.log(`Server Running here  👉 http://localhost:5070`);
});

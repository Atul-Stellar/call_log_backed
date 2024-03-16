const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const router = require("./routes/index");

const {  ValidationError } = require('express-validation')
const app = express();
require('events').EventEmitter.defaultMaxListeners = 500;
var corsOptions = {
  origin: "*",
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  console.log("tsting");
  return res.status(200).json({ message: "Server Running" });
});

app.use("/api", router);
app.use(function(err, req, res, next) {
  if (err instanceof ValidationError) {
    return res.status(422).json({status:"error",message:err.details.body[0].message})
  }

  return res.status(500).json(err)
})
const PORT = process.env.PORT || 5070;
app.listen(PORT, () => {
  console.log(`Server Running here  👉 http://localhost:${PORT}`);
});

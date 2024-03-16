const winston = require("winston");
require("winston-daily-rotate-file");

const DBloggedfalied = new winston.transports.DailyRotateFile({
    filename: "./logs/%DATE%/DBlogs.log",
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "30m",
  });
  const DBlogged = winston.createLogger({
    format: winston.format.json(),
    transports: [
        DBloggedfalied,
      new winston.transports.Console({
        colorize: true,
      }),
    ],
  });
  
  module.exports = {
    DBlogged,
  };
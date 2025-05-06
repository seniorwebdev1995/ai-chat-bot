const mongoose = require("mongoose");
const app = require("./app");
const logger = require("./config/logger");
const { createServer } = require("http");
const SocketServer = require("./utils/socket.js");
const cron = require("node-cron");
const newsletterCron = require("./cron/cron.js");
const { sendNewsletter } = require("./services/newsletter.service.js");

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
};
// mongoose.connect(process.env.MONGODB_URL, options).then(() => {
//   logger.info("Connected to MongoDB");
//   const cronExpression = "0 0 0 * * *"; // Cron job will called 12PM every day
//   // const cronExpression = '*/10 * * * * *';
//   const job = cron.schedule(cronExpression, newsletterCron);
//   job.start();
//   newsletterCron();
//   // sendNewsletter();
// });

let server = app;
server.listen(process.env.PORT, () => {
  logger.info(`Listening to port ${process.env.PORT}`);
});

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info("Server closed");
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);

process.on("SIGTERM", () => {
  logger.info("SIGTERM received");
  if (server) {
    server.close();
  }
});

// sendNewsletter();

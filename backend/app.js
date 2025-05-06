const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const httpStatus = require("http-status");
const passport = require("./auth/passport");
const { errorConverter, errorHandler } = require("./middlewares/error");
const ApiError = require("./utils/ApiError");
const routes = require("./routes");
const path = require("path");
const SocketServer = require("./utils/socket.js");
const { createServer } = require("http");

const app = express();

// Socket init

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.use(passport.initialize());

// enable cors
app.use(cors());
app.options("*", cors());

app.use(express.static("public"));

// app.get('*', function (req, res) {
//   res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
// });

const httpSever = createServer(app);
const socketServr = new SocketServer(httpSever);
const socketInstance = socketServr.instance;
app.set("socket", socketInstance);

app.use("/api", routes);

app.use("/", (req, res) => {
  res.send("Server is working");
});

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, "Not found"));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

module.exports = httpSever;

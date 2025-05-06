const { Schema, model } = require("mongoose");

const MessageSchema = new Schema({
  prompt: String,
  answer: String,
});

module.exports = model("Message", MessageSchema);

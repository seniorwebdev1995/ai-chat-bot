const mongoose = require("mongoose");
const { paginate, toJSON } = require("./plugins");

const { Schema } = mongoose;

const templateSchema = new Schema({
  name: {
    type: Schema.Types.String,
    required: true,
  },
  urls: [
    {
      type: Schema.Types.String,
      required: true,
    },
  ],
  messages: [
    {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
  ],
  news: [
    {
      title: {
        type: Schema.Types.String,
      },
      description: {
        type: Schema.Types.String,
      },
      date: {
        type: Schema.Types.String,
      },
      url: {
        type: Schema.Types.String,
      },
    },
  ],
  content: {
    type: Schema.Types.String,
  },
  date: {
    type: Schema.Types.String,
    required: true,
    // 0, 1st day of each month
    // 1, Monday of each week
    // 2, Last day of each month
    // 3,*, specific date of each month
  },
  selected: {
    type: Schema.Types.Boolean,
    required: false,
    default: false,
  },
  createdAt: { type: Date, default: Date.now },
});

// add plugin that converts mongoose to json
templateSchema.plugin(toJSON);
templateSchema.plugin(paginate);

module.exports = mongoose.model("Template", templateSchema);

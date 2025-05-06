const mongoose = require("mongoose");
const { paginate, toJSON } = require("./plugins");

const { Schema } = mongoose;

const newsletterSchema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  emails: [
    {
      type: String,
      required: true,
    },
  ],
  subscribeStatus: {
    type: Schema.Types.Boolean,
    required: true,
    default: true,
  },
  createdAt: { type: Date, default: Date.now },
});

// add plugin that converts mongoose to json
newsletterSchema.plugin(toJSON);
newsletterSchema.plugin(paginate);

module.exports = mongoose.model("Newsletter", newsletterSchema);

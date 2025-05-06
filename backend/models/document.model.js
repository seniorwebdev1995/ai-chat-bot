const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const documentSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  hex: {
    type: String,
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

// add plugin that converts mongoose to json
documentSchema.plugin(toJSON);
documentSchema.plugin(paginate);

/**
 * @typedef Document
 */
module.exports = mongoose.model("Document", documentSchema);

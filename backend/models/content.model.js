const { Schema, model, ObjectId } = require("mongoose");
const User = require("./user.model");
const { toJSON, paginate } = require("./plugins");

const ContentSchema = new Schema(
  {
    userId: {
      type: ObjectId,
      reference: User._id,
    },
    messages: [],
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
ContentSchema.plugin(toJSON);
ContentSchema.plugin(paginate);

/**
 * @typedef User
 */
const Content = model("Content", ContentSchema);

module.exports = Content;

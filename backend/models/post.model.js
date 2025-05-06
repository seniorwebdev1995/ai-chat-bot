const mongoose = require("mongoose");
const { paginate, toJSON } = require("./plugins");

const { Schema } = mongoose;

const postSchema = new Schema({
  content: { type: String, required: true },
  userId: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
  fcCreator: { type: Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
  // likes: { type: Number, default: 0 },
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
});

// add plugin that converts mongoose to json
postSchema.plugin(toJSON);
postSchema.plugin(paginate);

module.exports = mongoose.model("Post", postSchema);

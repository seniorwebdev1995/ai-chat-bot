const mongoose = require("mongoose");
const { paginate, toJSON } = require("./plugins");

const { Schema } = mongoose;

const flightcrewSchema = new Schema({
  fc_name: { type: String, required: true },
  creator: { type: Schema.Types.ObjectId, ref: "User", required: true },
  invited_users: [{ type: Schema.Types.ObjectId, ref: "User", default: null }],
  createdAt: { type: Date, default: Date.now },
});

// add plugin that converts mongoose to json
flightcrewSchema.plugin(toJSON);
flightcrewSchema.plugin(paginate);

module.exports = mongoose.model("Flightcrew", flightcrewSchema);

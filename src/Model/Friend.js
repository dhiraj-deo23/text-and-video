const mongoose = require("mongoose");

const friendSchema = mongoose.Schema(
  {
    friend: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    sentReq: {
      type: Boolean,
      required: true,
      default: false,
    },
    receivedReq: {
      type: Boolean,
      default: false,
      required: true,
    },
    accepted: {
      type: Boolean,
      default: false,
      required: true,
    },
    requestToOrFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Friend = mongoose.model("Friend", friendSchema);

module.exports = Friend;

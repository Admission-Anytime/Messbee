const mongoose = require("mongoose");

const statusSchema = mongoose.Schema(
  {
    // Link status to a specific user/admin so data doesn't mix
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    name: {
      type: String,
      required: [true, "Please add a status name"],
    },
    description: {
      type: String,
      required: [true, "Please add a description"],
    },
    color: {
      type: String,
      required: true,
    },
    createdBy: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Status", statusSchema);
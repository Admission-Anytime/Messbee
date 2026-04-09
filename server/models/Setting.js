const mongoose = require("mongoose");

const settingSchema = mongoose.Schema(
  {
    key: { type: String, required: true, unique: true }, // e.g., 'whatsapp_config'
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    description: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Setting", settingSchema);

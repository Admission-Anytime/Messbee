const express = require("express");
const router = express.Router();
const Setting = require("../models/Setting");

// Get all settings
router.get("/", async (req, res) => {
  try {
    const settings = await Setting.find();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get specific setting by key
router.get("/:key", async (req, res) => {
  try {
    const setting = await Setting.findOne({ key: req.params.key });
    if (!setting) return res.status(404).json({ error: "Setting not found" });
    res.json(setting);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update or create setting
router.post("/", async (req, res) => {
  try {
    const { key, value, description } = req.body;
    const setting = await Setting.findOneAndUpdate(
      { key },
      { value, description },
      { upsert: true, new: true }
    );
    res.json(setting);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

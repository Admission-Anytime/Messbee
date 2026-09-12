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
    const key = req.params.key;

    // Special dynamic resolution for whatsapp_config to ensure connected Meta business account details are returned
    if (key === "whatsapp_config") {
      const Channel = require("../models/Channel");
      const User = require("../models/User");

      // Attempt to resolve tenant from auth token if present
      let tenantId = null;
      let userDoc = null;
      try {
        const jwt = require("jsonwebtoken");
        let token = req.cookies?.accessToken;
        if (!token && req.headers?.authorization?.startsWith("Bearer")) {
          token = req.headers.authorization.split(" ")[1];
        }
        if (token) {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
          if (decoded?.id) {
            userDoc = await User.findById(decoded.id).select("-password").lean();
            tenantId = userDoc?.tenantId || userDoc?._id;
          }
        }
      } catch (authErr) {
        // Token optional, proceed
      }

      let channel = null;
      if (tenantId) {
        channel = await Channel.findOne({
          tenantId,
          activeWhatsappPhoneNumberId: { $exists: true, $ne: null },
          status: { $ne: "disconnected" }
        }).select("+metaAccessToken").lean();

        if (!channel && userDoc?._id && userDoc._id.toString() !== tenantId.toString()) {
          channel = await Channel.findOne({
            tenantId: userDoc._id,
            activeWhatsappPhoneNumberId: { $exists: true, $ne: null },
            status: { $ne: "disconnected" }
          }).select("+metaAccessToken").lean();
        }
      }

      // If no tenant-specific channel, check any active channel
      if (!channel) {
        channel = await Channel.findOne({
          activeWhatsappPhoneNumberId: { $exists: true, $ne: null },
          status: { $ne: "disconnected" }
        }).select("+metaAccessToken").lean();
      }

      const rawSetting = await Setting.findOne({ key: "whatsapp_config" }).lean();
      const settingVal = rawSetting?.value || {};

      const businessAccountId = channel?.metadata?.wabaId
        || userDoc?.whatsappConfig?.wabaId
        || settingVal.businessAccountId
        || "";

      const phoneNumberId = channel?.activeWhatsappPhoneNumberId
        || userDoc?.whatsappConfig?.phoneNumberId
        || settingVal.phoneNumberId
        || "";

      const accessToken = channel?.metaAccessToken
        || userDoc?.whatsappConfig?.accessToken
        || settingVal.accessToken
        || "";

      const verifyToken = settingVal.verifyToken
        || process.env.WHATSAPP_VERIFY_TOKEN
        || "";

      const webhookUrl = settingVal.webhookUrl
        || `${process.env.BACKEND_URL || "https://messbee.com"}/api/whatsapp/webhook`;

      const events = settingVal.events || {
        messages: true,
        messageStatus: true,
        templateStatus: true,
        securityAlerts: true,
        orderUpdates: false,
        profileUpdates: false
      };

      return res.json({
        key: "whatsapp_config",
        value: {
          businessAccountId,
          phoneNumberId,
          accessToken,
          verifyToken,
          webhookUrl,
          events,
          apiVersion: settingVal.apiVersion || process.env.WHATSAPP_API_VERSION || "v20.0",
          connected: Boolean(phoneNumberId && accessToken)
        }
      });
    }

    const setting = await Setting.findOne({ key });
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

    let setting = await Setting.findOne({ key });

    if (setting) {
      setting.value = value;
      if (description !== undefined) setting.description = description;
      setting.markModified("value");
      await setting.save();
    } else {
      setting = await Setting.create({ key, value, description });
    }

    // Broadcast permissions update to all connected clients via Socket.IO
    if (key === "role_permissions") {
      try {
        const { getIO } = require("../config/socket");
        const io = getIO();
        if (io) io.emit("permissions_updated", { value });
      } catch (_) {}
    }

    // When whatsapp_config is saved/updated, also synchronize with Channel / User
    if (key === "whatsapp_config" && value) {
      try {
        const jwt = require("jsonwebtoken");
        const Channel = require("../models/Channel");
        const User = require("../models/User");

        let token = req.cookies?.accessToken;
        if (!token && req.headers?.authorization?.startsWith("Bearer")) {
          token = req.headers.authorization.split(" ")[1];
        }
        if (token) {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
          if (decoded?.id) {
            const user = await User.findById(decoded.id);
            if (user) {
              const tenantId = user.tenantId || user._id;
              // Update Channel if exists or user's config
              if (value.phoneNumberId || value.accessToken) {
                await Channel.findOneAndUpdate(
                  { tenantId },
                  {
                    $set: {
                      activeWhatsappPhoneNumberId: value.phoneNumberId,
                      metaAccessToken: value.accessToken,
                      "metadata.wabaId": value.businessAccountId,
                      status: "connected"
                    }
                  },
                  { upsert: false }
                );
                user.whatsappConfig = {
                  ...(user.whatsappConfig || {}),
                  phoneNumberId: value.phoneNumberId,
                  accessToken: value.accessToken,
                  wabaId: value.businessAccountId
                };
                await user.save();
              }
            }
          }
        }
      } catch (syncErr) {
        console.warn("Could not sync whatsapp_config to Channel/User:", syncErr.message);
      }
    }

    res.json(setting);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

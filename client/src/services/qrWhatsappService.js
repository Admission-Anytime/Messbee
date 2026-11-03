import axios from "../context/axios";

/**
 * Fetch WhatsApp Web QR status
 */
export const getQrStatus = async () => {
  const { data } = await axios.get("/qr-whatsapp/status");
  return data;
};

/**
 * Request/Generate new QR Code
 */
export const generateQrCode = async () => {
  const { data } = await axios.post("/qr-whatsapp/generate-qr");
  return data;
};

/**
 * Disconnect / Unlink WhatsApp Web session
 */
export const disconnectQrSession = async () => {
  const { data } = await axios.post("/qr-whatsapp/disconnect");
  return data;
};

/**
 * Request Pairing Code via Phone Number
 * @param {string} phoneNumber e.g. "919876543210"
 */
export const requestPairingCode = async (phoneNumber) => {
  const { data } = await axios.post("/qr-whatsapp/pairing-code", { phoneNumber });
  return data;
};

/**
 * Send safe throttled batch broadcast to selected contacts
 * @param {Object} broadcastData { recipientPhones, messageText, media, intervalSeconds }
 */
export const sendQrBroadcast = async (broadcastData) => {
  const { data } = await axios.post("/qr-whatsapp/broadcast", broadcastData);
  return data;
};

/**
 * Get Auto-Responder Settings (Welcome & Away messages)
 */
export const getAutoResponderSettings = async () => {
  const { data } = await axios.get("/qr-whatsapp/auto-responder");
  return data;
};

/**
 * Update Auto-Responder Settings
 * @param {Object} payload { welcomeMessage, awayMessage }
 */
export const saveAutoResponderSettings = async (payload) => {
  const { data } = await axios.put("/qr-whatsapp/auto-responder", payload);
  return data;
};

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

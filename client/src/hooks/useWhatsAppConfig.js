import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "../context/axios";

export function useWhatsAppConfig(initialState = {}) {
  const [businessId, setBusinessId] = useState("");
  const [phoneId, setPhoneId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [events, setEvents] = useState({ 
    messages: true, 
    messageStatus: true, 
    templateStatus: true, 
    securityAlerts: true, 
    orderUpdates: false, 
    profileUpdates: false 
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("Disconnected");
  const [lastSync, setLastSync] = useState("Never");
  
  const [savedSnapshot, setSavedSnapshot] = useState(null);

  const snapshot = JSON.stringify({ businessId, phoneId, webhookUrl, events });
  const hasChanges = savedSnapshot !== null && snapshot !== savedSnapshot;

  useEffect(() => {
    if (savedSnapshot === null) setSavedSnapshot(snapshot);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/settings/whatsapp_config");
      if (response.data && response.data.value) {
        const config = response.data.value;
        setBusinessId(config.businessAccountId || "");
        setPhoneId(config.phoneNumberId || "");
        setAccessToken(config.accessToken || "");
        setWebhookUrl(config.webhookUrl || "");
        if (config.events) setEvents(config.events);
        setSavedSnapshot(JSON.stringify({
          businessId: config.businessAccountId || "",
          phoneId: config.phoneNumberId || "",
          webhookUrl: config.webhookUrl || "",
          events: config.events || events
        }));
      }
    } catch (error) {
      console.error("Error fetching WhatsApp config:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveConfig = async ({ verifyToken, webhookEditMode, webhookDraft }) => {
    if (!businessId.trim() || !phoneId.trim()) {
      toast.error("Business Account ID and Phone Number ID cannot be empty");
      return false;
    }
    setSaving(true);
    try {
      const configValue = {
        businessAccountId: businessId,
        phoneNumberId: phoneId,
        accessToken: accessToken,
        verifyToken: verifyToken,
        webhookUrl: webhookEditMode && webhookDraft ? webhookDraft : webhookUrl,
        events: events,
        apiVersion: "v18.0"
      };

      await axios.post("/settings", {
        key: "whatsapp_config",
        value: configValue,
        description: "WhatsApp Cloud API Configuration"
      });

      if (webhookEditMode && webhookDraft) {
        setWebhookUrl(webhookDraft);
      }
      
      setSavedSnapshot(JSON.stringify({
        businessId,
        phoneId,
        webhookUrl: webhookEditMode ? webhookDraft : webhookUrl,
        events
      }));
      
      toast.success("Configuration saved successfully!");
      return true;
    } catch (error) {
      console.error("Error saving WhatsApp config:", error);
      toast.error("Failed to save configuration: " + (error.response?.data?.error || error.message));
      return false;
    } finally {
      setSaving(false);
    }
  };

  const testWebhook = async ({ webhookEditMode, webhookDraft, setWebhookStatus }) => {
    const url = webhookEditMode ? webhookDraft : webhookUrl;
    if (!url.startsWith("http")) {
      toast.error("Enter a valid URL starting with http(s)://");
      return;
    }
    setWebhookStatus("testing");
    try {
      await new Promise((r) => setTimeout(r, 1500));
      const response = await axios.get("/whatsapp/test-connection");
      if (response.data.success) {
        setWebhookStatus("success");
        toast.success("Connection test passed ✓");
      } else {
        setWebhookStatus("error");
        toast.error("Connection test failed — check your credentials");
      }
    } catch (error) {
      setWebhookStatus("error");
      toast.error("Webhook test failed — check your server");
    }
    setTimeout(() => setWebhookStatus("idle"), 6000);
  };

  const refreshConnection = async ({ setRefreshing, setShowTestModal }) => {
    try {
      setRefreshing(true);
      const response = await axios.get("/whatsapp/test-connection");
      if (response.data.success) {
        setConnectionStatus("Active");
        setLastSync("Just now");
        setShowTestModal(true);
      } else {
        setConnectionStatus("Inactive");
        toast.error("Connection test failed: " + response.data.message);
      }
    } catch (error) {
      console.error("Error testing connection:", error);
      setConnectionStatus("Error");
      toast.error("Failed to connect to WhatsApp API. Check your credentials.");
    } finally {
      setRefreshing(false);
    }
  };

  const exportConfig = () => {
    const config = { businessAccountId: businessId, phoneNumberId: phoneId, webhookUrl, environment: "PRODUCTION", subscribedEvents: events, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: "whatsapp-config.json" });
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success("Config exported as whatsapp-config.json");
  };

  return {
    businessId, setBusinessId,
    phoneId, setPhoneId,
    accessToken, setAccessToken,
    webhookUrl, setWebhookUrl,
    events, setEvents,
    loading, saving,
    connectionStatus, setConnectionStatus,
    lastSync, setLastSync,
    hasChanges,
    saveConfig,
    testWebhook,
    refreshConnection,
    exportConfig
  };
}

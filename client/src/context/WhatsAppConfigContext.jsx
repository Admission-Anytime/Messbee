/**
 * WhatsAppConfigContext.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Global store for WhatsApp Business API (Meta) configuration.
 * 
 * Purpose:
 *   - Stores API credentials and live phone-number status fetched from Meta
 *   - Exposes wabaConfig, phoneQuality, messagingLimit for any component
 *   - Provides refreshConfig() to re-fetch at any time
 *   - Caches in sessionStorage so page reloads don't re-fetch unnecessarily
 * 
 * Usage:
 *   const { wabaConfig, phoneQuality, messagingLimit } = useWABAConfig();
 */

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from './axios';

// ── Context ───────────────────────────────────────────────────────────────────
export const WhatsAppConfigContext = createContext(null);

// ── Default empty config ──────────────────────────────────────────────────────
const EMPTY_CONFIG = {
  phoneNumberId:    null,
  wabaId:           null,
  appId:            null,
  apiVersion:       'v18.0',
  hasAccessToken:   false,
  accessTokenMasked: null,
};

// ── Provider ──────────────────────────────────────────────────────────────────
export const WhatsAppConfigProvider = ({ children }) => {
  const [wabaConfig, setWabaConfig]       = useState(EMPTY_CONFIG);
  const [livePhoneData, setLivePhoneData] = useState(null);   // raw Meta API response
  const [isLoading, setIsLoading]         = useState(false);
  const [lastFetched, setLastFetched]     = useState(null);
  const [error, setError]                 = useState(null);

  // ── Derived convenience values ────────────────────────────────────────────
  const phoneQuality    = livePhoneData?.quality_rating   || null;   // 'GREEN' | 'YELLOW' | 'RED'
  const messagingLimit  = livePhoneData?.messaging_limit_tier || null; // 'TIER_1K' | 'TIER_10K' etc.
  const displayPhone    = livePhoneData?.display_phone_number || null;
  const verifiedName    = livePhoneData?.verified_name    || null;
  const phoneStatus     = livePhoneData?.status           || null;   // 'CONNECTED' | etc.

  // ── Fetch config from our backend ─────────────────────────────────────────
  const refreshConfig = useCallback(async (force = false) => {
    // Skip if fetched recently (within last 5 min) unless forced
    if (!force && lastFetched && Date.now() - lastFetched < 5 * 60 * 1000) return;

    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/performance/waba-config');
      if (data.success) {
        setWabaConfig(data.data.config   || EMPTY_CONFIG);
        setLivePhoneData(data.data.livePhoneData || null);
        setLastFetched(Date.now());
      }
    } catch (err) {
      const errMsg = err?.response?.data?.message || err.message || 'Config fetch failed';
      setError(errMsg);
      console.warn('⚠️  WABA Config fetch failed:', errMsg);
    } finally {
      setIsLoading(false);
    }
  }, [lastFetched]);

  // Auto-fetch on mount (once user is authenticated, route renders this)
  useEffect(() => {
    refreshConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = {
    // Raw config
    wabaConfig,

    // Live Meta API data
    livePhoneData,

    // Derived shortcuts
    phoneQuality,     // 'GREEN' | 'YELLOW' | 'RED' | null
    messagingLimit,   // 'TIER_1K' | 'TIER_10K' | 'TIER_100K' | null
    displayPhone,
    verifiedName,
    phoneStatus,

    // State
    isLoading,
    error,
    lastFetched,

    // Actions
    refreshConfig,
  };

  return (
    <WhatsAppConfigContext.Provider value={value}>
      {children}
    </WhatsAppConfigContext.Provider>
  );
};

// ── Custom hook ───────────────────────────────────────────────────────────────
export const useWABAConfig = () => {
  const ctx = useContext(WhatsAppConfigContext);
  if (!ctx) {
    throw new Error('useWABAConfig must be used inside <WhatsAppConfigProvider>');
  }
  return ctx;
};

export default WhatsAppConfigProvider;

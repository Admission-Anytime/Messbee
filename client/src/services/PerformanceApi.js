/**
 * PerformanceApi.js
 * ──────────────────────────────────────────────────────────────
 * Client-side service for the /api/performance endpoints.
 * Uses the configured axios instance (with cookies + base URL).
 */

import api from '../context/axios';

const BASE = '/performance';

/**
 * Fetch the Performance Overview for the dashboard.
 *
 * @param {string|null} date - Optional YYYY-MM-DD string. Defaults to today.
 * @returns {Promise<Object>} - { success, data: { date, metrics, wabaConfig } }
 */
export const getPerformanceOverview = async (date = null) => {
  const params = {};
  if (date) params.date = date;
  const { data } = await api.get(`${BASE}/overview`, { params });
  return data;
};

/**
 * Fetch the full WhatsApp Business API config + live phone data from Meta.
 *
 * @returns {Promise<Object>} - { success, data: { config, livePhoneData } }
 */
export const getWABAConfig = async () => {
  const { data } = await api.get(`${BASE}/waba-config`);
  return data;
};

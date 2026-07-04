const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');
const axios = require('axios');

// ─── Global WhatsApp Config (per user from .env or user profile) ──────────────
// These are the Meta API credentials — stored globally for easy access.
// In a multi-tenant setup, each user can have their own WABA config stored in DB.
const getWABAConfig = (user) => {
  return {
    phoneNumberId: user?.whatsappPhoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID,
    accessToken:   user?.whatsappAccessToken   || process.env.WHATSAPP_ACCESS_TOKEN,
    wabaId:        user?.whatsappBusinessAccountId || process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
    appId:         user?.whatsappAppId         || process.env.WHATSAPP_APP_ID,
    apiVersion:    process.env.WHATSAPP_API_VERSION || 'v18.0',
  };
};

// ─── GET /api/performance/overview?date=YYYY-MM-DD ───────────────────────────
// @desc  Real-time Performance Overview for dashboard
// @route GET /api/performance/overview
// @access Private
exports.getPerformanceOverview = async (req, res) => {
  try {
    const userId = req.user._id;
    const { date } = req.query;

    // Build date range: if date provided, query that full day; else today
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // ── 1. TOTAL CHATS created on selected date ───────────────────────────────
    const totalChats = await Chat.countDocuments({
      user: userId,
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    // ── 2. UNREAD CHATS (have unread > 0) ─────────────────────────────────────
    const unreadChats = await Chat.countDocuments({
      user: userId,
      unread: { $gt: 0 }
    });

    // ── 3. OPEN CASES (chatStatus === 'open') ─────────────────────────────────
    const openCases = await Chat.countDocuments({
      user: userId,
      chatStatus: 'open'
    });

    // ── 4. FAILED MESSAGES on selected date ───────────────────────────────────
    const failedMessages = await Message.countDocuments({
      user: userId,
      status: 'failed',
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    // ── 5. FREE TIER messages (messages where chat has no inbound in 24h window) 
    //    i.e., template/outbound messages outside the 24h reply window
    const templateMessages = await Message.countDocuments({
      user: userId,
      sender: 'me',
      messageType: 'template',
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    // ── 6. ACTIVE AGENTS (users with role AGENT/MANAGER who are active) ────────
    //    For single-user setup, count from req.user.agents OR always return 1
    const agentCount = req.user?.agents?.length || 1;

    // ── 7. Previous day data for % change calculation ─────────────────────────
    const prevStart = new Date(startOfDay);
    prevStart.setDate(prevStart.getDate() - 1);
    const prevEnd = new Date(endOfDay);
    prevEnd.setDate(prevEnd.getDate() - 1);

    const prevChats   = await Chat.countDocuments({ user: userId, createdAt: { $gte: prevStart, $lte: prevEnd } });
    const prevFailed  = await Message.countDocuments({ user: userId, status: 'failed', createdAt: { $gte: prevStart, $lte: prevEnd } });
    const prevUnread  = await Chat.countDocuments({ user: userId, unread: { $gt: 0 }, createdAt: { $gte: prevStart, $lte: prevEnd } });

    // Calculate percentage changes
    const calcChange = (curr, prev) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return Math.round(((curr - prev) / prev) * 100);
    };

    const chatsChange  = calcChange(totalChats, prevChats);
    const failedChange = calcChange(failedMessages, prevFailed);
    const unreadChange = calcChange(unreadChats, prevUnread);

    // ── 8. WhatsApp Business API Config (global config snapshot) ───────────────
    const wabaConfig = getWABAConfig(req.user);

    // ── 9. Optionally fetch phone number quality from Meta API ─────────────────
    let phoneQuality = null;
    let messagingLimit = null;
    try {
      if (wabaConfig.phoneNumberId && wabaConfig.accessToken) {
        const metaRes = await axios.get(
          `https://graph.facebook.com/${wabaConfig.apiVersion}/${wabaConfig.phoneNumberId}`,
          {
            params: {
              fields: 'quality_rating,messaging_limit_tier,display_phone_number,verified_name,status',
              access_token: wabaConfig.accessToken
            },
            timeout: 5000
          }
        );
        if (metaRes.data) {
          phoneQuality    = metaRes.data.quality_rating || null;
          messagingLimit  = metaRes.data.messaging_limit_tier || null;
        }
      }
    } catch (metaErr) {
      // Meta API call failed — non-blocking, just use null
      console.warn('⚠️  Meta API fetch skipped:', metaErr?.response?.data?.error?.message || metaErr.message);
    }

    // ── Response ───────────────────────────────────────────────────────────────
    res.status(200).json({
      success: true,
      data: {
        date: targetDate.toISOString().split('T')[0],
        metrics: {
          totalChats: {
            value:  totalChats,
            change: chatsChange,
            trend:  chatsChange >= 0 ? 'up' : 'down'
          },
          unread: {
            value:  unreadChats,
            change: Math.abs(unreadChange),
            trend:  unreadChange <= 0 ? 'down' : 'up'  // down is good for unread
          },
          openCases: {
            value:  openCases,
            change: 0,
            trend:  'neutral'
          },
          failed: {
            value:  failedMessages,
            change: Math.abs(failedChange),
            trend:  failedChange <= 0 ? 'down' : 'up'
          },
          freeTier: {
            value:  templateMessages,
            limit:  1000,
            trend:  'neutral'
          },
          agents: {
            value:  agentCount,
            status: 'active'
          }
        },
        // Global WhatsApp API config snapshot (credentials masked)
        wabaConfig: {
          phoneNumberId:   wabaConfig.phoneNumberId,
          wabaId:          wabaConfig.wabaId,
          appId:           wabaConfig.appId,
          apiVersion:      wabaConfig.apiVersion,
          accessTokenMasked: wabaConfig.accessToken
            ? `${wabaConfig.accessToken.substring(0, 8)}...${wabaConfig.accessToken.slice(-4)}`
            : null,
          // Live data from Meta API
          phoneQuality,
          messagingLimit,
        }
      }
    });

  } catch (error) {
    console.error('❌ Performance overview error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch performance data', error: error.message });
  }
};

// ─── GET /api/performance/waba-config ─────────────────────────────────────────
// @desc  Get the current global WhatsApp API configuration
// @route GET /api/performance/waba-config
// @access Private
exports.getWABAConfigDetails = async (req, res) => {
  try {
    const wabaConfig = getWABAConfig(req.user);

    // Try to fetch live phone number details from Meta
    let liveData = null;
    try {
      if (wabaConfig.phoneNumberId && wabaConfig.accessToken) {
        const metaRes = await axios.get(
          `https://graph.facebook.com/${wabaConfig.apiVersion}/${wabaConfig.phoneNumberId}`,
          {
            params: {
              fields: 'quality_rating,messaging_limit_tier,display_phone_number,verified_name,status,name_status',
              access_token: wabaConfig.accessToken
            },
            timeout: 8000
          }
        );
        liveData = metaRes.data;
      }
    } catch (err) {
      console.warn('⚠️  Meta config fetch skipped:', err?.response?.data?.error?.message || err.message);
    }

    res.status(200).json({
      success: true,
      data: {
        config: {
          phoneNumberId:   wabaConfig.phoneNumberId,
          wabaId:          wabaConfig.wabaId,
          appId:           wabaConfig.appId,
          apiVersion:      wabaConfig.apiVersion,
          hasAccessToken:  !!wabaConfig.accessToken,
          accessTokenMasked: wabaConfig.accessToken
            ? `${wabaConfig.accessToken.substring(0, 8)}...${wabaConfig.accessToken.slice(-4)}`
            : null,
        },
        livePhoneData: liveData
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch WABA config' });
  }
};

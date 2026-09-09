const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');
const axios = require('axios');

const Channel = require('../models/Channel');
const Setting = require('../models/Setting');

// ─── Resolve WhatsApp Config (per user/tenant from User, Channel, Setting or .env) ──────────────
const getWABAConfig = async (user) => {
  let phoneNumberId = user?.whatsappConfig?.phoneNumberId || user?.whatsappPhoneNumberId || null;
  let accessToken = user?.whatsappConfig?.accessToken || user?.whatsappAccessToken || null;
  let wabaId = user?.whatsappConfig?.wabaId || user?.whatsappBusinessAccountId || null;
  let appId = user?.whatsappAppId || process.env.WHATSAPP_APP_ID || null;
  let verifiedName = null;
  let displayPhoneNumber = null;

  // Check Channel collection first for this tenant (authoritative multi-tenant config)
  if (user) {
    try {
      const tenantId = user.tenantId || user._id;
      const channel = await Channel.findOne({
        tenantId,
        activeWhatsappPhoneNumberId: { $exists: true, $ne: null }
      }).select('+metaAccessToken').lean();

      if (channel) {
        phoneNumberId = channel.activeWhatsappPhoneNumberId || phoneNumberId;
        accessToken = channel.metaAccessToken || accessToken;
        wabaId = channel.metadata?.wabaId || wabaId;
        if (channel.name && channel.name !== 'WhatsApp Business' && channel.name !== 'Default WhatsApp Channel') {
          verifiedName = channel.name;
        }
        if (channel.phoneNumber) {
          displayPhoneNumber = channel.phoneNumber;
        }
      }
    } catch (chanErr) {
      console.warn('Channel lookup in getWABAConfig failed:', chanErr.message);
    }
  }

  // Fallback to user.businessName and user.phone if channel name/phone missing
  if (!verifiedName && user?.businessName && user.businessName !== 'Your Business') {
    verifiedName = user.businessName;
  }
  if (!displayPhoneNumber && (user?.phoneNumber || user?.phone)) {
    displayPhoneNumber = user.phoneNumber || user.phone;
  }

  // Fallback to global setting if still missing
  if (!phoneNumberId || !accessToken) {
    try {
      const setting = await Setting.findOne({ key: 'whatsapp_config' }).lean();
      if (setting && setting.value) {
        if (!phoneNumberId) phoneNumberId = setting.value.phoneNumberId || null;
        if (!accessToken) accessToken = setting.value.accessToken || null;
        if (!wabaId) wabaId = setting.value.businessAccountId || null;
      }
    } catch (setErr) {
      console.warn('Setting lookup in getWABAConfig failed:', setErr.message);
    }
  }

  return {
    phoneNumberId,
    accessToken,
    wabaId,
    appId,
    verifiedName,
    displayPhoneNumber,
    apiVersion: process.env.WHATSAPP_API_VERSION || 'v20.0',
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
    const wabaConfig = await getWABAConfig(req.user);

    // ── 9. Optionally fetch phone number quality from Meta API ─────────────────
    let phoneQuality = null;
    let messagingLimit = null;
    let verifiedName = wabaConfig.verifiedName || null;
    let displayPhoneNumber = wabaConfig.displayPhoneNumber || null;
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
          phoneQuality       = metaRes.data.quality_rating || null;
          messagingLimit     = metaRes.data.messaging_limit_tier || null;
          if (metaRes.data.verified_name) verifiedName = metaRes.data.verified_name;
          if (metaRes.data.display_phone_number) displayPhoneNumber = metaRes.data.display_phone_number;
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
          verifiedName,
          displayPhoneNumber,
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
    const wabaConfig = await getWABAConfig(req.user);

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

    // Fallback if Meta API is unreachable but channel has verified info
    if (!liveData && (wabaConfig.verifiedName || wabaConfig.displayPhoneNumber)) {
      liveData = {
        verified_name: wabaConfig.verifiedName || null,
        display_phone_number: wabaConfig.displayPhoneNumber || null,
        status: 'CONNECTED'
      };
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

const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');
const axios = require('axios');

const Channel = require('../models/Channel');
const Setting = require('../models/Setting');

// ─── Resolve WhatsApp Config (strictly per user/tenant without global credential leaks) ──────────────
const getWABAConfig = async (user) => {
  let phoneNumberId = user?.whatsappConfig?.phoneNumberId || user?.whatsappPhoneNumberId || null;
  let accessToken = user?.whatsappConfig?.accessToken || user?.whatsappAccessToken || null;
  let wabaId = user?.whatsappConfig?.wabaId || user?.whatsappBusinessAccountId || null;
  let appId = user?.whatsappAppId || process.env.WHATSAPP_APP_ID || null;
  let qualityRating = null;
  let verifiedName = null;
  let displayPhoneNumber = null;

  const tenantId = user?.tenantId || user?._id;
  let channel = null;

  // 1. First priority: Check if this tenant has an official connected Meta Channel
  if (tenantId) {
    try {
      channel = await Channel.findOne({
        tenantId,
        activeWhatsappPhoneNumberId: { $exists: true, $ne: null },
        status: { $ne: 'disconnected' }
      }).select('+metaAccessToken').lean();

      if (!channel && user?._id && user._id.toString() !== tenantId.toString()) {
        channel = await Channel.findOne({
          tenantId: user._id,
          activeWhatsappPhoneNumberId: { $exists: true, $ne: null },
          status: { $ne: 'disconnected' }
        }).select('+metaAccessToken').lean();
      }
    } catch (chanErr) {
      console.warn('[getWABAConfig] Channel lookup error:', chanErr.message);
    }
  }

  // Extract credentials from Channel if present
  if (channel && channel.activeWhatsappPhoneNumberId && channel.metaAccessToken) {
    phoneNumberId = channel.activeWhatsappPhoneNumberId;
    accessToken = channel.metaAccessToken;
    wabaId = channel.metadata?.wabaId || wabaId;
    qualityRating = channel.metadata?.qualityRating || null;
    if (channel.name && channel.name !== 'WhatsApp Business' && channel.name !== 'Default WhatsApp Channel') {
      verifiedName = channel.name;
    }
    if (channel.phoneNumber) {
      displayPhoneNumber = channel.phoneNumber;
    }
  }

  const hasMetaCredentials = Boolean(phoneNumberId && accessToken);

  // If user has connected official Meta credentials:
  if (hasMetaCredentials) {
    // Auto-heal user record in DB if it was previously marked as free_qr
    if (user && (user.whatsappChannelType === 'free_qr' || !user.tenantWhatsAppConnected)) {
      const idsToUpdate = [user._id];
      if (tenantId && tenantId.toString() !== user._id.toString()) idsToUpdate.push(tenantId);
      await User.updateMany(
        { _id: { $in: idsToUpdate } },
        { $set: { whatsappChannelType: 'meta_pro', tenantWhatsAppConnected: true } }
      ).catch(() => {});
    }

    return {
      channelType: 'meta_pro',
      isFreeQr: false,
      isConnected: true,
      phoneNumberId,
      accessToken,
      wabaId,
      appId,
      verifiedName: verifiedName || user?.businessName || user?.name || 'Business Not Verified',
      displayPhoneNumber: displayPhoneNumber || user?.phoneNumber || user?.phone || null,
      qualityRating: qualityRating || 'Green',
      messagingLimit: null, // Will be fetched live from Meta Graph API
      apiVersion: process.env.WHATSAPP_API_VERSION || 'v20.0',
    };
  }

  // 2. If NO Meta credentials, check if user is configured for Free QR (Baileys)
  const isFreeQr = user?.whatsappChannelType === 'free_qr';
  if (isFreeQr) {
    const QrSession = require('../models/QrSession');
    let qrSession = null;
    try {
      qrSession = await QrSession.findOne({ tenantId }).lean();
    } catch (_) {}

    const isConnected = qrSession?.status === 'CONNECTED';
    return {
      channelType: 'free_qr',
      isFreeQr: true,
      isConnected,
      phoneNumberId: null,
      accessToken: null,
      wabaId: null,
      appId: null,
      verifiedName: user?.businessName || user?.name || 'Business Not Verified',
      displayPhoneNumber: qrSession?.phoneNumber ? `+${qrSession.phoneNumber}` : null,
      qualityRating: isConnected ? 'Normal' : 'Disconnected',
      messagingLimit: 'Standard Web',
      apiVersion: 'v20.0',
    };
  }

  // 3. Fallback: Unverified / Not connected user (NO global leaks)
  return {
    channelType: 'meta_pro',
    isFreeQr: false,
    isConnected: false,
    phoneNumberId: null,
    accessToken: null,
    wabaId: null,
    appId,
    verifiedName: user?.businessName || user?.name || 'Business Not Verified',
    displayPhoneNumber: null,
    qualityRating: 'Not Connected',
    messagingLimit: 'Not Connected',
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
    const tenantId = req.user.tenantId || req.user._id;
    const userMatch = { $in: [userId, tenantId] };
    const { date } = req.query;

    // Build date range: if date provided, query that full day; else today
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // ── 1. TOTAL CHATS created on selected date ───────────────────────────────
    const totalChats = await Chat.countDocuments({
      user: userMatch,
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    // ── 2. UNREAD CHATS (have unread > 0) ─────────────────────────────────────
    const unreadChats = await Chat.countDocuments({
      user: userMatch,
      unread: { $gt: 0 }
    });

    // ── 3. OPEN CASES (chatStatus === 'open') ─────────────────────────────────
    const openCases = await Chat.countDocuments({
      user: userMatch,
      chatStatus: 'open'
    });

    // ── 4. FAILED MESSAGES on selected date ───────────────────────────────────
    const failedMessages = await Message.countDocuments({
      user: userMatch,
      status: 'failed',
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    // ── 5. FREE TIER messages (messages where chat has no inbound in 24h window) 
    //    i.e., template/outbound messages outside the 24h reply window
    const templateMessages = await Message.countDocuments({
      user: userMatch,
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

    const prevChats   = await Chat.countDocuments({ user: userMatch, createdAt: { $gte: prevStart, $lte: prevEnd } });
    const prevFailed  = await Message.countDocuments({ user: userMatch, status: 'failed', createdAt: { $gte: prevStart, $lte: prevEnd } });
    const prevUnread  = await Chat.countDocuments({ user: userMatch, unread: { $gt: 0 }, createdAt: { $gte: prevStart, $lte: prevEnd } });

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
    let phoneQuality = wabaConfig.qualityRating || null;
    let messagingLimit = null;
    let verifiedName = wabaConfig.verifiedName || null;
    let displayPhoneNumber = wabaConfig.displayPhoneNumber || null;
    try {
      if (wabaConfig.phoneNumberId && wabaConfig.accessToken) {
        const metaRes = await axios.get(
          `https://graph.facebook.com/${wabaConfig.apiVersion}/${wabaConfig.phoneNumberId}`,
          {
            params: {
              fields: 'quality_rating,whatsapp_business_manager_messaging_limit,messaging_limit_tier,display_phone_number,verified_name,status',
              access_token: wabaConfig.accessToken
            },
            timeout: 5000
          }
        );
        if (metaRes.data) {
          if (metaRes.data.quality_rating) phoneQuality = metaRes.data.quality_rating;
          messagingLimit     = metaRes.data.whatsapp_business_manager_messaging_limit || metaRes.data.messaging_limit_tier || null;
          if (metaRes.data.verified_name) verifiedName = metaRes.data.verified_name;
          if (metaRes.data.display_phone_number) displayPhoneNumber = metaRes.data.display_phone_number;
        }
      }
    } catch (metaErr) {
      // Meta API call failed — non-blocking, use channel DB fallback
      console.warn('⚠️  Meta API fetch skipped:', metaErr?.response?.data?.error?.message || metaErr.message);
    }

    // ── Response ───────────────────────────────────────────────────────────────
    // Get fresh user credits
    const currentUser = await User.findById(userId).select('credits').lean();

    res.status(200).json({
      success: true,
      data: {
        date: targetDate.toISOString().split('T')[0],
        credits: currentUser?.credits != null ? currentUser.credits : 0,
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
        // WhatsApp API / Web channel config snapshot (credentials masked)
        wabaConfig: {
          channelType:     wabaConfig.channelType,
          isFreeQr:        wabaConfig.isFreeQr,
          isConnected:     wabaConfig.isConnected,
          phoneNumberId:   wabaConfig.phoneNumberId,
          wabaId:          wabaConfig.wabaId,
          appId:           wabaConfig.appId,
          apiVersion:      wabaConfig.apiVersion,
          accessTokenMasked: wabaConfig.accessToken
            ? `${wabaConfig.accessToken.substring(0, 8)}...${wabaConfig.accessToken.slice(-4)}`
            : null,
          // Live data from Meta API or QR session
          phoneQuality:    phoneQuality || (wabaConfig.isFreeQr ? (wabaConfig.isConnected ? 'Normal' : 'Disconnected') : (wabaConfig.isConnected ? 'Green' : 'Not Connected')),
          messagingLimit:  messagingLimit || (wabaConfig.isFreeQr ? 'Standard Web' : (wabaConfig.isConnected ? '250' : 'Not Connected')),
          verifiedName:    verifiedName || wabaConfig.verifiedName,
          displayPhoneNumber: displayPhoneNumber || wabaConfig.displayPhoneNumber,
        }
      }
    });

  } catch (error) {
    console.error('❌ Performance overview error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch performance data', error: error.message });
  }
};

// ─── GET /api/performance/waba-config ─────────────────────────────────────────
// @desc  Get the current WhatsApp API / Web configuration
// @route GET /api/performance/waba-config
// @access Private
exports.getWABAConfigDetails = async (req, res) => {
  try {
    const wabaConfig = await getWABAConfig(req.user);

    // If Free QR tier, return QR session details without calling Meta
    if (wabaConfig.isFreeQr) {
      return res.status(200).json({
        success: true,
        data: {
          config: {
            channelType: 'free_qr',
            isFreeQr: true,
            isConnected: wabaConfig.isConnected,
            phoneNumberId: null,
            wabaId: null,
            appId: null,
            apiVersion: 'v20.0',
            hasAccessToken: false,
            accessTokenMasked: null,
          },
          livePhoneData: {
            verified_name: wabaConfig.verifiedName || 'Business Not Verified',
            display_phone_number: wabaConfig.displayPhoneNumber || null,
            status: wabaConfig.isConnected ? 'CONNECTED' : 'DISCONNECTED'
          }
        }
      });
    }

    // Try to fetch live phone number details from Meta ONLY if valid credentials exist
    let liveData = null;
    if (wabaConfig.phoneNumberId && wabaConfig.accessToken) {
      try {
        const metaRes = await axios.get(
          `https://graph.facebook.com/${wabaConfig.apiVersion}/${wabaConfig.phoneNumberId}`,
          {
            params: {
              fields: 'quality_rating,whatsapp_business_manager_messaging_limit,messaging_limit_tier,display_phone_number,verified_name,status,name_status',
              access_token: wabaConfig.accessToken
            },
            timeout: 8000
          }
        );
        liveData = metaRes.data;
      } catch (err) {
        console.warn('⚠️  Meta config fetch skipped:', err?.response?.data?.error?.message || err.message);
      }
    }

    // Fallback if Meta API is unreachable but channel has verified info
    if (!liveData && (wabaConfig.verifiedName || wabaConfig.displayPhoneNumber)) {
      liveData = {
        verified_name: wabaConfig.verifiedName || 'Business Not Verified',
        display_phone_number: wabaConfig.displayPhoneNumber || null,
        status: wabaConfig.isConnected ? 'CONNECTED' : 'DISCONNECTED'
      };
    }

    res.status(200).json({
      success: true,
      data: {
        config: {
          channelType: 'meta_pro',
          isFreeQr: false,
          isConnected: wabaConfig.isConnected,
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

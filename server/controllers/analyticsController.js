const Message = require('../models/Message');
const Contact = require('../models/Contact');
const Campaign = require('../models/Campaign');
const Template = require('../models/Template');

// @desc    Get dashboard analytics
// @route   GET /api/analytics/dashboard
// @access  Private
exports.getDashboardAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const query = { user: req.user._id };
    if (Object.keys(dateFilter).length > 0) {
      query.createdAt = dateFilter;
    }

    // Total contacts
    const totalContacts = await Contact.countDocuments({ user: req.user.id });
    
    // Active contacts (with messages in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeContacts = await Contact.countDocuments({
      user: req.user.id,
      lastMessageDate: { $gte: thirtyDaysAgo }
    });

    // Total messages
    const totalMessages = await Message.countDocuments(query);
    
    // Messages by status
    const messagesByStatus = await Message.aggregate([
      { $match: query },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Messages over time (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const messagesOverTime = await Message.aggregate([
      {
        $match: {
          user: req.user._id,
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Campaign statistics
    const campaigns = await Campaign.find({ user: req.user.id });
    const campaignStats = {
      total: campaigns.length,
      active: campaigns.filter(c => c.status === 'active').length,
      completed: campaigns.filter(c => c.status === 'completed').length,
      totalSent: campaigns.reduce((sum, c) => sum + c.stats.sent, 0),
      totalDelivered: campaigns.reduce((sum, c) => sum + c.stats.delivered, 0)
    };

    res.status(200).json({
      success: true,
      data: {
        contacts: {
          total: totalContacts,
          active: activeContacts
        },
        messages: {
          total: totalMessages,
          byStatus: messagesByStatus,
          overTime: messagesOverTime
        },
        campaigns: campaignStats
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get message analytics
// @route   GET /api/analytics/messages
// @access  Private
exports.getMessageAnalytics = async (req, res, next) => {
  try {
    const { period = '7d' } = req.query;
    
    let startDate = new Date();
    if (period === '7d') startDate.setDate(startDate.getDate() - 7);
    else if (period === '30d') startDate.setDate(startDate.getDate() - 30);
    else if (period === '90d') startDate.setDate(startDate.getDate() - 90);

    const messageStats = await Message.aggregate([
      {
        $match: {
          user: req.user._id,
          createdAt: { $gte: startDate }
        }
      },
      {
        $facet: {
          byType: [
            { $group: { _id: '$messageType', count: { $sum: 1 } } }
          ],
          bySender: [
            { $group: { _id: '$sender', count: { $sum: 1 } } }
          ],
          byStatus: [
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ],
          hourlyDistribution: [
            {
              $group: {
                _id: { $hour: '$createdAt' },
                count: { $sum: 1 }
              }
            },
            { $sort: { _id: 1 } }
          ]
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: messageStats[0]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get campaign analytics
// @route   GET /api/analytics/campaigns
// @access  Private
exports.getCampaignAnalytics = async (req, res, next) => {
  try {
    const campaigns = await Campaign.find({ user: req.user.id })
      .select('name status stats createdAt')
      .sort('-createdAt');

    const summary = {
      totalCampaigns: campaigns.length,
      byStatus: {},
      overallStats: {
        sent: 0,
        delivered: 0,
        read: 0,
        replied: 0,
        failed: 0
      }
    };

    campaigns.forEach(campaign => {
      // Count by status
      summary.byStatus[campaign.status] = (summary.byStatus[campaign.status] || 0) + 1;
      
      // Aggregate stats
      Object.keys(campaign.stats).forEach(key => {
        summary.overallStats[key] += campaign.stats[key];
      });
    });

    // Calculate rates
    if (summary.overallStats.sent > 0) {
      summary.deliveryRate = ((summary.overallStats.delivered / summary.overallStats.sent) * 100).toFixed(2);
      summary.readRate = ((summary.overallStats.read / summary.overallStats.sent) * 100).toFixed(2);
      summary.replyRate = ((summary.overallStats.replied / summary.overallStats.sent) * 100).toFixed(2);
    }

    res.status(200).json({
      success: true,
      data: {
        summary,
        campaigns: campaigns.map(c => ({
          id: c._id,
          name: c.name,
          status: c.status,
          stats: c.stats,
          createdAt: c.createdAt
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get template analytics
// @route   GET /api/analytics/templates
// @access  Private
exports.getTemplateAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate, groupBy = 'daily' } = req.query;

    // Build date range
    const start = startDate
      ? new Date(startDate)
      : (() => { const d = new Date(); d.setDate(d.getDate() - 7); return d; })();
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    // Campaign messages don't store `user` on the Message doc — they store
    // metadata.campaignId.  So we scope by the user's campaign IDs.
    const userCampaigns = await Campaign.find({ user: req.user._id }).select('_id');
    const campaignIds = userCampaigns.map(c => c._id.toString());

    // Match template messages that either:
    //  (a) belong to one of the user's campaigns (via metadata.campaignId), OR
    //  (b) have user field set directly (defensive — for any future code paths)
    const baseMatch = {
      messageType: 'template',
      sender: 'me',
      createdAt: { $gte: start, $lte: end },
      $or: [
        { 'metadata.campaignId': { $in: campaignIds } },
        { user: req.user._id }
      ]
    };

    // --- 1. Template Engagement Table ---
    const templateEngagement = await Message.aggregate([
      { $match: baseMatch },
      {
        $group: {
          _id: {
            templateName: '$templateName',
            templateLanguage: '$templateLanguage'
          },
          sent: { $sum: 1 },
          delivered: {
            $sum: { $cond: [{ $in: ['$status', ['delivered', 'read']] }, 1, 0] }
          },
          read: {
            $sum: { $cond: [{ $eq: ['$status', 'read'] }, 1, 0] }
          },
          failed: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          _id: 0,
          templateName: '$_id.templateName',
          templateLanguage: '$_id.templateLanguage',
          sent: 1,
          delivered: 1,
          read: 1,
          failed: 1
        }
      },
      { $sort: { sent: -1 } }
    ]);

    // --- 2. Performance Chart (time series) ---
    let dateFormat;
    if (groupBy === 'monthly') dateFormat = '%Y-%m';
    else if (groupBy === 'weekly') dateFormat = '%Y-%U';
    else dateFormat = '%Y-%m-%d';

    const sentByDate = await Message.aggregate([
      { $match: baseMatch },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
          sent: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const deliveredByDate = await Message.aggregate([
      { $match: { ...baseMatch, status: { $in: ['delivered', 'read'] } } },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
          delivered: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const readByDate = await Message.aggregate([
      { $match: { ...baseMatch, status: 'read' } },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
          read: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Merge into date map
    const dateMap = {};
    sentByDate.forEach(({ _id, sent }) => {
      if (!dateMap[_id]) dateMap[_id] = { date: _id, sent: 0, delivered: 0, read: 0 };
      dateMap[_id].sent = sent;
    });
    deliveredByDate.forEach(({ _id, delivered }) => {
      if (!dateMap[_id]) dateMap[_id] = { date: _id, sent: 0, delivered: 0, read: 0 };
      dateMap[_id].delivered = delivered;
    });
    readByDate.forEach(({ _id, read }) => {
      if (!dateMap[_id]) dateMap[_id] = { date: _id, sent: 0, delivered: 0, read: 0 };
      dateMap[_id].read = read;
    });

    const chartData = Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));

    // --- 3. Summary Stats ---
    const totals = templateEngagement.reduce(
      (acc, t) => {
        acc.sent += t.sent;
        acc.delivered += t.delivered;
        acc.read += t.read;
        acc.failed += t.failed;
        return acc;
      },
      { sent: 0, delivered: 0, read: 0, failed: 0 }
    );

    const deliveryRate = totals.sent > 0
      ? ((totals.delivered / totals.sent) * 100).toFixed(1)
      : '0.0';
    const readRate = totals.sent > 0
      ? ((totals.read / totals.sent) * 100).toFixed(1)
      : '0.0';

    res.status(200).json({
      success: true,
      data: {
        engagement: templateEngagement,
        chartData,
        summary: {
          totalSent: totals.sent,
          totalDelivered: totals.delivered,
          totalRead: totals.read,
          totalFailed: totals.failed,
          deliveryRate,
          readRate
        }
      }
    });
  } catch (error) {
    next(error);
  }
};


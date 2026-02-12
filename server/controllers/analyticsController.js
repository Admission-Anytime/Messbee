const Message = require('../models/Message');
const Contact = require('../models/Contact');
const Campaign = require('../models/Campaign');

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

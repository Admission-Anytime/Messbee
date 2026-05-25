const Notification = require('../models/Notification');
const { emitNotification } = require('../config/socket');

/**
 * Create and emit a notification
 * @param {string} userId - User ID to notify
 * @param {string} type - Notification type (chat, mention, system, lead, alert, campaign, contact)
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {object} options - Additional options {meta, relatedId, data}
 */
const createAndEmitNotification = async (userId, type, title, message, options = {}) => {
  try {
    const { meta = [], relatedId = null, data = {} } = options;

    // Create notification in database
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      meta,
      relatedId,
      data,
      isRead: false
    });

    // Emit in real-time via Socket.IO
    emitNotification(userId, {
      _id: notification._id,
      type,
      title,
      message,
      meta,
      relatedId,
      isRead: false,
      createdAt: notification.createdAt
    });

    return notification;
  } catch (error) {
    console.error('Error creating and emitting notification:', error);
  }
};

/**
 * Create and emit notification to multiple users
 * @param {array} userIds - Array of user IDs to notify
 * @param {string} type - Notification type
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {object} options - Additional options {meta, relatedId, data}
 */
const createAndEmitNotificationsToUsers = async (userIds, type, title, message, options = {}) => {
  try {
    const { meta = [], relatedId = null, data = {} } = options;

    // Create notifications for each user
    const notifications = [];
    for (const userId of userIds) {
      const notification = await Notification.create({
        userId,
        type,
        title,
        message,
        meta,
        relatedId,
        data,
        isRead: false
      });

      notifications.push(notification);

      // Emit in real-time
      emitNotification(userId, {
        _id: notification._id,
        type,
        title,
        message,
        meta,
        relatedId,
        isRead: false,
        createdAt: notification.createdAt
      });
    }

    return notifications;
  } catch (error) {
    console.error('Error creating and emitting notifications to users:', error);
  }
};

module.exports = {
  createAndEmitNotification,
  createAndEmitNotificationsToUsers
};

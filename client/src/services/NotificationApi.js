import instance from '../context/axios';

const NotificationApi = {
  // Get all notifications with pagination
  getNotifications: async (page = 1, limit = 10, isRead = null) => {
    try {
      let url = `/notifications?page=${page}&limit=${limit}`;
      if (isRead !== null) {
        url += `&isRead=${isRead}`;
      }
      const response = await instance.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  // Get unread count
  getUnreadCount: async () => {
    try {
      const response = await instance.get(`/notifications/unread-count`);
      return response.data;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
  },

  // Mark single notification as read
  markAsRead: async (notificationId) => {
    try {
      const response = await instance.put(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    try {
      const response = await instance.put(`/notifications/mark-all-read`);
      return response.data;
    } catch (error) {
      console.error('Error marking all as read:', error);
      throw error;
    }
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    try {
      const response = await instance.delete(`/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }
};

export default NotificationApi;

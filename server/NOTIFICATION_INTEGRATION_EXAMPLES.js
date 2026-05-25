// Example: How to emit notifications from other controllers

// ============================================
// EXAMPLE 1: Chat Message Notification
// ============================================
// In server/controllers/chatController.js
// Add this after a new message is saved:

/*
const { createAndEmitNotification } = require('../services/notificationService');

exports.sendMessage = async (req, res, next) => {
  try {
    const { chatId, text } = req.body;
    
    // ... existing message creation code ...
    
    // Create and emit notification to user
    await createAndEmitNotification(
      req.user._id,
      'chat',
      `New message from ${contact.name}`,
      text,
      {
        meta: [
          { label: 'From', value: contact.name },
          { label: 'Phone', value: contact.phone },
          { label: 'Time', value: new Date().toLocaleTimeString() }
        ],
        relatedId: chatId,
        data: { chatId, messageId: message._id }
      }
    );
    
    res.status(200).json({ success: true, data: message });
  } catch (error) {
    next(error);
  }
};
*/

// ============================================
// EXAMPLE 2: Campaign Sent Notification
// ============================================
// In server/controllers/campaignController.js
// Add this after campaign status is updated to 'active':

/*
const { createAndEmitNotification } = require('../services/notificationService');

exports.sendCampaign = async (req, res, next) => {
  try {
    const campaignId = req.params.id;
    // ... existing validation code ...
    
    // After background job starts, create notification
    await createAndEmitNotification(
      req.user._id,
      'campaign',
      `Campaign "${campaign.name}" started`,
      `Sending to ${targetAudience.length} contacts via WhatsApp`,
      {
        meta: [
          { label: 'Recipients', value: targetAudience.length.toString() },
          { label: 'Status', value: 'active' },
          { label: 'Template', value: campaign.name }
        ],
        relatedId: campaignId,
        data: { 
          campaignId,
          recipientCount: targetAudience.length,
          templateName: campaign.name
        }
      }
    );
    
    res.status(200).json({ success: true, data: campaign });
  } catch (error) {
    next(error);
  }
};
*/

// ============================================
// EXAMPLE 3: Bulk Contact Import Notification
// ============================================
// In server/controllers/contactControllers.js
// Add this after bulk import completes:

/*
const { createAndEmitNotification } = require('../services/notificationService');

exports.importContacts = async (req, res, next) => {
  try {
    // ... existing import logic ...
    
    const importedCount = importedContacts.length;
    
    // Notify user of import completion
    await createAndEmitNotification(
      req.user._id,
      'contact',
      'Contacts imported successfully',
      `${importedCount} new contacts added to your database`,
      {
        meta: [
          { label: 'Imported', value: importedCount.toString() },
          { label: 'Timestamp', value: new Date().toLocaleString() }
        ],
        relatedId: null,
        data: { importedCount, importSource: 'CSV' }
      }
    );
    
    res.status(200).json({ success: true, imported: importedCount });
  } catch (error) {
    next(error);
  }
};
*/

// ============================================
// EXAMPLE 4: System Alert Notification
// ============================================
// Can be used anywhere in the application:

/*
const { createAndEmitNotification } = require('../services/notificationService');

// Check for low credits and notify
if (userCredits < 100) {
  await createAndEmitNotification(
    userId,
    'alert',
    'Low API Credits Warning',
    `Your account balance is ${userCredits} credits. Auto-recharge is disabled.`,
    {
      meta: [
        { label: 'Current Balance', value: userCredits.toString() },
        { label: 'Warning Level', value: '100' },
        { label: 'Action', value: 'Add credit' }
      ],
      data: { currentBalance: userCredits }
    }
  );
}
*/

// ============================================
// EXAMPLE 5: Mention Notification
// ============================================
// When a user is mentioned in a message:

/*
const { createAndEmitNotification } = require('../services/notificationService');

exports.createComment = async (req, res, next) => {
  try {
    const { mentionedUserId, message } = req.body;
    
    // ... create comment ...
    
    if (mentionedUserId) {
      await createAndEmitNotification(
        mentionedUserId,
        'mention',
        `Mentioned by ${req.user.name}`,
        message,
        {
          meta: [
            { label: 'Mentioned by', value: req.user.name },
            { label: 'Type', value: 'Comment' }
          ],
          data: { mentionedBy: req.user._id, commentId }
        }
      );
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};
*/

// ============================================
// USAGE IN FRONTEND - NotificationPage.jsx
// ============================================
// The NotificationPage.jsx automatically:
// 1. Listens to 'new_notification' events via Socket.IO
// 2. Displays toast notifications
// 3. Updates unread count in real-time
// 4. Shows notifications in a beautiful paginated list
// 5. Supports filtering and search

// Example of listening to notifications in other components:
/*
import { userContext } from '../../context/Context';

const MyComponent = () => {
  const { socket } = useContext(userContext);
  
  useEffect(() => {
    if (!socket) return;
    
    socket.on('new_notification', (notification) => {
      console.log('New notification:', notification);
      // Update UI or trigger actions
    });
    
    return () => {
      socket.off('new_notification');
    };
  }, [socket]);
  
  return <div>My Component</div>;
};
*/

module.exports = {};

const mongoose = require('mongoose');
require('dotenv').config();

const Notification = require('./models/Notification');
const User = require('./models/User');

async function createTestNotification() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get the user named "hitesh" (the logged-in user)
    const user = await User.findOne({ email: { $regex: 'hitesh', $options: 'i' } });
    if (!user) {
      console.error('❌ User "hitesh" not found in database.');
      process.exit(1);
    }

    console.log('Using user:', user._id, 'Email:', user.email);
    
    // Create multiple test notifications
    const notifications = [];
    
    // Campaign notification
    const campaignNotif = await Notification.create({
      userId: user._id,
      type: 'campaign',
      title: 'Campaign "Summer Sale" Started',
      message: 'Your campaign has been sent to 250 contacts via WhatsApp',
      isRead: false,
      meta: [
        { label: 'Recipients', value: '250' },
        { label: 'Status', value: 'active' },
        { label: 'Template', value: 'Summer Sale' }
      ],
      data: {
        campaignId: 'summer-sale-2026',
        recipientCount: 250
      }
    });
    notifications.push(campaignNotif);

    // Chat notification
    const chatNotif = await Notification.create({
      userId: user._id,
      type: 'chat',
      title: 'New message from John Doe',
      message: 'Hi, I would like to know more about your services',
      isRead: false,
      meta: [
        { label: 'From', value: 'John Doe' },
        { label: 'Type', value: 'text' }
      ],
      data: {
        chatId: 'chat-123',
        messageId: 'msg-456'
      }
    });
    notifications.push(chatNotif);

    // Contact notification
    const contactNotif = await Notification.create({
      userId: user._id,
      type: 'contact',
      title: '50 contacts imported successfully',
      message: 'Your CSV import completed with 50 new contacts added',
      isRead: false,
      meta: [
        { label: 'Imported', value: '50' },
        { label: 'Failed', value: '2' },
        { label: 'Total', value: '52' }
      ],
      data: {
        successfulCount: 50,
        failedCount: 2,
        totalCount: 52
      }
    });
    notifications.push(contactNotif);

    console.log('✅ Created 3 test notifications:');
    notifications.forEach((n, i) => {
      console.log(`  ${i + 1}. [${n.type}] ${n.title}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createTestNotification();

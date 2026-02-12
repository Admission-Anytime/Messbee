const Message = require('../models/Message');
const Contact = require('../models/Contact');
const { getIO } = require('../config/socket');

// @desc    Get all conversations
// @route   GET /api/chats/conversations
// @access  Private
exports.getConversations = async (req, res, next) => {
  try {
    const conversations = await Message.aggregate([
      { $match: { user: req.user._id } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$contact',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$sender', 'contact'] }, { $ne: ['$status', 'read'] }] },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'contacts',
          localField: '_id',
          foreignField: '_id',
          as: 'contact'
        }
      },
      { $unwind: '$contact' },
      { $sort: { 'lastMessage.createdAt': -1 } }
    ]);

    res.status(200).json({
      success: true,
      count: conversations.length,
      data: conversations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get messages for a contact
// @route   GET /api/chats/:contactId/messages
// @access  Private
exports.getMessages = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const contact = await Contact.findById(req.params.contactId);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    if (contact.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const messages = await Message.find({
      contact: req.params.contactId,
      user: req.user.id
    })
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Message.countDocuments({
      contact: req.params.contactId,
      user: req.user.id
    });

    res.status(200).json({
      success: true,
      count,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count
      },
      data: messages.reverse()
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send a message
// @route   POST /api/chats/:contactId/messages
// @access  Private
exports.sendMessage = async (req, res, next) => {
  try {
    const contact = await Contact.findById(req.params.contactId);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    if (contact.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const message = await Message.create({
      contact: req.params.contactId,
      sender: 'user',
      content: req.body.content,
      messageType: req.body.messageType || 'text',
      mediaUrl: req.body.mediaUrl,
      user: req.user.id
    });

    // Update contact's last message date
    contact.lastMessageDate = Date.now();
    await contact.save();

    // Emit socket event
    try {
      const io = getIO();
      io.to(req.params.contactId).emit('new-message', message);
    } catch (socketError) {
      console.error('Socket error:', socketError.message);
    }

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark messages as read
// @route   PUT /api/chats/:contactId/read
// @access  Private
exports.markAsRead = async (req, res, next) => {
  try {
    await Message.updateMany(
      {
        contact: req.params.contactId,
        user: req.user.id,
        sender: 'contact',
        status: { $ne: 'read' }
      },
      { status: 'read' }
    );

    res.status(200).json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    next(error);
  }
};

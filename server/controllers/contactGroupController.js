const ContactGroup = require('../models/ContactGroup');
const Contact = require('../models/Contact');

// @desc    Get all contact groups for the user/tenant
// @route   GET /api/contact-groups
// @access  Private
exports.getContactGroups = async (req, res, next) => {
  try {
    const groups = await ContactGroup.find({
      $or: [{ user: req.user.id }, { tenantId: req.user.id }],
      isArchived: false
    }).sort('-createdAt');

    res.status(200).json({
      success: true,
      count: groups.length,
      data: groups
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single contact group with contacts populated
// @route   GET /api/contact-groups/:id
// @access  Private
exports.getContactGroup = async (req, res, next) => {
  try {
    const group = await ContactGroup.findOne({
      _id: req.params.id,
      $or: [{ user: req.user.id }, { tenantId: req.user.id }]
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Contact group not found'
      });
    }

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 50);
    const allContactIds = group.contacts || [];
    const total = allContactIds.length;

    // Slice for fast responsive UI without freezing on 10,000+ contacts
    const contactSlice = allContactIds.slice((page - 1) * limit, page * limit);
    const populatedContacts = await Contact.find({ _id: { $in: contactSlice } })
      .select('name phone whatsapp email company tags');

    res.status(200).json({
      success: true,
      data: {
        ...group.toObject(),
        contacts: populatedContacts,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit) || 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create contact group
// @route   POST /api/contact-groups
// @access  Private
exports.createContactGroup = async (req, res, next) => {
  try {
    const { name, description, contacts, tags } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a group name'
      });
    }

    // Verify contact IDs exist if provided
    let verifiedContacts = [];
    if (Array.isArray(contacts) && contacts.length > 0) {
      const existing = await Contact.find({
        _id: { $in: contacts },
        $or: [{ user: req.user.id }, { tenantId: req.user.id }]
      }).select('_id');
      verifiedContacts = existing.map(c => c._id);
    }

    const group = await ContactGroup.create({
      name: name.trim(),
      description: description || '',
      user: req.user.id,
      tenantId: req.user.id,
      contacts: verifiedContacts,
      tags: Array.isArray(tags) ? tags : [],
      totalContacts: verifiedContacts.length
    });

    res.status(201).json({
      success: true,
      data: group
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update contact group
// @route   PUT /api/contact-groups/:id
// @access  Private
exports.updateContactGroup = async (req, res, next) => {
  try {
    let group = await ContactGroup.findOne({
      _id: req.params.id,
      $or: [{ user: req.user.id }, { tenantId: req.user.id }]
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Contact group not found'
      });
    }

    const { name, description, contacts, tags } = req.body;

    if (name) group.name = name.trim();
    if (description !== undefined) group.description = description;
    if (Array.isArray(tags)) group.tags = tags;

    if (Array.isArray(contacts)) {
      const existing = await Contact.find({
        _id: { $in: contacts },
        $or: [{ user: req.user.id }, { tenantId: req.user.id }]
      }).select('_id');
      group.contacts = existing.map(c => c._id);
      group.totalContacts = group.contacts.length;
    }

    await group.save();

    res.status(200).json({
      success: true,
      data: group
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete contact group
// @route   DELETE /api/contact-groups/:id
// @access  Private
exports.deleteContactGroup = async (req, res, next) => {
  try {
    const group = await ContactGroup.findOneAndDelete({
      _id: req.params.id,
      $or: [{ user: req.user.id }, { tenantId: req.user.id }]
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Contact group not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Contact group deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add contacts to group
// @route   POST /api/contact-groups/:id/contacts
// @access  Private
exports.addContactsToGroup = async (req, res, next) => {
  try {
    const { contactIds } = req.body;
    if (!Array.isArray(contactIds) || contactIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of contactIds'
      });
    }

    const group = await ContactGroup.findOne({
      _id: req.params.id,
      $or: [{ user: req.user.id }, { tenantId: req.user.id }]
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Contact group not found'
      });
    }

    // Verify contacts
    const existing = await Contact.find({
      _id: { $in: contactIds },
      $or: [{ user: req.user.id }, { tenantId: req.user.id }]
    }).select('_id');

    const validIds = existing.map(c => c._id.toString());
    const currentIds = new Set(group.contacts.map(c => c.toString()));

    validIds.forEach(id => currentIds.add(id));
    group.contacts = Array.from(currentIds);
    group.totalContacts = group.contacts.length;

    await group.save();

    res.status(200).json({
      success: true,
      message: `Added ${validIds.length} contacts to group`,
      data: group
    });
  } catch (error) {
    next(error);
  }
};


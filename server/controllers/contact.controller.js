import Contact from '../models/Contact.js';
import { triggerAutomationFromEvent } from '../engine/flowRunner.js';

export const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find({ tenantId: req.user.tenantId }).sort({ lastInteractionAt: -1 });
    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch contacts', error: error.message });
  }
};

export const getContactById = async (req, res) => {
  try {
    const contact = await Contact.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
    if (!contact) return res.status(404).json({ message: 'Contact not found' });
    res.status(200).json(contact);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch contact', error: error.message });
  }
};

export const updateContact = async (req, res) => {
  try {
    const { name, tags, customFields, optInStatus } = req.body;
    
    const oldContact = await Contact.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
    if (!oldContact) return res.status(404).json({ message: 'Contact not found' });

    // customFields comes in as an object, need to ensure it merges or overwrites the Map
    const contact = await Contact.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.tenantId },
      { $set: { name, tags, customFields, optInStatus } },
      { new: true }
    );
    
    // Check for newly added tags
    if (tags && Array.isArray(tags)) {
      const addedTags = tags.filter(t => !oldContact.tags.includes(t));
      for (const tag of addedTags) {
        triggerAutomationFromEvent(contact, 'TAG_ADDED', tag).catch(console.error);
      }
    }

    // Check for updated fields (simple shallow check)
    if (customFields) {
      for (const [key, value] of Object.entries(customFields)) {
        if (oldContact.customFields?.get(key) !== value) {
           triggerAutomationFromEvent(contact, 'FIELD_UPDATED', key).catch(console.error);
        }
      }
    }

    res.status(200).json(contact);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update contact', error: error.message });
  }
};

// Helper function used internally by webhook & flow engine to auto-create leads
export const upsertContactInternal = async (tenantId, channelId, phone, name = 'Unknown') => {
  try {
    const existingContact = await Contact.findOne({ channelId, phone });

    const contact = await Contact.findOneAndUpdate(
      { channelId, phone },
      { 
        $set: { lastInteractionAt: Date.now() },
        $setOnInsert: { tenantId, name, optInStatus: 'PENDING' }
      },
      { upsert: true, new: true }
    );

    // If the contact did not exist before, it's a NEW_CONTACT
    if (!existingContact) {
      triggerAutomationFromEvent(contact, 'NEW_CONTACT', null).catch(console.error);
    }

    return contact;
  } catch (error) {
    console.error('Failed to upsert contact internally:', error.message || error);
    return null;
  }
};

export const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findOneAndDelete({ _id: req.params.id, tenantId: req.user.tenantId });
    if (!contact) return res.status(404).json({ message: 'Contact not found' });
    res.status(200).json({ message: 'Contact deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete contact', error: error.message });
  }
};

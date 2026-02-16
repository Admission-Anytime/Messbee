// const CustomField = require('../../models/CustomField');

// // Helper: create a URL-safe/DB-safe key from a name/value
// const slugifyKey = (value = '') =>
//   value
//     .toString()
//     .trim()
//     .toLowerCase()
//     .replace(/[^a-z0-9]+/g, '_')
//     .replace(/^_+|_+$/g, '')
//     .replace(/_+/g, '_');

// // @desc    Create a custom field
// // @route   POST /api/custom-fields
// // @access  Private

// exports.createCustomField = async (req, res, next) => {

//   try {
//     const { name, type = 'Text', key: incomingKey, description = '', workspaceId } = req.body;

//     // basic validation
//     if (!name || typeof name !== 'string' || !name.trim()) {
//       return res.status(400).json({ success: false, message: 'Field `name` is required' });
//     }

//     // workspaceId is required by the model; prefer explicit body value
//     if (!workspaceId) {
//       return res.status(400).json({ success: false, message: '`workspaceId` is required' });
//     }

//     // validate type
//     const allowedTypes = ['Text', 'Number', 'Date'];
//     if (!allowedTypes.includes(type)) {
//       return res.status(400).json({ success: false, message: `Invalid type — allowed: ${allowedTypes.join(', ')}` });
//     }

//     // generate/normalize key
//     const key = slugifyKey(incomingKey || name);
//     if (!key) {
//       return res.status(400).json({ success: false, message: 'Unable to generate a valid `key` from the provided name/key' });
//     }

//     // ensure uniqueness within workspace
//     const exists = await CustomField.findOne({ 
//         workspaceId, 
//         key, 
//         deletedAt: null 
//     });
//     if (exists) {
//       return res
//       .status(409)
//       .json({ success: false, message: 'A custom field with the same key already exists in this workspace' });
//     }

//     // build payload
//     const payload = {
//       workspaceId,
//       name: name.trim(),
//       type,
//       key,
//       description: (description || '').trim(),
//       createdBy: req.user && (req.user.id || req.user._id) ? (req.user.id || req.user._id) : undefined,
//     };

//     // createdBy is required by schema
//     if (!payload.createdBy) {
//       return res.status(401).json({ success: false, message: 'Unauthorized: missing user context' });
//     }

//     const customField = await CustomField.create(payload);

//     return res.status(201)
//     .json({
//         success: true, 
//         data: customField });
//   } catch (err) {

//     // Mongo duplicate-key safeguard (in case race-condition bypasses the pre-check)
// if (err && err.code === 11000) {
//     return res
//     .status(409)
//     .json({ success: false, message: 'Duplicate key — a custom field with that key already exists in this workspace' });
//     }
//     next(err);
    
//   }
// };



const CustomField = require('../../models/CustomField');

// Helper: create a URL-safe/DB-safe key from a name/value
const slugifyKey = (value = '') =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_');

// @desc    Create a custom field
// @route   POST /api/custom-fields/create
// @access  Private
exports.createCustomField = async (req, res, next) => {
  try {
    const { name, type = 'Text', key: incomingKey, description = '' } = req.body;

    // Basic validation
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Field `name` is required' 
      });
    }

    // Validate type
    const allowedTypes = ['Text', 'Number', 'Date'];
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid type — allowed: ${allowedTypes.join(', ')}` 
      });
    }

    // Generate/normalize key
    const key = slugifyKey(incomingKey || name);
    if (!key) {
      return res.status(400).json({ 
        success: false, 
        message: 'Unable to generate a valid `key` from the provided name/key' 
      });
    }

    // Ensure uniqueness (globally)
    const exists = await CustomField.findOne({ 
      key, 
      deletedAt: null 
    });
    
    if (exists) {
      return res.status(409).json({ 
        success: false, 
        message: 'A custom field with the same key already exists' 
      });
    }

    // Build payload
    const payload = {
      name: name.trim(),
      type,
      key,
      description: (description || '').trim(),
      createdBy: req.user && (req.user.id || req.user._id) ? (req.user.id || req.user._id) : undefined,
    };

    // createdBy is required by schema
    if (!payload.createdBy) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized: missing user context' 
      });
    }

    const customField = await CustomField.create(payload);

    return res.status(201).json({
      success: true,
      message: 'Custom field created successfully',
      data: customField 
    });
    
  } catch (err) {
    // Mongo duplicate-key safeguard (in case race-condition bypasses the pre-check)
    if (err && err.code === 11000) {
      return res.status(409).json({ 
        success: false, 
        message: 'Duplicate key — a custom field with that key already exists' 
      });
    }
    
    next(err);
  }
};
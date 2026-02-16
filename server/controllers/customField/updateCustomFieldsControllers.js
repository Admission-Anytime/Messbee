// const mongoose = require("mongoose");
// const CustomField = require("../../models/CustomField");

// // Utility function to convert a string into a safe DB key
// // Example: "Institute Name" -> "institute_name"
// const slugifyKey = (value = "") =>
//   String(value)
//     .trim()
//     .toLowerCase()
//     .replace(/[^a-z0-9]+/g, "_")
//     .replace(/^_+|_+$/g, "")
//     .replace(/_+/g, "_");

// // Allowed field types (validation reference)
// const ALLOWED_TYPES = ["Text", "Number", "Date"];

// exports.updateCustomField = async (req, res, next) => {
//   try {
//     // Extract id from URL params and fields from request body
//     const { id } = req.params;
//     const { name, type, key, description } = req.body;

//     // 1️ Validate MongoDB ObjectId format
//     if (!id || !mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ success: false, message: "Valid custom field id is required." });
//     }

//     // 2️ Fetch existing field (ignore soft-deleted records)
//     const field = await CustomField.findOne({ _id: id, deletedAt: null });
//     if (!field) {
//       return res.status(404).json({ success: false, message: "Custom field not found." });
//     }

//     // 3️ Validate only the fields provided in request (partial update support)

//     // Validate name if it is sent
//     if (name !== undefined && (typeof name !== "string" || !name.trim())) {
//       return res.status(400).json({ success: false, message: "name must be a non-empty string." });
//     }

//     // Validate type if it is sent
//     if (type !== undefined && !ALLOWED_TYPES.includes(type)) {
//       return res.status(400).json({
//         success: false,
//         message: `type must be one of: ${ALLOWED_TYPES.join(", ")}`,
//       });
//     }

//     // 4️ Prepare updated values (keep old values if not provided)

//     const nextName = name !== undefined ? name.trim() : field.name;
//     const nextType = type !== undefined ? type : field.type;

//     // Normalize key if provided
//     const nextKey = key !== undefined ? slugifyKey(key) : field.key;
//     if (key !== undefined && !nextKey) {
//       return res.status(400).json({ success: false, message: "Invalid key." });
//     }

//     const nextDescription =
//       description !== undefined ? String(description || "").trim() : field.description;

//     // 5️ Check uniqueness inside same workspace (avoid duplicate name or key)

//     const nameChanged = nextName !== field.name;
//     const keyChanged = nextKey !== field.key;

//     if (nameChanged || keyChanged) {
//       const conflict = await CustomField.findOne({
//         _id: { $ne: field._id }, // exclude current document
//         workspaceId: field.workspaceId, // limit to same workspace
//         deletedAt: null,
//         $or: [{ name: nextName }, { key: nextKey }],
//       });

//       if (conflict) {
//         if (conflict.key === nextKey) {
//           return res.status(409).json({ success: false, message: "Technical key already exists in this workspace." });
//         }
//         if (conflict.name === nextName) {
//           return res.status(409).json({ success: false, message: "Field name already exists in this workspace." });
//         }
//         return res.status(409).json({ success: false, message: "Custom field already exists in this workspace." });
//       }
//     }

//     // 6️ Apply updates to document
//     field.name = nextName;
//     field.type = nextType;
//     field.key = nextKey;
//     field.description = nextDescription;

//     // Save changes to database
//     await field.save();

//     // Send success response
//     return res.status(200).json({
//       success: true,
//       message: "Custom field updated successfully.",
//       data: field,
//     });

//   } catch (err) {
//     // Handle duplicate key error from MongoDB (race condition safety)
//     if (err && err.code === 11000) {
//       return res.status(409).json({
//         success: false,
//         message: "Duplicate key — a custom field with that key already exists in this workspace",
//       });
//     }

//     // Pass other errors to global error handler middleware
//     return next(err);
//   }
// };





const mongoose = require("mongoose");
const CustomField = require("../../models/CustomField");

// Utility function to convert a string into a safe DB key
const slugifyKey = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_");

// Allowed field types (validation reference)
const ALLOWED_TYPES = ["Text", "Number", "Date"];

// @desc    Update a custom field
// @route   PUT /api/custom-fields/update/:id
// @access  Private
exports.updateCustomField = async (req, res, next) => {
  try {
    // Extract id from URL params and fields from request body
    const { id } = req.params;
    const { name, type, key, description } = req.body;

    // 1️⃣ Validate MongoDB ObjectId format
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: "Valid custom field id is required." 
      });
    }

    // 2️⃣ Fetch existing field (ignore soft-deleted records)
    const field = await CustomField.findOne({ _id: id, deletedAt: null });
    if (!field) {
      return res.status(404).json({ 
        success: false, 
        message: "Custom field not found." 
      });
    }

    // 3️⃣ Validate only the fields provided in request (partial update support)

    // Validate name if it is sent
    if (name !== undefined && (typeof name !== "string" || !name.trim())) {
      return res.status(400).json({ 
        success: false, 
        message: "name must be a non-empty string." 
      });
    }

    // Validate type if it is sent
    if (type !== undefined && !ALLOWED_TYPES.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `type must be one of: ${ALLOWED_TYPES.join(", ")}`,
      });
    }

    // 4️⃣ Prepare updated values (keep old values if not provided)
    const nextName = name !== undefined ? name.trim() : field.name;
    const nextType = type !== undefined ? type : field.type;

    // Normalize key if provided
    const nextKey = key !== undefined ? slugifyKey(key) : field.key;
    if (key !== undefined && !nextKey) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid key." 
      });
    }

    const nextDescription =
      description !== undefined ? String(description || "").trim() : field.description;

    // 5️⃣ Check uniqueness globally (avoid duplicate name or key)
    const nameChanged = nextName !== field.name;
    const keyChanged = nextKey !== field.key;

    if (nameChanged || keyChanged) {
      const conflict = await CustomField.findOne({
        _id: { $ne: field._id }, // exclude current document
        deletedAt: null,
        $or: [{ name: nextName }, { key: nextKey }],
      });

      if (conflict) {
        if (conflict.key === nextKey) {
          return res.status(409).json({ 
            success: false, 
            message: "Technical key already exists." 
          });
        }
        if (conflict.name === nextName) {
          return res.status(409).json({ 
            success: false, 
            message: "Field name already exists." 
          });
        }
        return res.status(409).json({ 
          success: false, 
          message: "Custom field already exists." 
        });
      }
    }

    // 6️⃣ Apply updates to document
    field.name = nextName;
    field.type = nextType;
    field.key = nextKey;
    field.description = nextDescription;
    
    // Track who updated
    if (req.user && (req.user.id || req.user._id)) {
      field.updatedBy = req.user.id || req.user._id;
    }

    // Save changes to database
    await field.save();

    // Send success response
    return res.status(200).json({
      success: true,
      message: "Custom field updated successfully.",
      data: field,
    });

  } catch (err) {
    // Handle duplicate key error from MongoDB (race condition safety)
    if (err && err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Duplicate key — a custom field with that key already exists",
      });
    }

    // Pass other errors to global error handler middleware
    return next(err);
  }
};
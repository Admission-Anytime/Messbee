
const mongoose = require("mongoose");
const CustomField = require("../../models/CustomField");

/**
 * @desc    Delete a custom field (soft delete)
 * @route   DELETE /api/custom-fields/delete/:id
 * @access  Private
 */

exports.deleteCustomField = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        message: "Valid custom field id is required." 
      });
    }
    
    // Find the field (not already deleted)
    const field = await CustomField.findOne({ _id: id, deletedAt: null });
    if (!field) {
      return res.status(404).json({ 
        success: false,
        message: "Custom field not found." 
      });
    }

    // Soft delete
    field.deletedAt = new Date();
    await field.save();

    return res.status(200).json({
      success: true,
      message: "Custom field deleted successfully"
    });

  } catch (err) {
    console.error("Delete custom field error:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
      message: "Server error"
    });
  }
};



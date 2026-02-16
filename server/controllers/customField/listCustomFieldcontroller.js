
const CustomField = require('../../models/CustomField');


exports.listCustomFields = async (req, res, next) => {
  try {
   
    const customFields = await CustomField.find({ 
      deletedAt: null // Only get non-deleted fields
    })
    .sort({ createdAt: -1 }) // Newest first (-1 = descending, 1 = ascending)
    .lean(); // Convert to plain JavaScript objects (slightly faster)

    
    return res.status(200).json({
      success: true,
      message: 'Custom fields retrieved successfully',
      data: customFields, // Array of custom field objects
      count: customFields.length // Optional: total count
    });

  } catch (err) {
    
    console.error('List custom fields error:', err);
    return next(err);
  }
};



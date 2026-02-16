// const mongoose = require('mongoose')

// const CustomFieldSchema = new mongoose.Schema(
//   {
//     // workspaceId: {
//     //   type: mongoose.Schema.Types.ObjectId,
//     //   ref: "Workspace",
//     //   index: true,
//     // },

//     name: { 
//         type: String, 
//         required: true, 
//         trim: true,
//         maxlength: 80 },
//         description: { type: String, default: "", trim: true, maxlength: 200 },

//     type: {
//       type: String,
//       enum: ["Text", "Number", "Date"],
//       required: true,
//       default: "Text",
//     },

//     key: { 
//         type: String, 
//         required: true, 
//         trim: true, 
//         lowercase: true 
//     },

//     isActive: { 
//         type: Boolean, 
//         default: true },

//     createdBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },

//     updatedBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       default: null,
//     },

//     deletedAt: { type: Date, default: null }, // soft delete (recommended)
//   },

//   { timestamps: true }

// );

// // unique technical key per workspace
// CustomFieldSchema.index(
//   { 
//     workspaceId: 1, 
//     key: 1 
//   },
//   { 
//     unique: true, 
//     partialFilterExpression: { deletedAt: null } }
// );

// module.exports = mongoose.model("CustomField", CustomFieldSchema);




const mongoose = require('mongoose');

const CustomFieldSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true,
      maxlength: 80 
    },
    
    description: { 
      type: String, 
      default: "", 
      trim: true, 
      maxlength: 200 
    },

    type: {
      type: String,
      enum: ["Text", "Number", "Date"],
      required: true,
      default: "Text",
    },

    key: { 
      type: String, 
      required: true, 
      trim: true, 
      lowercase: true 
    },

    isActive: { 
      type: Boolean, 
      default: true 
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    deletedAt: { 
      type: Date, 
      default: null 
    },
  },
  { timestamps: true }
);

// Unique technical key (globally unique, not per workspace)
CustomFieldSchema.index(
  { key: 1 },
  { 
    unique: true, 
    partialFilterExpression: { deletedAt: null } 
  }
);

// Populate createdBy when querying
CustomFieldSchema.pre(/^find/, function(next) {
  if (this.options.skipPopulate) {
    return next();
  }
  
  this.populate({
    path: 'createdBy',
    select: 'name email',
  });
  
  next();
});

module.exports = mongoose.model("CustomField", CustomFieldSchema);


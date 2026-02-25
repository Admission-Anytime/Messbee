// const mongoose = require('mongoose');

// const ContactSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: [true, 'Please add a contact name'],
//     trim: true
//   },
//   phone: {
//     type: String,
//     required: [true, 'Please add a phone number'],
//     unique: true
//   },
//   email: {
//     type: String,
//     lowercase: true,
//     match: [
//       /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
//       'Please add a valid email'
//     ]
//   },
//   company: {
//     type: String
//   },
//   tags: [{
//     type: String
//   }],
//   notes: {
//     type: String
//   },
//   user: {
//     type: mongoose.Schema.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   isActive: {
//     type: Boolean,
//     default: true
//   },
//   lastMessageDate: {
//     type: Date
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now
//   },
//   updatedAt: {
//     type: Date,
//     default: Date.now
//   }
// });

// // Update the updatedAt timestamp before saving
// ContactSchema.pre('save', function(next) {
//   this.updatedAt = Date.now();
//   next();
// });

// module.exports = mongoose.model('Contact', ContactSchema);



const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Core fields
    name:{
      type: String, 
      trim: true
      },

    whatsapp:{
      type: String, 
      trim: true 
    },

    phone:{ 
      type: String, 
      trim: true, 
      default: '' 
    },

    email:{ 
      type: String, 
      trim: true, 
      lowercase: true, 
      default: '' 
    },

    // Profile
    company:{ 
      type: String, 
      trim: true, 
      default: '' 
    },

    institute:{
      type: String, 
      trim: true, 
      default: '' 
    },

    address:{ 
      type: String, 
      trim: true, 
      default: '' 
    },

    city:{ 
      type: String, 
      trim: true, 
      default: '' 
    },

    country:{
      type: String, 
      trim: true, 
      default: '' 
    },

    // CRM
    status: {
      type: String,
      enum: ['ACTIVE', 'WARM', 'INACTIVE', 'COLD'],
      default: 'ACTIVE',
    },

    labels: [
      { 
        type: String, 
        trim: true 
      }],

    // Avatar display (generated on frontend, stored for consistency)
    initials:{ 
      type: String, 
      default: '' 
    },

    color:{ 
      type: String, 
      default: '#4CAF50' 
    },

    // Import tracking
    importedFrom: { 
      type: String, 
      default: null 
    }, // filename if imported
  },

  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }

);

// ✅ Updated compound index
// Whatsapp must be unique per user ONLY when it exists and is not null/empty
ContactSchema.index(
  { user: 1, whatsapp: 1 },
  {
    unique: true,
    partialFilterExpression: {
      whatsapp: { $exists: true, $ne: null, $ne: "" }
    }
  }
);

// Text index for search
ContactSchema.index({ name: 'text', email: 'text', whatsapp: 'text' });

// Auto-generate initials and color if not provided
ContactSchema.pre('save', function (next) {
  if (!this.initials && this.name) {
    this.initials = this.name.substring(0, 2).toUpperCase();
  }
  if (!this.color) {
    const colors = ['#4CAF50','#FF9800','#607D8B','#5C6BC0','#E91E63','#009688','#795548','#3F51B5','#FF5722','#9C27B0'];
    this.color = colors[Math.floor(Math.random() * colors.length)];
  }
  next();
});



module.exports = mongoose.model('Contact', ContactSchema);



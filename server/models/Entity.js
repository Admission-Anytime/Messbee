const mongoose = require('mongoose');

/**
 * Universal Meta-Object Model: Entity
 * Represents ANY schedulable or bookable resource in the universe.
 * Examples: doctor, hotel room, seat, vehicle, parking spot, interview slot, grooming bay, etc.
 *
 * Architecture Reference: UNIVERSAL_REALTIME_SLOT_BOOKING_ARCHITECTURE.md §2.1
 */
const entitySchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true
  },
  channelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channel',
    index: true
  },

  // Abstract Unique Identifier & Label
  identifier: {
    type: String,
    required: true,
    trim: true
  }, // e.g. "DOCTOR_RAMESH", "SEAT_4B", "ROOM_101", "TECH_ANKIT"

  name: {
    type: String,
    required: true,
    trim: true
  }, // Human-readable label, e.g. "Dr. Ramesh Kumar - Cardiology"

  category: {
    type: String,
    default: 'general',
    trim: true
  }, // e.g. "doctor", "room", "seat", "vehicle" — purely descriptive, not enforced

  // Mathematical Concurrency Constraints
  totalCapacity: {
    type: Number,
    default: 1,
    min: 1
  }, // Max parallel allocations (1 = exclusive, 50 = seminar)

  allocationStepMinutes: {
    type: Number,
    default: 30,
    min: 1
  }, // Discrete temporal quantum for slot generation (15, 30, 60 min)

  clearanceBufferMinutes: {
    type: Number,
    default: 0,
    min: 0
  }, // Post-allocation gap before next slot can start

  // Multi-Shift Temporal Matrix (when this entity can be allocated)
  availabilityWindows: [
    {
      dayOfWeek: {
        type: Number,
        min: 0,
        max: 6
      }, // 0=Sunday, 1=Monday ... 6=Saturday
      activeIntervals: [
        {
          start: { type: String }, // "HH:mm" e.g. "09:00"
          end: { type: String }    // "HH:mm" e.g. "13:00"
        }
      ],
      blackoutIntervals: [
        {
          start: { type: String }, // e.g. lunch "13:00"
          end: { type: String }    // e.g. "14:00"
        }
      ]
    }
  ],

  // Calendar Date Exceptions (Overrides standard weekly schedule)
  exceptions: [
    {
      date: { type: String },             // "YYYY-MM-DD"
      isAvailable: { type: Boolean, default: false },
      customIntervals: [
        {
          start: { type: String },
          end: { type: String }
        }
      ]
    }
  ],

  // Schema-less Polymorphic Properties (any arbitrary business-specific fields)
  properties: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, { timestamps: true });

// Compound index: identifier unique per tenant
entitySchema.index({ tenantId: 1, identifier: 1 }, { unique: true });
entitySchema.index({ tenantId: 1, channelId: 1, isActive: 1 });

module.exports = mongoose.model('Entity', entitySchema);

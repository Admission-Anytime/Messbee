const mongoose = require('mongoose');

/**
 * Universal Allocation & Transaction Record
 * Represents ANY claimed slot, reservation, appointment, seat, or booking.
 *
 * Architecture Reference: UNIVERSAL_REALTIME_SLOT_BOOKING_ARCHITECTURE.md §2.2
 *
 * Lifecycle:
 *   HOLD (5-min TTL) → COMMITTED (confirmed) → FULFILLED (completed)
 *                    ↘ RELEASED (cancelled/expired)
 */
const allocationSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true
  },
  channelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channel',
    required: true,
    index: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Entity',
    required: true,
    index: true
  },

  // Actor Reference
  customerPhone: {
    type: String,
    required: true,
    index: true
  },

  // Session reference (links to CustomerSession for context)
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CustomerSession',
    default: null
  },

  // Canonical UTC Temporal Interval [startEpochMs, endEpochMs)
  startEpochMs: {
    type: Number,
    required: true,
    index: true
  },
  endEpochMs: {
    type: Number,
    required: true,
    index: true
  },

  // Allocation Units Claimed (default 1; use >1 for group bookings, seats, etc.)
  unitsClaimed: {
    type: Number,
    default: 1,
    min: 1
  },

  // Deterministic Lifecycle FSM
  state: {
    type: String,
    enum: [
      'HOLD',       // Temporary 5-min atomic hold while customer finalises
      'COMMITTED',  // Permanently confirmed reservation
      'RELEASED',   // Cancelled, revoked, or expired hold
      'FULFILLED'   // Successfully concluded (appointment attended, service done)
    ],
    default: 'HOLD',
    index: true
  },

  // Auto-expiring TTL lease for HOLD state
  // MongoDB TTL index will delete HOLD docs after leaseExpiresAt
  leaseExpiresAt: {
    type: Date,
    default: null
  },

  // Human-readable slot label for display in messages (e.g. "10:00 AM - 10:30 AM")
  slotLabel: {
    type: String,
    default: ''
  },

  // Date label (e.g. "15 Oct 2026") for message interpolation
  dateLabel: {
    type: String,
    default: ''
  },

  // Schema-less context snapshot (ALL flow variables collected along the DAG path)
  contextSnapshot: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  // Optional cancellation/fulfilment notes
  notes: {
    type: String,
    default: ''
  }
}, { timestamps: true });

// Auto-evict stale HOLD allocations via MongoDB TTL index
allocationSchema.index({ leaseExpiresAt: 1 }, { expireAfterSeconds: 0 });

// Atomic conflict-detection compound index
allocationSchema.index({ entityId: 1, startEpochMs: 1, endEpochMs: 1, state: 1 });

// Fast lookup by customer phone for managing their bookings
allocationSchema.index({ customerPhone: 1, state: 1, startEpochMs: 1 });

module.exports = mongoose.model('Allocation', allocationSchema);

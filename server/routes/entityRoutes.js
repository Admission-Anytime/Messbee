/**
 * Entity & Allocation REST API Routes
 *
 * Provides CRUD for entities and real-time slot availability queries.
 * All routes are tenant-scoped via auth middleware.
 *
 * Architecture Reference: UNIVERSAL_REALTIME_SLOT_BOOKING_ARCHITECTURE.md
 */

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Entity = require('../models/Entity.js');
const Allocation = require('../models/Allocation.js');
const {
  getAvailableSlotsForDate,
  getAvailableSlotsRange,
  claimEntityQuantum,
  commitAllocation,
  releaseAllocation,
  fulfillAllocation,
  checkSlotAvailability
} = require('../services/slotBookingEngine.js');
const { protect } = require('../middleware/auth.js');

// ─────────────────────────────────────────────────────────
// 1. ENTITY COLLECTION (Base collection routes)
// ─────────────────────────────────────────────────────────

/**
 * GET /api/entities
 * List all entities for the tenant (with optional channelId filter)
 */
router.get('/', protect, async (req, res) => {
  try {
    const { channelId, category, isActive } = req.query;
    const filter = { tenantId: req.user.tenantId || req.user._id };
    if (channelId) filter.channelId = channelId;
    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const entities = await Entity.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: entities });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/entities
 * Create a new entity
 */
router.post('/', protect, async (req, res) => {
  try {
    const tenantId = req.user.tenantId || req.user._id;
    const entity = await Entity.create({ ...req.body, tenantId });
    res.status(201).json({ success: true, data: entity });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Entity identifier already exists for this tenant.' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────
// 2. ALLOCATION MANAGEMENT (Placed BEFORE /:id to prevent routing collision)
// ─────────────────────────────────────────────────────────

/**
 * GET /api/entities/allocations
 * List all allocations for the tenant (with filters)
 */
router.get('/allocations', protect, async (req, res) => {
  try {
    const { entityId, state, customerPhone, from, to } = req.query;
    const tenantId = req.user.tenantId || req.user._id;

    const filter = { tenantId };
    if (entityId) filter.entityId = entityId;
    if (state) filter.state = state;
    if (customerPhone) filter.customerPhone = { $regex: customerPhone, $options: 'i' };
    if (from) filter.startEpochMs = { $gte: parseInt(from, 10) };
    if (to) filter.endEpochMs = { ...filter.endEpochMs, $lte: parseInt(to, 10) };

    const allocations = await Allocation.find(filter)
      .populate('entityId', 'name identifier category')
      .sort({ startEpochMs: 1 })
      .limit(200);

    res.json({ success: true, data: allocations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/entities/allocations/claim
 * Atomically claim a slot quantum (creates 5-min HOLD)
 */
router.post('/allocations/claim', protect, async (req, res) => {
  try {
    const tenantId = req.user.tenantId || req.user._id;
    const result = await claimEntityQuantum({ tenantId, ...req.body });
    if (!result.success) {
      return res.status(409).json({ success: false, ...result });
    }
    res.status(201).json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/entities/allocations/:id/commit
 * Confirm a HOLD → COMMITTED
 */
router.post('/allocations/:id/commit', protect, async (req, res) => {
  try {
    const result = await commitAllocation(req.params.id, req.body.extraContext || {});
    if (!result.success) {
      return res.status(400).json({ success: false, ...result });
    }
    res.json({ success: true, message: 'Allocation committed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/entities/allocations/:id/release
 * Cancel / release an allocation
 */
router.post('/allocations/:id/release', protect, async (req, res) => {
  try {
    const result = await releaseAllocation(req.params.id);
    if (!result.success) {
      return res.status(400).json({ success: false, ...result });
    }
    res.json({ success: true, message: 'Allocation released' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/entities/allocations/:id/fulfill
 * Mark allocation as FULFILLED
 */
router.post('/allocations/:id/fulfill', protect, async (req, res) => {
  try {
    const result = await fulfillAllocation(req.params.id);
    if (!result.success) {
      return res.status(400).json({ success: false, ...result });
    }
    res.json({ success: true, message: 'Allocation fulfilled' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────
// 3. SPECIFIC ENTITY BY ID & SLOT AVAILABILITY
// ─────────────────────────────────────────────────────────

/**
 * ALL /api/entities/:id/check-availability
 * Public / Flow-accessible endpoint for checking real-time slot availability
 */
router.all('/:id/check-availability', async (req, res) => {
  try {
    let targetEntityId = req.params.id;
    if (targetEntityId === 'dynamic') {
      targetEntityId = req.body?.entityId ||
        req.body?.selected_doctor_id ||
        req.body?.doctor_id ||
        req.body?.booking_entity_id ||
        req.body?.doctor_name ||
        req.query?.entityId ||
        req.query?.selected_doctor_id ||
        req.query?.doctor_id;
    }
    const datetime = req.method === 'POST'
      ? (req.body?.datetime || req.body?.preferred_datetime || '')
      : (req.query?.datetime || req.query?.preferred_datetime || '');
    const result = await checkSlotAvailability(targetEntityId, datetime);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/entities/:id/slots?date=YYYY-MM-DD
 * Real-time available slots for an entity on a specific date
 */
router.get('/:id/slots', protect, async (req, res) => {
  try {
    const { date } = req.query;
    const queryDate = date ? new Date(date) : new Date();
    const slots = await getAvailableSlotsForDate(req.params.id, queryDate);
    res.json({ success: true, date: queryDate.toISOString().split('T')[0], slots });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/entities/:id/slots/range?days=7
 * Real-time available slots for next N days
 */
router.get('/:id/slots/range', protect, async (req, res) => {
  try {
    const daysAhead = parseInt(req.query.days || '7', 10);
    const slotsRange = await getAvailableSlotsRange(req.params.id, daysAhead);
    res.json({ success: true, data: slotsRange });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/entities/:id
 * Get single entity by ID
 */
router.get('/:id', protect, async (req, res) => {
  try {
    const entity = await Entity.findOne({
      _id: req.params.id,
      tenantId: req.user.tenantId || req.user._id
    });
    if (!entity) return res.status(404).json({ success: false, message: 'Entity not found' });
    res.json({ success: true, data: entity });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * PUT /api/entities/:id
 * Update entity
 */
router.put('/:id', protect, async (req, res) => {
  try {
    const entity = await Entity.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.tenantId || req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!entity) return res.status(404).json({ success: false, message: 'Entity not found' });
    res.json({ success: true, data: entity });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * DELETE /api/entities/:id
 * Soft-delete entity (sets isActive=false)
 */
router.delete('/:id', protect, async (req, res) => {
  try {
    const entity = await Entity.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.tenantId || req.user._id },
      { isActive: false },
      { new: true }
    );
    if (!entity) return res.status(404).json({ success: false, message: 'Entity not found' });
    res.json({ success: true, message: 'Entity deactivated', data: entity });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

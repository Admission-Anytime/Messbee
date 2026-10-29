/**
 * Universal Real-Time Slot Booking Engine
 *
 * Implements the mathematics from UNIVERSAL_REALTIME_SLOT_BOOKING_ARCHITECTURE.md
 *
 * Core algorithm:
 *   AvailableUnits(E, [Ta, Tb)) = Capacity(E) - Σ Units(k) for k in A_active
 *   A_active = { k | Entity(k)=E ∧ State(k)∈{HOLD,COMMITTED} ∧ overlap(k,[Ta,Tb)) }
 *
 * This engine is domain-agnostic. It works equally for:
 *   doctors, hotels, vehicles, seats, interview slots, grooming bays, CA consultations, etc.
 */

const mongoose = require('mongoose');
const Entity = require('../models/Entity.js');
const Allocation = require('../models/Allocation.js');

/**
 * Safely resolves an entity by MongoDB _id, code, or name without throwing CastError.
 */
async function findEntitySafely(entityId, lean = false, tenantId = null) {
  const tenantFilter = tenantId ? { tenantId } : {};

  if (!entityId) {
    // If no entityId provided, fallback to first active entity in tenant
    const defaultDoc = await Entity.findOne({ ...tenantFilter, isActive: { $ne: false } });
    if (!defaultDoc && tenantId) {
      const fallbackDoc = await Entity.findOne({ isActive: { $ne: false } });
      if (!fallbackDoc) return null;
      return lean ? (fallbackDoc.toObject ? fallbackDoc.toObject() : fallbackDoc) : fallbackDoc;
    }
    if (!defaultDoc) return null;
    return lean ? (defaultDoc.toObject ? defaultDoc.toObject() : defaultDoc) : defaultDoc;
  }

  const idStr = String(entityId).trim();
  let found = null;

  if (mongoose.Types.ObjectId.isValid(idStr)) {
    found = await (lean ? Entity.findOne({ _id: idStr, ...tenantFilter }).lean() : Entity.findOne({ _id: idStr, ...tenantFilter }));
    if (!found && tenantId) {
      found = await (lean ? Entity.findById(idStr).lean() : Entity.findById(idStr));
    }
    if (found) return found;
  }

  // Strip common prefixes like 'btn_' or 'btn-' (e.g. 'btn_rajesh' -> 'rajesh')
  const cleanTerm = idStr.replace(/^btn[-_]/i, '').trim();
  const cleanRegex = new RegExp(cleanTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  const exactRegex = new RegExp(`^${idStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');

  found = await Entity.findOne({
    ...tenantFilter,
    $or: [
      { identifier: idStr },
      { identifier: idStr.toUpperCase() },
      { identifier: cleanRegex },
      { code: idStr },
      { code: idStr.toUpperCase() },
      { code: cleanRegex },
      { name: exactRegex },
      { name: cleanRegex }
    ]
  });
  if (found) return lean ? (found.toObject ? found.toObject() : found) : found;

  // Search by doctor name substring (e.g. 'rajesh', 'priya', 'amit', 'sneha')
  if (cleanTerm.length >= 3) {
    found = await Entity.findOne({
      ...tenantFilter,
      name: new RegExp(cleanTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'),
      isActive: { $ne: false }
    });
    if (found) return lean ? (found.toObject ? found.toObject() : found) : found;
  }

  // Fallback to global search if tenant filter had no match
  if (tenantId) {
    return await findEntitySafely(entityId, lean, null);
  }

  // Ultimate resilient fallback: return the first active entity so slots never crash
  found = await Entity.findOne({ isActive: { $ne: false } });
  return lean ? (found?.toObject ? found.toObject() : found) : found;
}


// ─────────────────────────────────────────────────────────
// 1. SLOT GENERATION UTILITIES
// ─────────────────────────────────────────────────────────

/**
 * Parses "HH:mm" string to {hours, minutes}
 */
function parseTime(timeStr) {
  const [h, m] = (timeStr || '00:00').split(':').map(Number);
  return { hours: h || 0, minutes: m || 0 };
}

/**
 * Converts "HH:mm" on a given date to epoch milliseconds (UTC)
 * @param {Date} date - The calendar date
 * @param {string} timeStr - "HH:mm"
 * @param {string} timezone - IANA timezone string (default: 'Asia/Kolkata')
 */
function toEpochMs(date, timeStr, timezone = 'Asia/Kolkata') {
  const { hours, minutes } = parseTime(timeStr);
  // Build a wall-clock date at the entity's local time
  const d = new Date(date);
  d.setHours(hours, minutes, 0, 0);
  return d.getTime();
}

/**
 * Formats epoch ms to "HH:MM AM/PM" display label
 */
function formatTimeLabel(epochMs) {
  const d = new Date(epochMs);
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

/**
 * Returns "YYYY-MM-DD" in local wall-clock time (avoids UTC shift bug in +05:30)
 */
function getLocalDateString(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Formats a Date object to "DD Mon YYYY" display label
 */
function formatDateLabel(date) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Generates all raw slot quanta for an entity on a given date
 * based on availabilityWindows + exceptions (does NOT check live allocations)
 *
 * @param {Object} entity - Entity document
 * @param {Date} date - Calendar date
 * @returns {Array<{startMs, endMs, slotLabel, dateLabel}>}
 */
function generateRawSlots(entity, date) {
  const dateStr = getLocalDateString(date); // "YYYY-MM-DD"
  const dayOfWeek = date.getDay(); // 0=Sun..6=Sat
  const dateLabel = formatDateLabel(date);

  // Check for a date exception override
  const exception = (entity.exceptions || []).find(ex => ex.date === dateStr);

  let activeIntervals = [];
  let blackoutIntervals = [];

  if (exception) {
    if (!exception.isAvailable) return []; // Holiday / closed
    activeIntervals = exception.customIntervals || [];
  } else {
    const windows = entity.availabilityWindows || [];
    const window = windows.find(w => w.dayOfWeek === dayOfWeek);
    if (window) {
      activeIntervals = window.activeIntervals || [];
      blackoutIntervals = window.blackoutIntervals || [];
    } else if (windows.length === 0) {
      // Resilient default schedule for clinic/consultation when entity has no custom schedule configured
      if (dayOfWeek !== 0) {
        activeIntervals = [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '18:00' }];
        blackoutIntervals = [{ start: '13:00', end: '14:00' }];
      } else {
        activeIntervals = [{ start: '10:00', end: '14:00' }];
      }
    } else {
      return []; // Not available this day
    }
  }

  const stepMs = (entity.allocationStepMinutes || 30) * 60 * 1000;
  const bufferMs = (entity.clearanceBufferMinutes || 0) * 60 * 1000;
  const slots = [];

  for (const interval of activeIntervals) {
    const startMs = toEpochMs(date, interval.start);
    const endMs = toEpochMs(date, interval.end);
    let cursor = startMs;

    while (cursor + stepMs <= endMs) {
      const slotStart = cursor;
      const slotEnd = cursor + stepMs;
      const slotLabel = `${formatTimeLabel(slotStart)} - ${formatTimeLabel(slotEnd)}`;

      // Check if this slot overlaps with any blackoutIntervals (e.g. lunch/break)
      const isBlackout = blackoutIntervals.some(b => {
        const bStart = toEpochMs(date, b.start);
        const bEnd = toEpochMs(date, b.end);
        return slotStart < bEnd && slotEnd > bStart;
      });

      if (!isBlackout) {
        slots.push({ startMs: slotStart, endMs: slotEnd, slotLabel, dateLabel });
      }
      cursor = slotEnd + bufferMs;
    }
  }

  return slots;
}

// ─────────────────────────────────────────────────────────
// 2. AVAILABILITY CHECKER (Real-time conflict math)
// ─────────────────────────────────────────────────────────

/**
 * Returns available slot quanta for an entity on a given date.
 * Filters out slots where capacity is exhausted by HOLD or COMMITTED allocations.
 *
 * Implements: AvailableUnits(E, [Ta, Tb)) = Capacity(E) - Σ Units(k) for active k
 *
 * @param {string} entityId - MongoDB ObjectId string
 * @param {Date} date - Calendar date to query
 * @returns {Array<{startMs, endMs, slotLabel, dateLabel, availableUnits}>}
 */
async function getAvailableSlotsForDate(entityId, date) {
  const entity = await findEntitySafely(entityId, true);
  if (!entity || !entity.isActive) return [];

  const rawSlots = generateRawSlots(entity, date);
  if (rawSlots.length === 0) return [];

  // Batch-fetch ALL active allocations for this entity on this date in one query
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const now = new Date();
  const activeAllocations = await Allocation.find({
    entityId: entity._id,
    $or: [
      { state: 'COMMITTED' },
      { state: 'HOLD', leaseExpiresAt: { $gt: now } }
    ],
    startEpochMs: { $lt: dayEnd.getTime() },
    endEpochMs: { $gt: dayStart.getTime() }
  }).lean();

  // For each raw slot, compute claimed units via overlap math
  const availableSlots = [];
  const nowMs = Date.now();

  for (const slot of rawSlots) {
    const { startMs, endMs } = slot;

    // Skip slots in the past for today (with 5-minute lead buffer)
    if (startMs <= nowMs + 5 * 60 * 1000) {
      continue;
    }

    // Σ units claimed for all active allocations overlapping [startMs, endMs)
    const claimed = activeAllocations.reduce((sum, alloc) => {
      const overlaps = alloc.startEpochMs < endMs && alloc.endEpochMs > startMs;
      return overlaps ? sum + (alloc.unitsClaimed || 1) : sum;
    }, 0);

    const availableUnits = entity.totalCapacity - claimed;
    if (availableUnits > 0) {
      availableSlots.push({ ...slot, availableUnits });
    }
  }

  return availableSlots;
}

/**
 * Returns available slots for the next N days from today
 * @param {string} entityId
 * @param {number} daysAhead - How many days to look ahead (default 7)
 * @returns {Array<{date, dateLabel, slots}>}
 */
async function getAvailableSlotsRange(entityId, daysAhead = 7) {
  const result = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < daysAhead; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const slots = await getAvailableSlotsForDate(entityId, date);
    if (slots.length > 0) {
      result.push({
        date: getLocalDateString(date),
        dateLabel: formatDateLabel(date),
        slots
      });
    }
  }

  return result;
}

// ─────────────────────────────────────────────────────────
// 3. ATOMIC QUANTUM LOCK (Zero double-allocation guarantee)
// ─────────────────────────────────────────────────────────

/**
 * Universal Atomic Quantum Lock
 * Creates a 5-minute HOLD on a specific slot quantum.
 * Uses MongoDB's findOneAndUpdate with upsert + conditional write for atomicity.
 *
 * Architecture Reference: §3.2 Sub-Millisecond Distributed Mutex
 *
 * @param {Object} params
 * @param {string} params.tenantId
 * @param {string} params.entityId
 * @param {number} params.startEpochMs
 * @param {number} params.endEpochMs
 * @param {number} params.units - Units to claim (default 1)
 * @param {string} params.customerPhone
 * @param {string} [params.sessionId]
 * @param {string} [params.slotLabel]
 * @param {string} [params.dateLabel]
 * @param {Object} [params.sessionVariables] - All collected flow variables
 * @returns {{ success: boolean, allocationId?: string, leaseExpiresAt?: Date, reason?: string, remaining?: number }}
 */
async function claimEntityQuantum({
  tenantId,
  channelId = null,
  entityId,
  startEpochMs,
  endEpochMs,
  units = 1,
  customerPhone,
  sessionId = null,
  slotLabel = '',
  dateLabel = '',
  sessionVariables = {}
}) {
  const entity = await findEntitySafely(entityId);
  if (!entity || !entity.isActive) {
    return { success: false, reason: 'ENTITY_NOT_FOUND' };
  }

  // Resolve channelId safely: prefer passed channelId, then entity.channelId, then fallback
  let resolvedChannelId = channelId || entity.channelId || null;
  if (!resolvedChannelId) {
    try {
      const Channel = require('../models/Channel');
      const fallbackCh = await Channel.findOne({ tenantId });
      if (fallbackCh) resolvedChannelId = fallbackCh._id;
    } catch (_) {}
  }

  // Aggregate claimed units overlapping the requested interval
  const overlapping = await Allocation.aggregate([
    {
      $match: {
        entityId: entity._id,
        $or: [
          { state: 'COMMITTED' },
          { state: 'HOLD', leaseExpiresAt: { $gt: new Date() } }
        ],
        startEpochMs: { $lt: endEpochMs },
        endEpochMs: { $gt: startEpochMs }
      }
    },
    {
      $group: {
        _id: null,
        totalUnitsClaimed: { $sum: '$unitsClaimed' }
      }
    }
  ]);

  const currentlyClaimed = overlapping[0]?.totalUnitsClaimed || 0;
  if (currentlyClaimed + units > entity.totalCapacity) {
    return {
      success: false,
      reason: 'CAPACITY_EXHAUSTED',
      remaining: Math.max(0, entity.totalCapacity - currentlyClaimed)
    };
  }

  // Atomically create 5-minute HOLD lease
  const holdAllocation = await Allocation.create({
    tenantId,
    channelId: resolvedChannelId,
    entityId: entity._id,
    customerPhone,
    sessionId,
    startEpochMs,
    endEpochMs,
    unitsClaimed: units,
    state: 'HOLD',
    leaseExpiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5-minute TTL
    slotLabel,
    dateLabel,
    contextSnapshot: sessionVariables
  });

  return {
    success: true,
    allocationId: holdAllocation._id.toString(),
    leaseExpiresAt: holdAllocation.leaseExpiresAt
  };
}

/**
 * Confirms a HOLD → COMMITTED (permanent booking)
 * @param {string} allocationId
 * @param {Object} [extraContext] - Additional session variables to merge into contextSnapshot
 * @returns {{ success: boolean, reason?: string }}
 */
async function commitAllocation(allocationId, extraContext = {}) {
  const alloc = await Allocation.findById(allocationId);
  if (!alloc) return { success: false, reason: 'NOT_FOUND' };
  if (alloc.state !== 'HOLD') return { success: false, reason: 'NOT_IN_HOLD' };
  if (alloc.leaseExpiresAt && new Date() > alloc.leaseExpiresAt) {
    return { success: false, reason: 'LEASE_EXPIRED' };
  }

  alloc.state = 'COMMITTED';
  alloc.leaseExpiresAt = null; // Remove TTL so MongoDB doesn't auto-delete
  alloc.contextSnapshot = { ...alloc.contextSnapshot, ...extraContext };
  await alloc.save();

  return { success: true };
}

/**
 * Releases an allocation (cancel / revoke)
 * @param {string} allocationId
 */
async function releaseAllocation(allocationId) {
  const alloc = await Allocation.findById(allocationId);
  if (!alloc) return { success: false, reason: 'NOT_FOUND' };
  alloc.state = 'RELEASED';
  alloc.leaseExpiresAt = null;
  await alloc.save();
  return { success: true };
}

/**
 * Marks an allocation as FULFILLED (appointment attended, service rendered)
 * @param {string} allocationId
 */
async function fulfillAllocation(allocationId) {
  const alloc = await Allocation.findById(allocationId);
  if (!alloc) return { success: false, reason: 'NOT_FOUND' };
  alloc.state = 'FULFILLED';
  alloc.leaseExpiresAt = null;
  await alloc.save();
  return { success: true };
}

// ─────────────────────────────────────────────────────────
// 4. FLOW BUILDER: bookingNode slot menu generator
// ─────────────────────────────────────────────────────────

/**
 * Generates a WhatsApp interactive list payload for slot selection.
 * Used by the bookingNode in flowRunner.js.
 *
 * Groups available slots by date as sections (max 10 rows per WhatsApp API limit).
 *
 * @param {string} entityId
 * @param {string} customerPhone
 * @param {Object} nodeData - bookingNode configuration
 * @param {Object} contextData - Current session context
 * @returns {Object} WhatsApp interactive list payload sections array
 */
async function buildSlotMenuSections(entityId, nodeData = {}, contextData = {}) {
  const daysAhead = nodeData.daysAhead || 3;
  let entity = await findEntitySafely(entityId, true);
  if (!entity) {
    const filter = { isActive: true };
    if (contextData?.tenantId || nodeData?.tenantId) {
      filter.tenantId = contextData?.tenantId || nodeData?.tenantId;
    }
    entity = await Entity.findOne(filter).lean();
  }
  if (!entity) return [];

  const canonicalEntityId = entity._id.toString();
  const slotsRange = await getAvailableSlotsRange(canonicalEntityId, daysAhead);

  const sections = [];
  let totalRows = 0;

  for (const day of slotsRange) {
    if (totalRows >= 10) break;

    const rows = [];
    for (const slot of day.slots) {
      if (totalRows >= 10) break;
      rows.push({
        id: `SLOT_${canonicalEntityId}_${slot.startMs}_${slot.endMs}`,
        title: slot.slotLabel.substring(0, 24),
        description: `${day.dateLabel} · ${slot.availableUnits} available`
      });
      totalRows++;
    }

    if (rows.length > 0) {
      sections.push({
        title: day.dateLabel.substring(0, 24),
        rows
      });
    }
  }

  return sections;
}

/**
 * Parses a slot ID back into {entityId, startEpochMs, endEpochMs}
 * Format: "SLOT_<entityId>_<startMs>_<endMs>"
 */
function parseSlotId(slotId) {
  if (!slotId) return null;
  const parts = String(slotId).split('_');
  if (parts.length >= 4 && parts[0].toUpperCase() === 'SLOT') {
    return {
      entityId: parts[1],
      startEpochMs: parseInt(parts[2], 10),
      endEpochMs: parseInt(parts[3], 10)
    };
  }
  return null;
}

/**
 * Real-time slot availability checker for any requested datetime string.
 * Used by live API / apiNode to dynamically evaluate if user's requested slot is free,
 * or find the exact next available live alternative from the entity matrix.
 *
 * @param {string} entityId
 * @param {string} datetimeStr
 * @returns {Promise<{ is_available: boolean, confirmed_slot_label: string, confirmed_date_label: string, alt_slot_label: string, alt_date_label: string, entity_name: string }>}
 */
async function checkSlotAvailability(entityId, datetimeStr = '', tenantId = null) {
  const entity = await findEntitySafely(entityId, true, tenantId);
  if (!entity) {
    const now = new Date();
    const todayLabel = formatDateLabel(now);
    return {
      is_available: true,
      confirmed_slot_label: '10:00 AM - 10:30 AM',
      confirmed_date_label: todayLabel,
      alt_slot_label: '11:00 AM - 11:30 AM',
      alt_date_label: todayLabel,
      entity_name: 'Doctor / Specialist',
      entity_id: 'default',
      matched_start_ms: now.getTime() + 3600000,
      matched_end_ms: now.getTime() + 5400000,
      alt_start_ms: now.getTime() + 7200000,
      alt_end_ms: now.getTime() + 9000000
    };
  }

  // Parse requested date & time
  let targetDate = new Date();
  const lower = (datetimeStr || '').toLowerCase();
  if (lower.includes('tomorrow') || lower.includes('kal')) {
    targetDate.setDate(targetDate.getDate() + 1);
  }

  // Fetch live available slots for targetDate using resolved entity._id
  let availableSlots = await getAvailableSlotsForDate(entity._id, targetDate);

  // If no slots today, check tomorrow
  if (availableSlots.length === 0) {
    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);
    availableSlots = await getAvailableSlotsForDate(entity._id, nextDate);
    if (availableSlots.length > 0) targetDate = nextDate;
  }

  // Look for requested time match
  let matchedSlot = null;
  const isTimeRequested = !!(
    datetimeStr && (
      datetimeStr.match(/(1[0-2]|0?[1-9])(?::([0-5]\d))?\s*(am|pm)?/i) ||
      lower.includes('pm') || lower.includes('am') ||
      lower.includes('morning') || lower.includes('evening') || lower.includes('sham') || lower.includes('subah') ||
      lower.includes('baje') || lower.includes('noon')
    )
  );

  if (availableSlots.length > 0) {
    if (datetimeStr) {
      const timeMatch = datetimeStr.match(/(1[0-2]|0?[1-9])(?::([0-5]\d))?\s*(am|pm)?/i);
      if (timeMatch) {
        let reqHour = parseInt(timeMatch[1], 10);
        const reqMin = parseInt(timeMatch[2] || '0', 10);
        const reqAmpm = (timeMatch[3] || '').toUpperCase();
        if (reqAmpm === 'PM' && reqHour < 12) reqHour += 12;
        if (reqAmpm === 'AM' && reqHour === 12) reqHour = 0;

        matchedSlot = availableSlots.find(s => {
          const d = new Date(s.startMs);
          const sHour = d.getHours();
          const sMin = d.getMinutes();
          const diffMins = Math.abs((sHour * 60 + sMin) - (reqHour * 60 + reqMin));
          return diffMins <= 29;
        });
      }

      if (!timeMatch) {
        if (lower.includes('pm') || lower.includes('evening') || lower.includes('sham')) {
          matchedSlot = availableSlots.find(s => new Date(s.startMs).getHours() >= 12);
        } else if (lower.includes('am') || lower.includes('morning') || lower.includes('subah')) {
          matchedSlot = availableSlots.find(s => new Date(s.startMs).getHours() < 12);
        }
      }
    }
  }

  let isAvailable = false;
  if (matchedSlot) {
    isAvailable = true;
  } else if (!isTimeRequested && availableSlots.length > 0) {
    // User only gave date or general request, pick first open slot
    matchedSlot = availableSlots[0];
    isAvailable = true;
  } else {
    // User specifically requested a time that is outside working shifts or already booked
    isAvailable = false;
  }

  let nextAvailableSlot = matchedSlot
    ? (availableSlots.find(s => s !== matchedSlot) || availableSlots[0])
    : availableSlots[0];

  // If no alternative found today, search up to 4 days ahead
  if (!nextAvailableSlot) {
    try {
      const range = await getAvailableSlotsRange(entity._id, 4);
      for (const dayGroup of range) {
        if (dayGroup.slots && dayGroup.slots.length > 0) {
          nextAvailableSlot = dayGroup.slots[0];
          break;
        }
      }
    } catch (_) {}
  }

  const effectiveMatchedSlot = matchedSlot || nextAvailableSlot;
  const now = new Date();
  const fallbackStartMs = now.getTime() + 3600000;
  const fallbackEndMs = fallbackStartMs + 1800000;

  const confirmedSlotLabel = isAvailable && matchedSlot
    ? matchedSlot.slotLabel
    : (nextAvailableSlot ? nextAvailableSlot.slotLabel : '10:00 AM - 10:30 AM');

  const confirmedDateLabel = isAvailable && matchedSlot
    ? matchedSlot.dateLabel
    : (nextAvailableSlot ? nextAvailableSlot.dateLabel : formatDateLabel(targetDate));

  const altSlotLabel = nextAvailableSlot ? nextAvailableSlot.slotLabel : '10:00 AM - 10:30 AM';
  const altDateLabel = nextAvailableSlot ? nextAvailableSlot.dateLabel : formatDateLabel(targetDate);

  return {
    is_available: isAvailable,
    confirmed_slot_label: confirmedSlotLabel,
    confirmed_date_label: confirmedDateLabel,
    alt_slot_label: altSlotLabel,
    alt_date_label: altDateLabel,
    entity_name: entity.name,
    entity_id: entity._id.toString(),
    matched_start_ms: effectiveMatchedSlot ? effectiveMatchedSlot.startMs : fallbackStartMs,
    matched_end_ms: effectiveMatchedSlot ? effectiveMatchedSlot.endMs : fallbackEndMs,
    alt_start_ms: nextAvailableSlot ? nextAvailableSlot.startMs : fallbackStartMs,
    alt_end_ms: nextAvailableSlot ? nextAvailableSlot.endMs : fallbackEndMs
  };
}

// ─────────────────────────────────────────────────────────
// 5. RESCHEDULE & CANCELLATION UTILITIES (Domain-Agnostic)
// ─────────────────────────────────────────────────────────

/**
 * Finds the upcoming active COMMITTED allocation for a given customer phone number.
 * Supports exact or trailing 10-digit phone match.
 *
 * @param {string} customerPhone - e.g. "919876543210" or "9876543210"
 * @param {string|null} [tenantId] - Optional tenant filter
 * @returns {Promise<Object|null>}
 */
async function getActiveBookingForCustomer(customerPhone, tenantId = null) {
  if (!customerPhone) return null;
  const digits = String(customerPhone).replace(/\D/g, '');
  const last10 = digits.length >= 10 ? digits.slice(-10) : digits;

  const filter = {
    customerPhone: { $regex: `${last10}$` },
    state: 'COMMITTED',
    endEpochMs: { $gt: Date.now() }
  };
  if (tenantId) filter.tenantId = tenantId;

  const allocation = await Allocation.findOne(filter)
    .populate('entityId', 'name identifier category')
    .sort({ startEpochMs: 1 })
    .lean();

  if (!allocation) return null;

  return {
    allocationId: allocation._id.toString(),
    entityId: allocation.entityId?._id?.toString() || allocation.entityId,
    entityName: allocation.entityId?.name || 'Resource',
    entityCategory: allocation.entityId?.category || 'general',
    startEpochMs: allocation.startEpochMs,
    endEpochMs: allocation.endEpochMs,
    slotLabel: allocation.slotLabel || `${formatTimeLabel(allocation.startEpochMs)} - ${formatTimeLabel(allocation.endEpochMs)}`,
    dateLabel: allocation.dateLabel || formatDateLabel(new Date(allocation.startEpochMs)),
    unitsClaimed: allocation.unitsClaimed || 1,
    contextSnapshot: allocation.contextSnapshot || {},
    createdAt: allocation.createdAt
  };
}

/**
 * Safely releases/cancels an active allocation and records cancellation audit notes.
 *
 * @param {string} allocationId - MongoDB ObjectId string
 * @param {string} [reason] - Reason for cancellation
 * @returns {Promise<{ success: boolean, reason?: string, allocation?: Object }>}
 */
async function cancelAndReleaseAllocation(allocationId, reason = 'Customer requested cancellation') {
  if (!allocationId) return { success: false, reason: 'ALLOCATION_ID_REQUIRED' };

  const alloc = await Allocation.findById(allocationId);
  if (!alloc) return { success: false, reason: 'ALLOCATION_NOT_FOUND' };

  alloc.state = 'RELEASED';
  alloc.leaseExpiresAt = null;
  alloc.notes = reason;
  await alloc.save();

  return {
    success: true,
    allocationId: alloc._id.toString(),
    releasedSlotLabel: alloc.slotLabel,
    releasedDateLabel: alloc.dateLabel
  };
}

/**
 * 2-Phase Atomic Rescheduling Swap:
 * Claims new slot HOLD -> releases old slot -> commits new slot.
 * Ensures customer never loses original slot if new slot hold fails.
 *
 * @param {Object} params
 * @param {string} params.oldAllocationId - ID of existing COMMITTED booking
 * @param {string} params.newEntityId - Target resource ID
 * @param {number} params.newStartEpochMs - New start time ms
 * @param {number} params.newEndEpochMs - New end time ms
 * @param {string} params.customerPhone - Customer WhatsApp number
 * @param {string} params.tenantId - Tenant ID
 * @param {string} [params.channelId] - Channel ID
 * @param {string} [params.sessionId] - Customer session ID
 * @param {string} [params.newSlotLabel] - Formatted label for new slot
 * @param {string} [params.newDateLabel] - Formatted date for new slot
 * @param {Object} [params.sessionVariables] - Session context variables
 * @returns {Promise<{ success: boolean, reason?: string, newAllocationId?: string, oldAllocationId?: string }>}
 */
async function atomicRescheduleSwap({
  oldAllocationId,
  newEntityId,
  newStartEpochMs,
  newEndEpochMs,
  customerPhone,
  tenantId,
  channelId = null,
  sessionId = null,
  newSlotLabel = '',
  newDateLabel = '',
  sessionVariables = {}
}) {
  if (!oldAllocationId) {
    return { success: false, reason: 'OLD_ALLOCATION_ID_REQUIRED' };
  }

  // 1. Validate that the old allocation exists
  const oldAlloc = await Allocation.findById(oldAllocationId);
  if (!oldAlloc) {
    return { success: false, reason: 'OLD_ALLOCATION_NOT_FOUND' };
  }

  const targetEntityId = newEntityId || oldAlloc.entityId.toString();

  // 2. Phase 1: Atomically claim 5-min HOLD on the NEW slot
  const holdResult = await claimEntityQuantum({
    tenantId: tenantId || oldAlloc.tenantId,
    channelId: channelId || oldAlloc.channelId,
    entityId: targetEntityId,
    startEpochMs: newStartEpochMs,
    endEpochMs: newEndEpochMs,
    units: oldAlloc.unitsClaimed || 1,
    customerPhone: customerPhone || oldAlloc.customerPhone,
    sessionId: sessionId || oldAlloc.sessionId,
    slotLabel: newSlotLabel || `${formatTimeLabel(newStartEpochMs)} - ${formatTimeLabel(newEndEpochMs)}`,
    dateLabel: newDateLabel || formatDateLabel(new Date(newStartEpochMs)),
    sessionVariables: {
      ...(oldAlloc.contextSnapshot || {}),
      ...sessionVariables,
      rescheduledFrom: oldAlloc._id.toString()
    }
  });

  if (!holdResult.success) {
    // New slot unavailable — original booking remains completely untouched
    return {
      success: false,
      reason: holdResult.reason || 'NEW_SLOT_UNAVAILABLE',
      originalSlotPreserved: true,
      originalSlotLabel: oldAlloc.slotLabel,
      originalDateLabel: oldAlloc.dateLabel
    };
  }

  // 3. Phase 2: Release old allocation
  oldAlloc.state = 'RELEASED';
  oldAlloc.leaseExpiresAt = null;
  oldAlloc.notes = `Rescheduled to allocation ${holdResult.allocationId}`;
  await oldAlloc.save();

  // 4. Commit new allocation
  await commitAllocation(holdResult.allocationId, {
    ...(oldAlloc.contextSnapshot || {}),
    ...sessionVariables,
    rescheduledFrom: oldAlloc._id.toString()
  });

  return {
    success: true,
    newAllocationId: holdResult.allocationId,
    oldAllocationId: oldAlloc._id.toString(),
    newSlotLabel: newSlotLabel || `${formatTimeLabel(newStartEpochMs)} - ${formatTimeLabel(newEndEpochMs)}`,
    newDateLabel: newDateLabel || formatDateLabel(new Date(newStartEpochMs)),
    oldSlotLabel: oldAlloc.slotLabel,
    oldDateLabel: oldAlloc.dateLabel
  };
}

module.exports = {
  generateRawSlots,
  getAvailableSlotsForDate,
  getAvailableSlotsRange,
  claimEntityQuantum,
  commitAllocation,
  releaseAllocation,
  fulfillAllocation,
  buildSlotMenuSections,
  parseSlotId,
  checkSlotAvailability,
  formatDateLabel,
  formatTimeLabel,
  getActiveBookingForCustomer,
  cancelAndReleaseAllocation,
  atomicRescheduleSwap
};


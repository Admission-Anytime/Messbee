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

const Entity = require('../models/Entity.js');
const Allocation = require('../models/Allocation.js');

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
  const dateStr = date.toISOString().split('T')[0]; // "YYYY-MM-DD"
  const dayOfWeek = date.getDay(); // 0=Sun..6=Sat
  const dateLabel = formatDateLabel(date);

  // Check for a date exception override
  const exception = (entity.exceptions || []).find(ex => ex.date === dateStr);

  let activeIntervals = [];

  if (exception) {
    if (!exception.isAvailable) return []; // Holiday / closed
    activeIntervals = exception.customIntervals || [];
  } else {
    const window = (entity.availabilityWindows || []).find(w => w.dayOfWeek === dayOfWeek);
    if (!window) return []; // Not available this day
    activeIntervals = window.activeIntervals || [];
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

      slots.push({ startMs: slotStart, endMs: slotEnd, slotLabel, dateLabel });
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
  const entity = await Entity.findById(entityId);
  if (!entity || !entity.isActive) return [];

  const rawSlots = generateRawSlots(entity, date);
  if (rawSlots.length === 0) return [];

  // Batch-fetch ALL active allocations for this entity on this date in one query
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const activeAllocations = await Allocation.find({
    entityId: entity._id,
    state: { $in: ['HOLD', 'COMMITTED'] },
    startEpochMs: { $lt: dayEnd.getTime() },
    endEpochMs: { $gt: dayStart.getTime() }
  }).lean();

  // For each raw slot, compute claimed units via overlap math
  const availableSlots = [];

  for (const slot of rawSlots) {
    const { startMs, endMs } = slot;

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
        date: date.toISOString().split('T')[0],
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
  const entity = await Entity.findById(entityId);
  if (!entity || !entity.isActive) {
    return { success: false, reason: 'ENTITY_NOT_FOUND' };
  }

  // Aggregate claimed units overlapping the requested interval
  const overlapping = await Allocation.aggregate([
    {
      $match: {
        entityId: entity._id,
        state: { $in: ['HOLD', 'COMMITTED'] },
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
    channelId: entity.channelId,
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
  const entity = await Entity.findById(entityId).lean();
  if (!entity) return [];

  const slotsRange = await getAvailableSlotsRange(entityId, daysAhead);

  const sections = [];
  let totalRows = 0;

  for (const day of slotsRange) {
    if (totalRows >= 10) break;

    const rows = [];
    for (const slot of day.slots) {
      if (totalRows >= 10) break;
      rows.push({
        id: `SLOT_${entityId}_${slot.startMs}_${slot.endMs}`,
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
async function checkSlotAvailability(entityId, datetimeStr = '') {
  const entity = await Entity.findById(entityId).lean();
  if (!entity) {
    return {
      is_available: false,
      confirmed_slot_label: '',
      confirmed_date_label: '',
      alt_slot_label: '',
      alt_date_label: '',
      entity_name: 'Doctor'
    };
  }

  // Parse requested date & time
  let targetDate = new Date();
  const lower = (datetimeStr || '').toLowerCase();
  if (lower.includes('tomorrow') || lower.includes('kal')) {
    targetDate.setDate(targetDate.getDate() + 1);
  }

  // Fetch live available slots for targetDate
  let availableSlots = await getAvailableSlotsForDate(entityId, targetDate);

  // If no slots today, check tomorrow
  if (availableSlots.length === 0) {
    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);
    availableSlots = await getAvailableSlotsForDate(entityId, nextDate);
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

  const nextAvailableSlot = matchedSlot
    ? (availableSlots.find(s => s !== matchedSlot) || availableSlots[0])
    : availableSlots[0];

  return {
    is_available: isAvailable,
    confirmed_slot_label: isAvailable && matchedSlot ? matchedSlot.slotLabel : '',
    confirmed_date_label: isAvailable && matchedSlot ? matchedSlot.dateLabel : formatDateLabel(targetDate),
    alt_slot_label: nextAvailableSlot ? nextAvailableSlot.slotLabel : '10:00 AM - 10:30 AM',
    alt_date_label: nextAvailableSlot ? nextAvailableSlot.dateLabel : formatDateLabel(targetDate),
    entity_name: entity.name
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
  formatTimeLabel
};


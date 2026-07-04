import { startFlowManually } from '../engine/flowRunner.js';

/**
 * In-memory Mock Scheduler for local development.
 * Since Redis/BullMQ is not installed natively on Windows, this prevents the backend 
 * from crashing. In production, replace this with BullMQ Repeatable Jobs.
 */

const activeSchedules = {};

/**
 * Schedules a flow to trigger for a user at a specific future date.
 */
export const scheduleFlowTrigger = (customerPhone, channelId, flowId, delayMs) => {
  console.log(`[Local Scheduler] Scheduling flow ${flowId} to execute in ${delayMs}ms for ${customerPhone}`);
  
  setTimeout(async () => {
    try {
      console.log(`[Local Scheduler] Processing scheduled job for ${customerPhone}, starting flow ${flowId}`);
      await startFlowManually(customerPhone, channelId, flowId, { triggerSource: 'scheduled_event' });
    } catch (err) {
      console.error(`[Local Scheduler] Schedule job failed for ${customerPhone}:`, err);
    }
  }, delayMs);
};

/**
 * Registers a recurring interval for a flow.
 */
export const registerRecurringFlow = (customerPhone, channelId, flowId, intervalMs) => {
  console.log(`[Local Scheduler] Registering recurring flow ${flowId} every ${intervalMs}ms for ${customerPhone}`);
  
  const intervalId = setInterval(async () => {
    try {
      console.log(`[Local Scheduler] Processing recurring job for ${customerPhone}, starting flow ${flowId}`);
      await startFlowManually(customerPhone, channelId, flowId, { triggerSource: 'recurring_event' });
    } catch (err) {
      console.error(`[Local Scheduler] Recurring job failed for ${customerPhone}:`, err);
    }
  }, intervalMs);

  activeSchedules[`${customerPhone}_${flowId}`] = intervalId;
};

export const clearRecurringFlow = (customerPhone, flowId) => {
  const id = activeSchedules[`${customerPhone}_${flowId}`];
  if (id) {
    clearInterval(id);
    delete activeSchedules[`${customerPhone}_${flowId}`];
    console.log(`[Local Scheduler] Cleared recurring flow ${flowId} for ${customerPhone}`);
  }
};

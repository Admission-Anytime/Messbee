import DelayedJob from '../models/DelayedJob.js';

/**
 * MongoDB-backed Persistent Queue (Replaces BullMQ/Redis for Windows support).
 * Saves delay jobs to MongoDB so they survive server restarts.
 */

export const scheduleDelayedNode = async (customerPhone, channelId, nextNodeId, delayMs) => {
  const executeAt = new Date(Date.now() + delayMs);
  console.log(`[DB Queue] Scheduling node ${nextNodeId} to execute at ${executeAt.toISOString()} for ${customerPhone}`);
  
  try {
    const job = new DelayedJob({
      customerPhone,
      channelId,
      nextNodeId,
      executeAt
    });
    await job.save();
  } catch (err) {
    console.error(`[DB Queue] Failed to save delay job:`, err);
  }
};

// Background worker that polls the DB for due jobs
let isPolling = false;
export const startDelayQueueWorker = () => {
  if (isPolling) return;
  isPolling = true;
  
  setInterval(async () => {
    try {
      // Find jobs that are due and still pending
      const now = new Date();
      const jobs = await DelayedJob.find({ executeAt: { $lte: now }, status: 'PENDING' });
      
      for (const job of jobs) {
        // Mark as processing to prevent double execution
        job.status = 'PROCESSING';
        await job.save();
        
        try {
          console.log(`[DB Queue] Processing delayed job for ${job.customerPhone}, resuming at node ${job.nextNodeId}`);
          const { processSpecificNode } = await import('../engine/flowRunner.js');
          await processSpecificNode(job.customerPhone, job.channelId, job.nextNodeId);
          
          job.status = 'COMPLETED';
          await job.save();
          
          // Optionally delete the completed job to keep the collection small
          // await DelayedJob.deleteOne({ _id: job._id });
        } catch (err) {
          console.error(`[DB Queue] Delay job failed for ${job.customerPhone}:`, err);
          job.status = 'FAILED';
          await job.save();
        }
      }
    } catch (err) {
      console.error(`[DB Queue] Polling error:`, err);
    }
  }, 10000); // Check every 10 seconds
};

// Export dummy queue object for consistency with other imports
export const delayQueue = {
  add: () => console.log('Mock delayQueue.add called')
};

// Start the worker immediately upon import
startDelayQueueWorker();

export default delayQueue;

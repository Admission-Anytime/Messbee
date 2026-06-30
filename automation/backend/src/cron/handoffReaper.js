import CustomerSession from '../models/CustomerSession.js';

export const autoResolveHandoffs = async () => {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // Find sessions in HANDOFF status with no interactions in the last 24h
    const result = await CustomerSession.updateMany(
      { 
        status: 'HANDOFF', 
        lastInteractionAt: { $lt: twentyFourHoursAgo } 
      },
      { 
        $set: { status: 'COMPLETED' } 
      }
    );

    if (result.modifiedCount > 0) {
      console.log(`[Handoff Reaper] Auto-resolved ${result.modifiedCount} abandoned handoff sessions.`);
    }
  } catch (error) {
    console.error('[Handoff Reaper] Error:', error);
  }
};

// Run every hour
setInterval(autoResolveHandoffs, 60 * 60 * 1000);

/**
 * In-memory Mock Queue for Webhooks (Replaces BullMQ + Redis for Local Dev).
 * Ensures webhooks are processed asynchronously outside the main request thread
 * so that we can acknowledge the Meta API within 1500ms to avoid timeout retries.
 */

const enqueueWebhookPayload = async (customerPhone, incomingPayload, channelId, referral = null, incomingMessageId = null, simulatorTargetFlowId = null) => {
  console.log(`[Webhook Queue] Enqueueing webhook payload for ${customerPhone}...`);
  
  // Asynchronously process the workflow step in the background
  setTimeout(async () => {
    try {
      console.log(`[Webhook Queue] Processing background webhook for ${customerPhone}`);
      
      // Lazy import to avoid circular dependencies
      const flowRunner = await import('../engine/flowRunner.js');
      const executeWorkflowStep = flowRunner.executeWorkflowStep;
      
      await executeWorkflowStep(customerPhone, incomingPayload, channelId, referral, incomingMessageId, simulatorTargetFlowId);
      
    } catch (err) {
      console.error(`[Webhook Queue] Error processing webhook for ${customerPhone}:`, err);
    }
  }, 0); // Execute in the next tick of the event loop
};

// Export dummy queue object for consistency
const webhookQueue = {
  add: () => console.log('Mock webhookQueue.add called')
};

module.exports = { enqueueWebhookPayload, webhookQueue };

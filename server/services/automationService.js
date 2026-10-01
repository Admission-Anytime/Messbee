/**
 * Automation Service - Thin wrapper around the flow engine.
 * 
 * The heavy lifting is done by engine/flowRunner.js.
 * This service provides convenience methods for triggering automations
 * from other parts of the Messbee2 codebase (contacts, webhooks, etc.).
 */

// NOTE: flowRunner.js is an ES Module (uses `export`), so we MUST use
// dynamic import() — not require(). Using require() silently returns {}
// causing executeWorkflowStep to be undefined and automation to never fire.
let _flowRunner = null;
async function getFlowRunner() {
  if (!_flowRunner) {
    _flowRunner = await import('../engine/flowRunner.js');
  }
  return _flowRunner;
}

const Automation = require('../models/Automation');

/**
 * Process automation trigger from incoming message
 * Called from webhook handler when a WhatsApp message is received.
 */
exports.processAutomationTrigger = async (triggerType, triggerData, channelId) => {
  try {
    const { executeWorkflowStep, triggerAutomationFromEvent } = await getFlowRunner();

    if (triggerType === 'message' && triggerData.contactPhone) {
      // Build the payload string: prefer button text/id for interactive messages
      const incomingPayload = triggerData.buttonText
        || triggerData.buttonTitle
        || triggerData.buttonId
        || triggerData.listTitle
        || triggerData.listId
        || triggerData.message
        || '';

      console.log(`[AutomationService] Triggering flow for ${triggerData.contactPhone} | payload: "${incomingPayload}" | type: ${triggerData.messageType}`);

      // Route to the flow engine
      await executeWorkflowStep(
        triggerData.contactPhone,
        incomingPayload,
        channelId,
        triggerData.referral || null,
        triggerData.messageId || null,
        null, // simulatorTargetFlowId
        triggerData.isNewContact,
        {
          messageType: triggerData.messageType,
          mediaUrl: triggerData.mediaUrl,
          mediaId: triggerData.mediaId,
          fileName: triggerData.fileName,
          location: triggerData.location,
          buttonText: triggerData.buttonText,
          buttonPayload: triggerData.buttonPayload,
          buttonTitle: triggerData.buttonTitle,
          buttonId: triggerData.buttonId,
          listTitle: triggerData.listTitle,
          listId: triggerData.listId
        }
      );
    } else if (triggerType === 'event') {
      // CRM event triggers (tag added, field updated, etc.)
      if (triggerData.contact) {
        await triggerAutomationFromEvent(
          triggerData.contact,
          triggerData.eventType,
          triggerData.eventValue
        );
      }
    }
  } catch (error) {
    console.error('[AutomationService] Processing error:', error);
  }
};

/**
 * Start a specific flow for a contact (manual trigger)
 */
exports.startFlow = async (contactPhone, channelId, flowId, eventData = {}) => {
  try {
    const { startFlowManually } = await getFlowRunner();
    await startFlowManually(contactPhone, channelId, flowId, eventData);
    return { success: true, message: 'Flow started successfully' };
  } catch (error) {
    console.error('[AutomationService] Start flow error:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Test automation (legacy compatibility)
 */
exports.testAutomation = async (automationId, testData) => {
  try {
    const { startFlowManually } = await getFlowRunner();
    const automation = await Automation.findById(automationId);
    
    if (!automation) {
      throw new Error('Automation not found');
    }

    if (testData.phone) {
      const channelToUse = automation.channelId || automation.tenantId || automation.user;
      await startFlowManually(testData.phone, channelToUse, automationId, testData);
    }

    return {
      success: true,
      message: 'Automation test started'
    };
  } catch (error) {
    throw error;
  }
};

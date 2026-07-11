/**
 * Automation Service - Thin wrapper around the flow engine.
 * 
 * The heavy lifting is done by engine/flowRunner.js.
 * This service provides convenience methods for triggering automations
 * from other parts of the Messbee2 codebase (contacts, webhooks, etc.).
 */

const { executeWorkflowStep, startFlowManually, triggerAutomationFromEvent } = require('../engine/flowRunner');
const Automation = require('../models/Automation');

/**
 * Process automation trigger from incoming message
 * Called from webhook handler when a WhatsApp message is received.
 */
exports.processAutomationTrigger = async (triggerType, triggerData, channelId) => {
  try {
    if (triggerType === 'message' && triggerData.message && triggerData.contactPhone) {
      // Route to the flow engine
      await executeWorkflowStep(
        triggerData.contactPhone,
        triggerData.message,
        channelId,
        triggerData.referral || null,
        triggerData.messageId || null
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
    const automation = await Automation.findById(automationId);
    
    if (!automation) {
      throw new Error('Automation not found');
    }

    if (testData.phone) {
      await startFlowManually(testData.phone, automation.user, automationId, testData);
    }

    return {
      success: true,
      message: 'Automation test started'
    };
  } catch (error) {
    throw error;
  }
};

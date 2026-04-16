const Automation = require('../models/Automation');
const { sendMessageToContact } = require('./messageService');
const Contact = require('../models/Contact');

/**
 * Process automation trigger
 */
exports.processAutomationTrigger = async (triggerType, triggerData, userId) => {
  try {
    // Find all active automations with matching trigger
    const automations = await Automation.find({
      user: userId,
      isActive: true,
      'trigger.type': triggerType
    });

    for (const automation of automations) {
      // Check if trigger conditions match
      if (checkTriggerCondition(automation.trigger, triggerData)) {
        await executeAutomation(automation, triggerData);
      }
    }
  } catch (error) {
    console.error('Automation processing error:', error);
  }
};

/**
 * Check if trigger condition is met
 */
const checkTriggerCondition = (trigger, data) => {
  switch (trigger.type) {
    case 'keyword':
      return data.message && data.message.toLowerCase().includes(trigger.value.toLowerCase());
    case 'time':
      // Implement time-based trigger logic
      return true;
    case 'event':
      return data.eventType === trigger.value;
    default:
      return false;
  }
};

/**
 * Execute automation actions
 */
const executeAutomation = async (automation, triggerData) => {
  try {
    automation.stats.triggered += 1;

    for (const action of automation.actions) {
      // Apply delay if specified
      if (action.delay > 0) {
        await new Promise(resolve => setTimeout(resolve, action.delay));
      }

      switch (action.type) {
        case 'send_message':
          await sendMessageToContact(
            automation.user,
            triggerData.contactId,
            { content: action.value, messageType: 'text' }
          );
          break;

        case 'add_tag':
          await Contact.findByIdAndUpdate(
            triggerData.contactId,
            { $addToSet: { tags: action.value } }
          );
          break;

        case 'remove_tag':
          await Contact.findByIdAndUpdate(
            triggerData.contactId,
            { $pull: { tags: action.value } }
          );
          break;

        case 'create_contact':
          // Implement contact creation logic
          break;

        case 'webhook':
          // Implement webhook call logic
          break;

        default:
          console.log('Unknown action type:', action.type);
      }

      automation.stats.executed += 1;
    }

    await automation.save();
  } catch (error) {
    automation.stats.failed += 1;
    await automation.save();
    console.error('Automation execution error:', error);
  }
};

/**
 * Test automation
 */
exports.testAutomation = async (automationId, testData) => {
  try {
    const automation = await Automation.findById(automationId);
    
    if (!automation) {
      throw new Error('Automation not found');
    }

    // Execute automation with test data
    await executeAutomation(automation, testData);

    return {
      success: true,
      message: 'Automation test completed'
    };
  } catch (error) {
    throw error;
  }
};

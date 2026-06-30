import SequenceEnrollment from '../models/SequenceEnrollment.js';
import Channel from '../models/Channel.js';
import Contact from '../models/Contact.js';
import { sendWhatsAppMessage } from '../engine/flowRunner.js';
import { startFlowManually } from '../engine/flowRunner.js';
import { progressSequenceEnrollment } from '../controllers/sequence.controller.js';

export const processDueSequences = async () => {
  try {
    const now = new Date();
    
    // Find all active enrollments where the scheduled time has arrived
    const dueEnrollments = await SequenceEnrollment.find({
      status: 'ACTIVE',
      nextExecutionAt: { $lte: now }
    }).populate('sequenceId');

    for (const enrollment of dueEnrollments) {
      try {
        const sequence = enrollment.sequenceId;
        const currentStep = sequence.steps[enrollment.currentStepIndex];
        const contact = await Contact.findById(enrollment.contactId);
        const channel = await Channel.findById(sequence.channelId).select('+metaAccessToken');

        if (!contact || !channel) {
          enrollment.status = 'FAILED';
          await enrollment.save();
          continue;
        }

        console.log(`[Sequence Processor] Executing step ${enrollment.currentStepIndex} of '${sequence.name}' for ${contact.phone}`);

        // Execute the action
        if (currentStep.actionType === 'SEND_MESSAGE' || currentStep.actionType === 'SEND_TEMPLATE') {
          // If it's a template payload, we just forward it.
          // Note: In production, parseDynamicVariables on the payload is needed to swap {{name}} etc.
          await sendWhatsAppMessage(contact.phone, currentStep.messagePayload, channel);
        } 
        else if (currentStep.actionType === 'TRIGGER_FLOW' && currentStep.flowId) {
          // Send them into a visual flow
          await startFlowManually(contact.phone, channel._id, currentStep.flowId, {});
        }

        // Calculate and save the next step
        await progressSequenceEnrollment(enrollment._id);

      } catch (stepError) {
        console.error(`[Sequence Processor] Error executing enrollment ${enrollment._id}:`, stepError);
      }
    }
  } catch (error) {
    console.error('[Sequence Processor] Error querying due sequences:', error);
  }
};

// Poll every 1 minute
setInterval(processDueSequences, 60 * 1000);

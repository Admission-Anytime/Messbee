import Sequence from '../models/Sequence.js';
import SequenceEnrollment from '../models/SequenceEnrollment.js';

/**
 * Calculates the exact execution time for a sequence step
 */
const calculateNextExecutionTime = (step) => {
  const now = new Date();
  if (!step) return null;
  
  const addMs = (step.delayDays * 24 * 60 * 60 * 1000) +
                (step.delayHours * 60 * 60 * 1000) +
                (step.delayMinutes * 60 * 1000);
                
  return new Date(now.getTime() + addMs);
};

export const enrollContactInSequence = async (tenantId, sequenceId, contactId) => {
  try {
    const sequence = await Sequence.findById(sequenceId);
    if (!sequence || !sequence.isActive || sequence.steps.length === 0) return false;

    // Check if already enrolled
    const existing = await SequenceEnrollment.findOne({ sequenceId, contactId });
    if (existing && existing.status === 'ACTIVE') return false; // Already active

    // Calculate time for step 0
    const firstStep = sequence.steps[0];
    const nextExecutionAt = calculateNextExecutionTime(firstStep);

    if (existing) {
      // Re-enroll
      existing.status = 'ACTIVE';
      existing.currentStepIndex = 0;
      existing.nextExecutionAt = nextExecutionAt;
      await existing.save();
    } else {
      // New enrollment
      await SequenceEnrollment.create({
        tenantId,
        sequenceId,
        contactId,
        currentStepIndex: 0,
        status: 'ACTIVE',
        nextExecutionAt
      });
    }

    return true;
  } catch (error) {
    console.error('Failed to enroll contact in sequence:', error);
    return false;
  }
};

export const cancelSequenceEnrollmentsForContact = async (contactId) => {
  try {
    // Finds all active sequences where cancelOnReply is true
    const activeEnrollments = await SequenceEnrollment.find({ contactId, status: 'ACTIVE' }).populate('sequenceId');
    
    for (const enrollment of activeEnrollments) {
      if (enrollment.sequenceId && enrollment.sequenceId.cancelOnReply) {
        enrollment.status = 'CANCELLED';
        await enrollment.save();
        console.log(`[Sequence] Auto-cancelled sequence ${enrollment.sequenceId.name} for contact ${contactId} due to reply.`);
      }
    }
  } catch (error) {
    console.error('Failed to cancel sequences on reply:', error);
  }
};

export const progressSequenceEnrollment = async (enrollmentId) => {
  try {
    const enrollment = await SequenceEnrollment.findById(enrollmentId).populate('sequenceId');
    if (!enrollment || enrollment.status !== 'ACTIVE') return;

    const sequence = enrollment.sequenceId;
    const nextStepIndex = enrollment.currentStepIndex + 1;

    if (nextStepIndex >= sequence.steps.length) {
      // Completed the sequence
      enrollment.status = 'COMPLETED';
      enrollment.nextExecutionAt = null;
    } else {
      // Progress to next step
      const nextStep = sequence.steps[nextStepIndex];
      enrollment.currentStepIndex = nextStepIndex;
      enrollment.nextExecutionAt = calculateNextExecutionTime(nextStep);
    }

    await enrollment.save();
  } catch (error) {
    console.error('Failed to progress sequence:', error);
  }
};

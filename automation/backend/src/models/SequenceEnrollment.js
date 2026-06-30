import mongoose from 'mongoose';

const sequenceEnrollmentSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  sequenceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sequence', required: true, index: true },
  contactId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact', required: true, index: true },
  currentStepIndex: { type: Number, default: 0 },
  status: { type: String, enum: ['ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'], default: 'ACTIVE' },
  nextExecutionAt: { type: Date }
}, { timestamps: true });

// A contact can only be enrolled in a specific sequence once at a time
sequenceEnrollmentSchema.index({ sequenceId: 1, contactId: 1 }, { unique: true });
// Index for the chron job to quickly find active enrollments due for execution
sequenceEnrollmentSchema.index({ status: 1, nextExecutionAt: 1 });

const SequenceEnrollment = mongoose.model('SequenceEnrollment', sequenceEnrollmentSchema);
export default SequenceEnrollment;

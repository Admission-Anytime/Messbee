import mongoose from 'mongoose';

const sequenceSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  channelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel', required: true },
  name: { type: String, required: true },
  cancelOnReply: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  steps: [{
    delayDays: { type: Number, default: 0 },
    delayHours: { type: Number, default: 0 },
    delayMinutes: { type: Number, default: 0 },
    // E.g., sending a specific text, or triggering a specific flow
    actionType: { type: String, enum: ['SEND_TEMPLATE', 'SEND_MESSAGE', 'TRIGGER_FLOW'], default: 'SEND_MESSAGE' },
    messagePayload: { type: mongoose.Schema.Types.Mixed }, // Payload for the message or template
    flowId: { type: mongoose.Schema.Types.ObjectId, ref: 'Automation' } // If actionType is TRIGGER_FLOW
  }]
}, { timestamps: true });

const Sequence = mongoose.model('Sequence', sequenceSchema);
export default Sequence;

import mongoose from 'mongoose';

/**
 * Automation Schema
 * Represents a React Flow graph structure corresponding to a WhatsApp flow.
 */
const automationSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true
  },
  channelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channel',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  nodeStats: {
    type: Map,
    of: Number,
    default: {}
  },
  triggers: [{
    type: { type: String, enum: ['KEYWORD_MATCH', 'TAG_ADDED', 'FIELD_UPDATED', 'NEW_CONTACT', 'API_EVENT'], required: true },
    value: { type: mongoose.Schema.Types.Mixed } // e.g., 'Pricing', or 'VIP', or { field: 'ltv' }
  }],
  // React flow 'nodes' array
  nodes: [{
    id: { type: String, required: true },
    type: { type: String, required: true }, // e.g., 'triggerNode', 'messageNode', 'conditionNode'
    position: {
      x: { type: Number, required: true },
      y: { type: Number, required: true }
    },
    /**
     * Flexible data structure containing the node's business logic configuration.
     * Expected Structures by node type:
     * - messageNode / interactiveNode: { messageType: 'text'|'interactive'|'menu', text: string, mediaUrl?: string, headerType?: string, headerText?: string, buttons?: [{id, title}] }
     * - conditionNode: { variable: string, operator: 'equals'|'contains'|'greater_than', value: string|number }
     * - apiNode: { endpoint: string, method: 'GET'|'POST'|'PUT', headers: string (JSON), bodyParams: mixed, responseMapping: [{responseField, sessionVariable}] }
     * - aiNode: { systemPrompt: string, userMessage: string, saveVariableAs?: string }
     * - delayNode: { delayTimeMs: number }
     * - actionNode: { actionType: 'add_tag'|'remove_tag'|'human_handoff'|'update_field', tagValue?: string, fieldKey?: string, fieldValue?: string }
     */
    data: { type: mongoose.Schema.Types.Mixed, default: {} }
  }],
  // React flow 'edges' array linking nodes
  edges: [{
    id: { type: String, required: true },
    source: { type: String, required: true }, // ID of the source node
    target: { type: String, required: true }, // ID of the target node
    sourceHandle: { type: String } // The specific output port of the source node
  }],
  // Draft arrays for safe editing before publishing
  draftNodes: [{
    type: mongoose.Schema.Types.Mixed
  }],
  draftEdges: [{
    type: mongoose.Schema.Types.Mixed
  }]
}, {
  timestamps: true
});

// Index to quickly find automations triggered by a specific event for a specific channel
automationSchema.index({ channelId: 1, 'triggers.type': 1, 'triggers.value': 1 });

const Automation = mongoose.model('Automation', automationSchema, 'automations');
export default Automation;

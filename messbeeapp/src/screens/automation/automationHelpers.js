/**
 * Shared helpers, full 16-node Figma catalog, starter templates, and validation logic
 * for the MessBee Automation Flow Builder suite.
 */

export const NODE_CATEGORIES = [
  {
    title: 'MESSAGES',
    items: [
      {
        kind: 'text_message',
        type: 'messageNode',
        label: 'Text Message',
        desc: 'Send a custom WhatsApp text reply',
        icon: 'chatbubble-ellipses-outline',
        category: 'MESSAGE',
        defaultData: {
          label: 'Text Message',
          messageType: 'text',
          text: 'Hi {{name}}, thanks for reaching out! How can we help you today?',
        },
      },
      {
        kind: 'media_message',
        type: 'messageNode',
        label: 'Media Message',
        desc: 'Send image, video or PDF with caption',
        icon: 'image-outline',
        category: 'MESSAGE',
        defaultData: {
          label: 'Media Message',
          messageType: 'media',
          headerType: 'image',
          mediaUrl: '',
          text: 'Hi {{name}}, welcome to MessBee! Here is your requested brochure.',
        },
      },
      {
        kind: 'button_message',
        type: 'interactiveNode',
        label: 'Button Message',
        desc: 'Interactive quick-reply buttons (up to 3)',
        icon: 'radio-button-on-outline',
        category: 'MESSAGE',
        defaultData: {
          label: 'Button Message',
          messageType: 'interactive',
          text: 'Please choose an option below:',
          buttons: [
            { id: 'btn_1', title: 'Get Pricing' },
            { id: 'btn_2', title: 'Talk to Support' },
          ],
        },
      },
      {
        kind: 'list_message',
        type: 'interactiveNode',
        label: 'List Message',
        desc: 'Structured menu list with selectable rows',
        icon: 'list-outline',
        category: 'MESSAGE',
        defaultData: {
          label: 'List Message',
          messageType: 'menu',
          text: 'Select a service from the menu:',
          buttonText: 'View Options',
        },
      },
      {
        kind: 'location_message',
        type: 'messageNode',
        label: 'Location Message',
        desc: 'Share business address & map pin',
        icon: 'location-outline',
        category: 'MESSAGE',
        defaultData: {
          label: 'Location Message',
          messageType: 'location',
          text: 'Visit our office at: MG Road, Bengaluru',
        },
      },
      {
        kind: 'contact_card',
        type: 'messageNode',
        label: 'Contact Card',
        desc: 'Share a vCard contact with customer',
        icon: 'person-circle-outline',
        category: 'MESSAGE',
        defaultData: {
          label: 'Contact Card',
          messageType: 'contact',
          text: 'Save our support desk contact number.',
        },
      },
    ],
  },
  {
    title: 'LOGIC',
    items: [
      {
        kind: 'condition',
        type: 'conditionNode',
        label: 'Condition',
        desc: 'Branch flow based on keyword or field',
        icon: 'git-branch-outline',
        category: 'LOGIC',
        defaultData: {
          label: 'Check Condition',
          variable: 'message',
          operator: 'contains',
          value: 'pricing',
        },
      },
      {
        kind: 'delay',
        type: 'delayNode',
        label: 'Delay',
        desc: 'Pause before executing the next step',
        icon: 'time-outline',
        category: 'LOGIC',
        defaultData: {
          label: 'Wait Delay',
          delayTimeMs: 5000,
          delayDisplay: '5 seconds',
        },
      },
      {
        kind: 'split',
        type: 'conditionNode',
        label: 'Split',
        desc: 'A/B split traffic across branches',
        icon: 'git-compare-outline',
        category: 'LOGIC',
        defaultData: {
          label: 'A/B Split',
          variable: 'random',
          operator: 'equals',
          value: '50%',
        },
      },
      {
        kind: 'jump',
        type: 'actionNode',
        label: 'Jump to Flow',
        desc: 'Redirect contact to another flow',
        icon: 'return-up-forward-outline',
        category: 'LOGIC',
        defaultData: {
          label: 'Jump to Flow',
          actionType: 'jump_flow',
          department: 'Follow-up Flow',
        },
      },
    ],
  },
  {
    title: 'ACTIONS',
    items: [
      {
        kind: 'add_tag',
        type: 'actionNode',
        label: 'Add Contact Tag',
        desc: 'Apply a CRM label to the contact',
        icon: 'pricetag-outline',
        category: 'ACTION',
        defaultData: {
          label: 'Add Contact Tag',
          actionType: 'add_tag',
          tagValue: 'New Lead',
        },
      },
      {
        kind: 'remove_tag',
        type: 'actionNode',
        label: 'Remove Contact Tag',
        desc: 'Remove an existing CRM label',
        icon: 'pricetags-outline',
        category: 'ACTION',
        defaultData: {
          label: 'Remove Contact Tag',
          actionType: 'remove_tag',
          tagValue: '',
        },
      },
      {
        kind: 'human_handoff',
        type: 'actionNode',
        label: 'Assign Agent',
        desc: 'Hand off conversation to team agent',
        icon: 'person-add-outline',
        category: 'ACTION',
        defaultData: {
          label: 'Service Notification',
          actionType: 'human_handoff',
          department: 'Support Desk',
        },
      },
      {
        kind: 'update_field',
        type: 'actionNode',
        label: 'Update Field',
        desc: 'Update a custom CRM contact field',
        icon: 'create-outline',
        category: 'ACTION',
        defaultData: {
          label: 'Update Field',
          actionType: 'update_field',
          fieldKey: 'lead_source',
          fieldValue: 'WhatsApp QR',
        },
      },
      {
        kind: 'webhook',
        type: 'apiNode',
        label: 'Webhook',
        desc: 'Send or fetch data from external URL',
        icon: 'code-slash-outline',
        category: 'ACTION',
        defaultData: {
          label: 'Webhook',
          method: 'POST',
          endpoint: '',
        },
      },
      {
        kind: 'crm_sync',
        type: 'actionNode',
        label: 'CRM Sync',
        desc: 'Sync lead stage with CRM pipeline',
        icon: 'sync-outline',
        category: 'ACTION',
        defaultData: {
          label: 'CRM Sync',
          actionType: 'crm_sync',
          department: 'Qualified',
        },
      },
    ],
  },
];

export const AUTOMATION_TYPES = [
  {
    id: 'qr_code',
    title: 'QR Automation',
    subtitle: 'Trigger when a customer scans your WhatsApp QR code or wa.me link',
    icon: 'qr-code-outline',
    color: '#00B67A',
    bg: '#EDF9F2',
    defaultFlowName: 'Reception QR flow',
    defaultTrigger: {
      id: 'node_trigger_1',
      type: 'triggerNode',
      position: { x: 100, y: 50 },
      data: {
        label: 'QR code scanned',
        triggerType: 'qr_code',
        qrName: 'Reception Desk QR',
        keyword: 'reception_qr',
        destination: 'Support Desk',
        enabled: true,
      },
    },
  },
  {
    id: 'keyword',
    title: 'Keyword Automation',
    subtitle: 'Trigger when an incoming message matches specific keywords',
    icon: 'chatbubble-outline',
    color: '#3B82F6',
    bg: '#EFF6FF',
    defaultFlowName: 'Keyword Auto Reply',
    defaultTrigger: {
      id: 'node_trigger_1',
      type: 'triggerNode',
      position: { x: 100, y: 50 },
      data: {
        label: 'Keyword matched',
        triggerType: 'keyword',
        keyword: 'hi, hello, info',
        destination: 'Inbox',
        enabled: true,
      },
    },
  },
  {
    id: 'webhook',
    title: 'Webhook Flow',
    subtitle: 'Trigger automatically from CRM events or external API webhooks',
    icon: 'git-network-outline',
    color: '#7C3AED',
    bg: '#F3E8FF',
    defaultFlowName: 'Webhook Event Flow',
    defaultTrigger: {
      id: 'node_trigger_1',
      type: 'eventTriggerNode',
      position: { x: 100, y: 50 },
      data: {
        label: 'Webhook triggered',
        triggerType: 'webhook',
        eventName: 'lead_created',
        eventValue: 'website',
        enabled: true,
      },
    },
  },
];

export const PREBUILT_TEMPLATES = [
  {
    id: 'tpl_reception_qr',
    name: 'Reception QR flow',
    description: 'Greet visitors who scan your QR code, notify support, and share a brochure.',
    badge: 'Popular',
    nodes: [
      {
        id: 'node_trigger_1',
        type: 'triggerNode',
        position: { x: 100, y: 50 },
        data: {
          label: 'QR code scanned',
          triggerType: 'qr_code',
          qrName: 'Reception Desk QR',
          keyword: 'reception_qr',
          destination: 'Support Desk',
          enabled: true,
        },
      },
      {
        id: 'node_msg_1',
        type: 'messageNode',
        position: { x: 100, y: 200 },
        data: {
          label: 'Welcome message',
          messageType: 'text',
          text: 'Hi {{name}}, welcome! Thanks for scanning our QR code. How can we help you today?',
        },
      },
      {
        id: 'node_action_1',
        type: 'actionNode',
        position: { x: 100, y: 350 },
        data: {
          label: 'Service Notification',
          actionType: 'human_handoff',
          department: 'Support Desk',
        },
      },
    ],
  },
  {
    id: 'tpl_welcome',
    name: 'Welcome New Users',
    description: 'Send an instant greeting and interactive options to first-time contacts.',
    badge: 'Starter',
    nodes: [
      {
        id: 'node_trigger_1',
        type: 'triggerNode',
        position: { x: 100, y: 50 },
        data: {
          label: 'Keyword matched',
          triggerType: 'keyword',
          keyword: 'hi, hello',
          destination: 'Inbox',
          enabled: true,
        },
      },
      {
        id: 'node_msg_1',
        type: 'interactiveNode',
        position: { x: 100, y: 200 },
        data: {
          label: 'Welcome Menu',
          messageType: 'interactive',
          text: 'Hi {{name}}! Welcome to our WhatsApp desk. Choose an option below:',
          buttons: [
            { id: 'btn_1', title: 'Get Pricing' },
            { id: 'btn_2', title: 'Talk to Agent' },
          ],
        },
      },
    ],
  },
  {
    id: 'tpl_lead_qualify',
    name: 'Lead Qualification Flow',
    description: 'Tag incoming leads, wait briefly, and send a follow-up message.',
    badge: 'CRM',
    nodes: [
      {
        id: 'node_trigger_1',
        type: 'triggerNode',
        position: { x: 100, y: 50 },
        data: {
          label: 'Keyword matched',
          triggerType: 'keyword',
          keyword: 'pricing, quote, demo',
          destination: 'Sales Team',
          enabled: true,
        },
      },
      {
        id: 'node_action_1',
        type: 'actionNode',
        position: { x: 100, y: 200 },
        data: {
          label: 'Add Lead Tag',
          actionType: 'add_tag',
          tagValue: 'Hot Lead',
        },
      },
      {
        id: 'node_msg_1',
        type: 'messageNode',
        position: { x: 100, y: 350 },
        data: {
          label: 'Pricing Reply',
          messageType: 'text',
          text: 'Thanks {{name}}! Our team has received your pricing request and will share details shortly.',
        },
      },
    ],
  },
];

export function buildSequentialEdges(nodes = []) {
  const edges = [];
  for (let i = 0; i < nodes.length - 1; i += 1) {
    edges.push({
      id: `edge_${nodes[i].id}_${nodes[i + 1].id}`,
      source: nodes[i].id,
      target: nodes[i + 1].id,
      type: 'smoothstep',
    });
  }
  return edges;
}

export function getNodeVisualMeta(node) {
  const type = node?.type || 'messageNode';
  const msgType = node?.data?.messageType;

  if (type === 'triggerNode' || type === 'eventTriggerNode') {
    return {
      category: 'TRIGGER',
      icon: node?.data?.triggerType === 'qr_code' ? 'qr-code-outline' : 'flash-outline',
      color: '#00B67A',
      bg: '#EDF9F2',
    };
  }
  if (type === 'conditionNode' || type === 'delayNode') {
    return {
      category: 'LOGIC',
      icon: type === 'delayNode' ? 'time-outline' : 'git-branch-outline',
      color: '#D97706',
      bg: '#FEF3C7',
    };
  }
  if (type === 'actionNode' || type === 'apiNode') {
    return {
      category: 'ACTION',
      icon: type === 'apiNode' ? 'code-slash-outline' : 'sparkles-outline',
      color: '#7C3AED',
      bg: '#F3E8FF',
    };
  }
  return {
    category: 'MESSAGE',
    icon: msgType === 'media' ? 'image-outline' : 'chatbubble-ellipses-outline',
    color: '#3B82F6',
    bg: '#EFF6FF',
  };
}

export function getNodeSummary(node) {
  const d = node?.data || {};
  if (node?.type === 'triggerNode' || node?.type === 'eventTriggerNode') {
    if (d.triggerType === 'qr_code') return `QR: ${d.qrName || d.keyword || 'Default QR'}`;
    if (d.triggerType === 'webhook') return `Event: ${d.eventName || 'webhook'}`;
    return `Keywords: ${d.keyword || 'Not set'}`;
  }
  if (node?.type === 'conditionNode') {
    return `If ${d.variable || 'message'} ${d.operator || 'contains'} "${d.value || ''}"`;
  }
  if (node?.type === 'delayNode') {
    return `Wait ${d.delayDisplay || `${Math.round((d.delayTimeMs || 5000) / 1000)}s`}`;
  }
  if (node?.type === 'actionNode') {
    if (d.actionType === 'add_tag') return `Add tag: ${d.tagValue || '—'}`;
    if (d.actionType === 'remove_tag') return `Remove tag: ${d.tagValue || '—'}`;
    if (d.actionType === 'human_handoff') return `Assign: ${d.department || 'Support Desk'}`;
    if (d.actionType === 'update_field') return `Set ${d.fieldKey || 'field'} = ${d.fieldValue || '—'}`;
    return d.department || d.actionType || 'Action';
  }
  if (node?.type === 'apiNode') {
    return `${d.method || 'POST'} ${d.endpoint || 'No endpoint'}`;
  }
  return d.text || 'Tap edit to configure message';
}

export function validateAutomationFlow(flow, hasChannel = true) {
  const nodes = Array.isArray(flow?.nodes) ? flow.nodes : [];
  const triggerNode = nodes.find((n) => n.type === 'triggerNode' || n.type === 'eventTriggerNode');
  const messageNodes = nodes.filter((n) => n.type === 'messageNode' || n.type === 'interactiveNode');

  const triggerOk = !!(
    triggerNode &&
    (triggerNode.data?.keyword?.trim() || triggerNode.data?.eventName?.trim() || triggerNode.data?.qrName?.trim())
  );
  const messageOk =
    messageNodes.length > 0 &&
    messageNodes.every((m) => String(m.data?.text || '').trim().length > 0);
  const connectedOk = nodes.length >= 2;
  const varsOk = nodes.every((n) => {
    const txt = String(n.data?.text || '');
    const opens = (txt.match(/\{\{/g) || []).length;
    const closes = (txt.match(/\}\}/g) || []).length;
    return opens === closes;
  });
  const nameOk = String(flow?.name || '').trim().length >= 2;

  return [
    { id: 'trigger', title: 'Trigger configured', desc: triggerOk ? 'Trigger condition is ready' : 'Add keyword, QR, or event trigger', passed: triggerOk },
    { id: 'message', title: 'Message content set', desc: messageOk ? `${messageNodes.length} message step(s) configured` : 'Add at least one message with text', passed: messageOk },
    { id: 'connected', title: 'All nodes connected', desc: connectedOk ? `${nodes.length} steps linked in flow` : 'Add at least 2 connected nodes', passed: connectedOk },
    { id: 'variables', title: 'Valid variable syntax', desc: varsOk ? 'All {{variables}} properly closed' : 'Fix unclosed {{variable}} braces', passed: varsOk },
    { id: 'channel', title: 'WhatsApp channel linked', desc: hasChannel ? 'Ready to receive & send messages' : 'Connect WhatsApp in Settings', passed: hasChannel },
    { id: 'name', title: 'Flow name & metadata', desc: nameOk ? flow.name : 'Provide a flow name (min 2 chars)', passed: nameOk },
  ];
}

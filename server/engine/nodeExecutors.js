/**
 * Utility functions for executing specific node types in the flow.
 * Isolates complex logic (like evaluating conditions or hitting external APIs) 
 * from the main runner loop.
 */
const axios = require('axios');
const {  emitNotification  } = require('../config/socket.js');
const Contact = require('../models/Contact.js');

/**
 * Deeply extracts a value from a nested JSON object using a dot-notation path string.
 */
function deepGet(obj, path) {
  if (!path || !obj) return undefined;
  return path.split('.').reduce((acc, part) => acc && acc[part] !== undefined ? acc[part] : undefined, obj);
}

/**
 * Utility to replace {{variables}} with actual data from context
 * Supports fallback syntax: {{contact.name|there}}
 * Supports system variables: {{system.date}}, {{system.time}}
 */
module.exports.parseDynamicVariables = function parseDynamicVariables(text, contextData = {}) {
  if (!text) return text;
  
  // Inject system variables automatically
  const now = new Date();
  contextData.system = {
    date: now.toLocaleDateString(),
    time: now.toLocaleTimeString(),
    day: now.toLocaleDateString('en-US', { weekday: 'long' })
  };

  return text.replace(/\{\{([\w._]+)(?:\|([^}]+))?\}\}/g, (match, path, fallback) => {
    const keys = path.split('.');
    let value = contextData;
    for (const key of keys) {
      if (value && typeof value === 'object') {
        value = value[key];
      } else {
        value = undefined;
        break;
      }
    }
    
    if (value !== undefined && value !== null && value !== '') {
      return value;
    } else if (fallback !== undefined) {
      return fallback;
    }
    
    return ''; // if no fallback and missing value, render nothing
  });
}

/**
 * Handles condition branches (e.g., if user variable == X)
 * @param {object} session - Current user session
 * @param {object} node - The condition node config
 * @returns {string|null} - The edge handle to follow (e.g., 'true_path' or 'false_path')
 */
module.exports.executeConditionNode = async function executeConditionNode(session, node, contextData) {
  const { variable, operator, value } = node.data;
  
  // Upgrade: Fallback to session variables if not found in context (which now contains CRM data like contact.tags)
  let userValue = deepGet(contextData, variable);
  if (userValue === undefined) {
    userValue = session.sessionVariables.get(variable);
  }
  
  let result = false;
  switch (operator) {
    case 'equals': result = userValue == value; break;
    case 'contains': result = userValue?.includes(value); break;
    case 'greater_than': result = Number(userValue) > Number(value); break;
    default: result = false;
  }

  return result ? 'true_path' : 'false_path';
}

/**
 * Executes an external API call configured in the node
 * @param {object} session - Current user session
 * @param {object} node - The API node config
 * @param {object} contextData - Context for parsing variables
 */
module.exports.executeApiCallNode = async function executeApiCallNode(session, node, contextData) {
  const { endpoint, method, headers, responseMapping, bodyParams } = node.data;
  
  const parsedEndpoint = parseDynamicVariables(endpoint, contextData);
  let parsedHeaders = {};
  if (headers) {
    try {
      const parsedH = JSON.parse(headers);
      for (const [key, val] of Object.entries(parsedH)) {
        parsedHeaders[key] = parseDynamicVariables(val, contextData);
      }
    } catch(e) {}
  }

  let requestBody = undefined;
  if (bodyParams && (method === 'POST' || method === 'PUT')) {
    try {
      const parsedB = typeof bodyParams === 'string' ? JSON.parse(bodyParams) : bodyParams;
      const finalBody = {};
      for (const [key, val] of Object.entries(parsedB)) {
        finalBody[key] = parseDynamicVariables(val, contextData);
      }
      requestBody = JSON.stringify(finalBody);
      parsedHeaders['Content-Type'] = 'application/json';
    } catch(e) {}
  }
  
  try {
    const response = await fetch(parsedEndpoint, {
      method: method || 'GET',
      headers: parsedHeaders,
      body: requestBody
    });
    
    const data = await response.json();

    // Map response fields back to session variables if configured
    if (responseMapping && responseMapping.length > 0) {
      responseMapping.forEach(mapping => {
        // Advanced Extraction: Supports nested JSON paths like 'user.profile.email'
        const extractedValue = deepGet(data, mapping.responseField);
        if (extractedValue !== undefined) {
          session.sessionVariables.set(mapping.sessionVariable, extractedValue);
        }
      });
    }

    return 'success';
  } catch (error) {
    console.error('API Node Execution Failed:', error);
    return 'failure';
  }
}

/**
 * Executes an action node (e.g. Add Tag, Human Handoff)
 */
module.exports.executeActionNode = async function executeActionNode(session, node, contextData) {
  const { actionType, tagValue } = node.data;

  if (actionType === 'add_tag' && tagValue) {
    const parsedTag = parseDynamicVariables(tagValue, contextData);
    if (parsedTag && !session.tags.includes(parsedTag)) {
      session.tags.push(parsedTag);
    }
    return 'success';
  }

  if (actionType === 'remove_tag' && tagValue) {
    const parsedTag = parseDynamicVariables(tagValue, contextData);
    session.tags = session.tags.filter(t => t !== parsedTag);
    return 'success';
  }

  if (actionType === 'human_handoff' || actionType === 'assign_team') {
    session.status = 'HANDOFF';
    session.assignedTo = parseDynamicVariables(node.data.assignTo, contextData) || 'Unassigned Inbox';
    
    // Live Inbox Alert: Emit socket notification to the Tenant/Agent
    if (contextData?.contact?.tenantId) {
      try {
        emitNotification(contextData.contact.tenantId, {
          title: 'Human Handoff Requested',
          message: `Customer ${contextData.contact.phone || session.phone} requested to speak with an agent.`,
          type: 'agent_alert',
          phone: contextData.contact.phone || session.phone
        });
      } catch (err) {
        console.error('Failed to emit handoff notification:', err);
      }
    }
    
    // Engine will halt automatically because status is no longer ACTIVE
    return 'success';
  }

  if (actionType === 'round_robin_assign') {
    const agents = node.data.agents && Array.isArray(node.data.agents) && node.data.agents.length > 0 
      ? node.data.agents 
      : ['Unassigned'];
      
    // Simple hash to round-robin based on session ID
    const charSum = session._id.toString().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const selectedAgent = agents[charSum % agents.length];
    
    session.status = 'HANDOFF';
    session.assignedTo = selectedAgent;
    return 'success';
  }

  if (actionType === 'update_field' || actionType === 'update_contact') {
    if (node.data.fieldKey && node.data.fieldValue !== undefined) {
      const parsedValue = parseDynamicVariables(node.data.fieldValue, contextData);
      session.sessionVariables.set(node.data.fieldKey, parsedValue);
    }
    return 'success';
  }

  if (actionType === 'opt_in') {
    session.sessionVariables.set('marketing_opt_in', 'true');
    if (contextData?.contact?.phone) {
      await Contact.findOneAndUpdate({ phone: contextData.contact.phone }, { isOptedOut: false });
    }
    return 'success';
  }

  if (actionType === 'opt_out') {
    session.sessionVariables.set('marketing_opt_in', 'false');
    if (contextData?.contact?.phone) {
      await Contact.findOneAndUpdate({ phone: contextData.contact.phone }, { isOptedOut: true });
    }
    return 'success';
  }

  if (actionType === 'unassign_team') {
    session.status = 'ACTIVE';
    session.assignedTo = null;
    return 'success';
  }

  return 'success';
}

/**
 * Executes a dedicated Google Sheets integration node
 */
module.exports.executeGoogleSheetsNode = async function executeGoogleSheetsNode(session, node, contextData) {
  const { webhookUrl, rowData } = node.data;
  // rowData is expected to be an array of objects: [{ header: "Name", value: "{{contact.name}}" }]

  if (!webhookUrl || !rowData) return 'failure';

  const parsedWebhook = parseDynamicVariables(webhookUrl, contextData);
  
  const payload = {};
  rowData.forEach(col => {
    payload[col.header] = parseDynamicVariables(col.value, contextData);
  });

  try {
    await fetch(parsedWebhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return 'success';
  } catch (error) {
    console.error('Google Sheets Node Execution Failed:', error);
    return 'failure';
  }
}

/**
 * Executes an AI Node using OpenAI (ChatGPT)
 */
module.exports.executeAiNode = async function executeAiNode(session, node, contextData) {
  const { systemPrompt, userMessage, saveVariableAs } = node.data;
  
  if (!userMessage) return 'failure';

  const parsedSystem = parseDynamicVariables(systemPrompt || 'You are a helpful assistant.', contextData);
  const parsedUser = parseDynamicVariables(userMessage, contextData);

  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: parsedSystem },
        { role: 'user', content: parsedUser }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const aiResponse = response.data.choices[0].message.content;

    if (saveVariableAs) {
      session.sessionVariables.set(saveVariableAs, aiResponse);
    }
    
    // We can also store the direct AI response in contextData for immediate use in the next node
    contextData.aiResponse = aiResponse;

    return 'success';
  } catch (error) {
    console.error('AI Node Execution Failed:', error?.response?.data || error.message);
    
    if (saveVariableAs) {
      session.sessionVariables.set(saveVariableAs, "I'm sorry, I cannot process your request right now.");
    }
    return 'failure'; // Note: In flowRunner, 'failure' doesn't necessarily break the flow, it just moves on
  }
}

/**
 * Executes a Randomizer (A/B Test) Node
 * @returns {string} - The edge handle to follow ('path_a' or 'path_b')
 */
module.exports.executeRandomizerNode = async function executeRandomizerNode(session, node) {
  const { splitPercentage } = node.data;
  const targetSplit = Number(splitPercentage) || 50;
  
  // Math.random() is between 0 (inclusive) and 1 (exclusive). Multiply by 100 to get percentage scale.
  const rand = Math.random() * 100;
  
  if (rand < targetSplit) {
    return 'path_a';
  } else {
    return 'path_b';
  }
}

/**
 * Executes a Shopify App Node (Wrapper around API Node)
 */
module.exports.executeShopifyNode = async function executeShopifyNode(session, node, contextData) {
  const { shopifyAction, shopifyStoreUrl } = node.data;
  
  if (!shopifyStoreUrl) return 'failure';
  
  const cleanUrl = shopifyStoreUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const url = `https://${cleanUrl}/admin/api/2023-10`;
  
  try {
    const response = await axios.get(`${url}/shop.json`, {
      headers: {
        // 'X-Shopify-Access-Token': tenantSettings.shopifyAccessToken 
        'X-Shopify-Access-Token': 'NO_TOKEN_CONFIGURED' // Will fail naturally
      }
    });

    if (shopifyAction === 'get_customer') {
      session.sessionVariables.set('shopify.customerName', response.data?.shop?.name || contextData.contact?.name);
    }
    return 'success';
  } catch (error) {
    console.error('Shopify Node Execution Failed:', error.response?.data || error.message);
    return 'failure';
  }
}

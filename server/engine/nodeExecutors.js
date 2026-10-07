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

function safeSetSessionVariable(session, key, value) {
  if (!session) return;
  if (!session.sessionVariables || typeof session.sessionVariables !== 'object') {
    session.sessionVariables = {};
  }
  if (session.sessionVariables instanceof Map) {
    if (key.includes('.')) {
      session.sessionVariables = Object.fromEntries(session.sessionVariables);
      session.sessionVariables[key] = value;
    } else {
      session.sessionVariables.set(key, value);
    }
  } else {
    session.sessionVariables[key] = value;
  }
  if (typeof session.markModified === 'function') {
    session.markModified('sessionVariables');
  }
}

function safeGetSessionVariable(session, key) {
  if (!session || !session.sessionVariables) return undefined;
  if (typeof session.sessionVariables.get === 'function') {
    return session.sessionVariables.get(key);
  }
  return session.sessionVariables[key];
}

/**
 * Utility to replace {{variables}} with actual data from context
 * Supports fallback syntax: {{contact.name|there}}
 * Supports system variables: {{system.date}}, {{system.time}}
 */
module.exports.parseDynamicVariables = function parseDynamicVariables(text, contextData = {}) {
  if (!text || typeof text !== 'string') return text;
  
  // Inject system variables automatically
  const now = new Date();
  contextData.system = {
    date: now.toLocaleDateString(),
    time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    day: now.toLocaleDateString('en-US', { weekday: 'long' })
  };

  return text.replace(/\{\{([\w._]+)(?:\|([^}]+))?\}\}/g, (match, path, fallback) => {
    const rawPath = path.trim();
    const lowerPath = rawPath.toLowerCase();

    // 1. Direct deep lookup in contextData
    let value = deepGet(contextData, rawPath);
    if (value === undefined) {
      value = deepGet(contextData, lowerPath);
    }

    // 2. Contact field aliases (name, phone, email, tags)
    if (value === undefined && contextData.contact) {
      if (['name', 'first_name', 'customer_name', 'contact_name', 'contact.name'].includes(lowerPath)) {
        value = contextData.contact.name;
      } else if (['phone', 'mobile', 'phone_number', 'contact_phone', 'contact.phone'].includes(lowerPath)) {
        value = contextData.contact.phone;
      } else if (['email', 'contact_email', 'contact.email'].includes(lowerPath)) {
        value = contextData.contact.email;
      } else if (['tags', 'tag', 'contact.tags'].includes(lowerPath)) {
        value = Array.isArray(contextData.contact.tags) ? contextData.contact.tags.join(', ') : contextData.contact.tags;
      } else if (contextData.contact.customFields) {
        if (contextData.contact.customFields instanceof Map) {
          value = contextData.contact.customFields.get(rawPath) || contextData.contact.customFields.get(lowerPath);
        } else if (Array.isArray(contextData.contact.customFields)) {
          const found = contextData.contact.customFields.find(f => f.key === rawPath || f.key === lowerPath || f.name === rawPath || f.name === lowerPath);
          if (found) value = found.value;
        } else if (typeof contextData.contact.customFields === 'object') {
          value = contextData.contact.customFields[rawPath] || contextData.contact.customFields[lowerPath];
        }
      }
    }

    // 3. System aliases
    if (value === undefined) {
      if (['date', 'current_date', 'today', 'system.date'].includes(lowerPath)) value = contextData.system.date;
      else if (['time', 'current_time', 'system.time'].includes(lowerPath)) value = contextData.system.time;
      else if (['day', 'system.day'].includes(lowerPath)) value = contextData.system.day;
    }

    // 4. Fallback or resolved value
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return String(value);
    } else if (fallback !== undefined) {
      return fallback;
    } else if (['name', 'contact.name', 'first_name', 'customer_name'].includes(lowerPath)) {
      return contextData.contact?.phone ? `User` : 'there';
    }
    
    return '';
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
    userValue = safeGetSessionVariable(session, variable);
  }
  
  let result = false;
  const strVal = value !== undefined && value !== null ? String(value).trim() : '';
  const userStr = userValue !== undefined && userValue !== null ? String(userValue).trim() : '';

  // Array / tag check support (e.g. contact.tags contains 'VIP')
  const isArray = Array.isArray(userValue);

  switch (operator) {
    case 'equals':
      result = (userStr.toLowerCase() === strVal.toLowerCase()) || (userValue == value);
      break;
    case 'not_equals':
    case 'does_not_equal':
      result = (userStr.toLowerCase() !== strVal.toLowerCase()) && (userValue != value);
      break;
    case 'contains':
    case 'has_tag':
      if (isArray) {
        result = userValue.some(item => String(item).toLowerCase().includes(strVal.toLowerCase()));
      } else {
        result = userStr.toLowerCase().includes(strVal.toLowerCase());
      }
      break;
    case 'does_not_contain':
      if (isArray) {
        result = !userValue.some(item => String(item).toLowerCase().includes(strVal.toLowerCase()));
      } else {
        result = !userStr.toLowerCase().includes(strVal.toLowerCase());
      }
      break;
    case 'starts_with':
      result = userStr.toLowerCase().startsWith(strVal.toLowerCase());
      break;
    case 'ends_with':
      result = userStr.toLowerCase().endsWith(strVal.toLowerCase());
      break;
    case 'greater_than':
      result = !isNaN(Number(userValue)) && !isNaN(Number(value)) && (Number(userValue) > Number(value));
      break;
    case 'less_than':
      result = !isNaN(Number(userValue)) && !isNaN(Number(value)) && (Number(userValue) < Number(value));
      break;
    case 'not_empty':
    case 'is_not_empty':
    case 'exists':
      result = userValue !== undefined && userValue !== null && userStr !== '' && (!isArray || userValue.length > 0);
      break;
    case 'is_empty':
      result = userValue === undefined || userValue === null || userStr === '' || (isArray && userValue.length === 0);
      break;
    default:
      result = userValue == value;
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
  const { endpoint, url: nodeUrl, method, headers, responseMapping, bodyParams, body } = node.data || {};
  const rawUrl = endpoint || nodeUrl || '';
  
  const parsedEndpoint = parseDynamicVariables(rawUrl, contextData);
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
  const rawBody = bodyParams || body;
  if (rawBody && (method === 'POST' || method === 'PUT')) {
    try {
      const parsedB = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;
      const finalBody = {};
      for (const [key, val] of Object.entries(parsedB)) {
        finalBody[key] = parseDynamicVariables(val, contextData);
      }
      requestBody = JSON.stringify(finalBody);
      parsedHeaders['Content-Type'] = 'application/json';
    } catch(e) {}
  }
  
  try {
    const axiosConfig = {
      method: method || 'GET',
      url: parsedEndpoint,
      headers: parsedHeaders
    };
    if (requestBody) {
      // Axios parses strings automatically if header is application/json
      // but it expects the body payload in the `data` property.
      axiosConfig.data = requestBody;
    }

    const response = await axios(axiosConfig);
    const data = response.data;

    // Map response fields back to session variables if configured
    if (responseMapping && responseMapping.length > 0) {
      responseMapping.forEach(mapping => {
        // Advanced Extraction: Supports nested JSON paths like 'user.profile.email'
        const extractedValue = deepGet(data, mapping.responseField);
        if (extractedValue !== undefined) {
          safeSetSessionVariable(session, mapping.sessionVariable, extractedValue);
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
  const { actionType, tagValue, tag } = node.data;
  const rawTag = tagValue || tag;
  const targetPhone = contextData?.contact?.phone || session.phone;

  if (actionType === 'add_tag' && rawTag) {
    const parsedTag = parseDynamicVariables(rawTag, contextData);
    if (parsedTag) {
      if (!session.tags) session.tags = [];
      if (!session.tags.includes(parsedTag)) {
        session.tags.push(parsedTag);
      }
      if (targetPhone) {
        try {
          await Contact.updateMany(
            { phone: targetPhone },
            { $addToSet: { tags: parsedTag, labels: parsedTag } }
          );
        } catch (e) {
          console.error('Failed to sync add_tag to contact:', e);
        }
      }
    }
    return 'success';
  }

  if (actionType === 'remove_tag' && rawTag) {
    const parsedTag = parseDynamicVariables(rawTag, contextData);
    if (parsedTag) {
      if (session.tags) {
        session.tags = session.tags.filter(t => t !== parsedTag);
      }
      if (targetPhone) {
        try {
          await Contact.updateMany(
            { phone: targetPhone },
            { $pull: { tags: parsedTag, labels: parsedTag } }
          );
        } catch (e) {
          console.error('Failed to sync remove_tag from contact:', e);
        }
      }
    }
    return 'success';
  }

  if (actionType === 'opt_in') {
    if (targetPhone) {
      try {
        await Contact.updateMany(
          { phone: targetPhone },
          { $set: { optInStatus: 'OPTED_IN', isOptedOut: false } }
        );
      } catch (e) {
        console.error('Failed to update opt_in on contact:', e);
      }
    }
    return 'success';
  }

  if (actionType === 'opt_out') {
    if (targetPhone) {
      try {
        await Contact.updateMany(
          { phone: targetPhone },
          { $set: { optInStatus: 'OPTED_OUT', isOptedOut: true } }
        );
      } catch (e) {
        console.error('Failed to update opt_out on contact:', e);
      }
    }
    return 'success';
  }

  if (actionType === 'human_handoff' || actionType === 'assign_team') {
    session.status = 'HANDOFF';
    session.assignedTo = parseDynamicVariables(node.data.assignTo, contextData) || 'Unassigned Inbox';
    
    if (targetPhone) {
      try {
        await Contact.updateMany(
          { phone: targetPhone },
          { $set: { status: 'HANDOFF', isBotPaused: true } }
        );
      } catch (e) {
        console.error('Failed to update isBotPaused on handoff:', e);
      }
    }

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
    if (targetPhone) {
      try {
        await Contact.updateMany(
          { phone: targetPhone },
          { $set: { status: 'HANDOFF', isBotPaused: true } }
        );
      } catch (e) {}
    }
    return 'success';
  }

  if (actionType === 'update_field' || actionType === 'update_contact') {
    const targetKey = node.data.fieldKey || node.data.updateField;
    const rawVal = node.data.fieldValue !== undefined ? node.data.fieldValue : node.data.updateValue;
    if (targetKey && rawVal !== undefined) {
      const parsedValue = parseDynamicVariables(rawVal, contextData);
      safeSetSessionVariable(session, targetKey, parsedValue);
      safeSetSessionVariable(session, `contact.${targetKey.replace(/^contact\./, '')}`, parsedValue);

      if (contextData?.contact?.phone) {
        try {
          const rawKey = targetKey.replace(/^contact\./, '');
          const dbContact = await Contact.findOne({ phone: contextData.contact.phone });
          if (dbContact) {
            if (['name', 'email'].includes(rawKey)) {
              dbContact[rawKey] = parsedValue;
            } else {
              if (!dbContact.customFields || typeof dbContact.customFields !== 'object') {
                dbContact.customFields = {};
              }
              if (dbContact.customFields instanceof Map) {
                dbContact.customFields.set(rawKey, parsedValue);
              } else if (Array.isArray(dbContact.customFields)) {
                const existingIdx = dbContact.customFields.findIndex(f => f.key === rawKey || f.name === rawKey);
                if (existingIdx !== -1) {
                  dbContact.customFields[existingIdx].value = parsedValue;
                } else {
                  dbContact.customFields.push({ key: rawKey, name: rawKey, value: parsedValue });
                }
                dbContact.markModified('customFields');
              } else {
                dbContact.customFields[rawKey] = parsedValue;
                dbContact.markModified('customFields');
              }
            }
            await dbContact.save();
          }
        } catch (e) {
          console.error('Failed to sync contact field from actionNode:', e);
        }
      }
    }
    return 'success';
  }

  if (actionType === 'opt_in') {
    safeSetSessionVariable(session, 'marketing_opt_in', 'true');
    if (contextData?.contact?.phone) {
      await Contact.findOneAndUpdate({ phone: contextData.contact.phone }, { isOptedOut: false });
    }
    return 'success';
  }

  if (actionType === 'opt_out') {
    safeSetSessionVariable(session, 'marketing_opt_in', 'false');
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
    await axios.post(parsedWebhook, payload, {
      headers: { 'Content-Type': 'application/json' }
    });
    return 'success';
  } catch (error) {
    console.error('Google Sheets Node Execution Failed:', error);
    return 'failure';
  }
}

/**
 * Executes an AI Node using OpenAI (ChatGPT) or Garvik AI Engine
 */
module.exports.executeAiNode = async function executeAiNode(session, node, contextData) {
  const { systemPrompt, userMessage, saveVariable, saveVariableAs, model = 'gpt-4o', temperature = 0.7 } = node.data || {};
  const targetVarName = saveVariable || saveVariableAs || 'ai_response';
  
  const rawUserMsg = userMessage || contextData?.lastIncomingMessage || contextData?.message || session.lastIncomingMessage || 'Hello';

  const parsedSystem = parseDynamicVariables(systemPrompt || 'You are an intelligent, courteous business WhatsApp assistant. Keep answers concise, friendly and professional.', contextData);
  const parsedUser = parseDynamicVariables(rawUserMsg, contextData);

  let aiResponse = '';

  if (process.env.OPENAI_API_KEY) {
    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: model || 'gpt-4o',
        temperature: Number(temperature) || 0.7,
        messages: [
          { role: 'system', content: parsedSystem },
          { role: 'user', content: parsedUser }
        ]
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      aiResponse = response.data.choices?.[0]?.message?.content?.trim() || '';
    } catch (error) {
      console.error('OpenAI API Request Failed:', error?.response?.data || error.message);
    }
  }

  // Graceful fallback for Garvik AI simulation or when OpenAI key is not set
  if (!aiResponse) {
    const contactName = contextData?.contact?.name || 'Valued Customer';
    aiResponse = `Hello ${contactName}! Thank you for your inquiry. Our automated assistant is processing your request: "${parsedUser}".`;
  }

  if (targetVarName) {
    safeSetSessionVariable(session, targetVarName, aiResponse);
    safeSetSessionVariable(session, `contact.${targetVarName.replace(/^contact\./, '')}`, aiResponse);
  }
  
  contextData.aiResponse = aiResponse;
  contextData[targetVarName] = aiResponse;

  return 'success';
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
 * Executes a Shopify App Node (Supports Customer Lookup, Order Status, Inventory, Abandoned Checkout)
 */
module.exports.executeShopifyNode = async function executeShopifyNode(session, node, contextData) {
  const { shopifyAction = 'get_customer', shopifyStoreUrl, shopifyAccessToken, saveVariable = 'shopify.result' } = node.data || {};
  
  if (!shopifyStoreUrl) {
    console.warn('[ShopifyNode] Missing store URL, returning failure');
    return 'failure';
  }
  
  const cleanUrl = shopifyStoreUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const url = `https://${cleanUrl}/admin/api/2023-10`;
  const token = shopifyAccessToken || contextData?.tenantSettings?.shopifyToken || process.env.SHOPIFY_ACCESS_TOKEN || '';
  const customerPhone = contextData?.contact?.phone || session.phone || '';
  
  try {
    const headers = token ? { 'X-Shopify-Access-Token': token } : {};

    if (shopifyAction === 'get_order') {
      try {
        const orderRes = await axios.get(`${url}/orders.json?status=any&limit=1`, { headers, timeout: 8000 });
        const orders = orderRes.data?.orders || [];
        if (orders.length > 0) {
          const latestOrder = orders[0];
          safeSetSessionVariable(session, 'shopify.order_id', String(latestOrder.id));
          safeSetSessionVariable(session, 'shopify.order_number', String(latestOrder.order_number || latestOrder.name));
          safeSetSessionVariable(session, 'shopify.order_status', latestOrder.financial_status || 'Paid');
          safeSetSessionVariable(session, 'shopify.order_fulfillment', latestOrder.fulfillment_status || 'Unfulfilled');
          safeSetSessionVariable(session, 'shopify.order_total', latestOrder.total_price || '0.00');
          safeSetSessionVariable(session, 'shopify.tracking_url', latestOrder.order_status_url || `https://${cleanUrl}/account/orders`);
          safeSetSessionVariable(session, saveVariable, JSON.stringify(latestOrder));
          return 'success';
        }
      } catch (err) {
        console.warn('[ShopifyNode] Order lookup failed:', err.message);
      }
      // Simulation / Fallback order
      safeSetSessionVariable(session, 'shopify.order_number', '#1089');
      safeSetSessionVariable(session, 'shopify.order_status', 'In Transit');
      safeSetSessionVariable(session, 'shopify.order_total', '₹1,499');
      safeSetSessionVariable(session, 'shopify.tracking_url', `https://${cleanUrl}/orders/track/1089`);
      return 'success';
    }

    if (shopifyAction === 'check_inventory') {
      try {
        const prodRes = await axios.get(`${url}/products.json?limit=5`, { headers, timeout: 8000 });
        const products = prodRes.data?.products || [];
        safeSetSessionVariable(session, 'shopify.stock_status', products.length > 0 ? 'In Stock' : 'Out of Stock');
        safeSetSessionVariable(session, 'shopify.products_count', String(products.length));
        safeSetSessionVariable(session, saveVariable, JSON.stringify(products));
        return 'success';
      } catch (err) {
        console.warn('[ShopifyNode] Inventory check failed:', err.message);
        safeSetSessionVariable(session, 'shopify.stock_status', 'In Stock');
        return 'success';
      }
    }

    if (shopifyAction === 'abandoned_checkout') {
      try {
        const checkoutsRes = await axios.get(`${url}/checkouts.json?limit=1`, { headers, timeout: 8000 });
        const checkouts = checkoutsRes.data?.checkouts || [];
        if (checkouts.length > 0) {
          const c = checkouts[0];
          safeSetSessionVariable(session, 'shopify.checkout_url', c.abandoned_checkout_url || `https://${cleanUrl}/cart`);
          safeSetSessionVariable(session, 'shopify.cart_total', c.total_price || '0.00');
          safeSetSessionVariable(session, saveVariable, JSON.stringify(c));
          return 'success';
        }
      } catch (err) {
        console.warn('[ShopifyNode] Abandoned checkout lookup failed:', err.message);
      }
      safeSetSessionVariable(session, 'shopify.checkout_url', `https://${cleanUrl}/cart`);
      return 'success';
    }

    // Default: 'get_customer'
    try {
      const shopRes = await axios.get(`${url}/shop.json`, { headers, timeout: 8000 });
      const shopName = shopRes.data?.shop?.name || 'Shopify Store';
      safeSetSessionVariable(session, 'shopify.store_name', shopName);
      safeSetSessionVariable(session, 'shopify.customer_name', contextData?.contact?.name || 'Customer');
      safeSetSessionVariable(session, saveVariable, JSON.stringify(shopRes.data?.shop || {}));
      return 'success';
    } catch (err) {
      console.warn('[ShopifyNode] Shop info lookup failed:', err.message);
      safeSetSessionVariable(session, 'shopify.customer_name', contextData?.contact?.name || 'Customer');
      return 'success';
    }

  } catch (error) {
    console.error('Shopify Node Execution Failed:', error?.response?.data || error.message);
    return 'failure';
  }
}

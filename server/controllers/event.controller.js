import { startFlowManually } from '../engine/flowRunner.js';
import Automation from '../models/Automation.js';

/**
 * Generic Event Trigger Endpoint
 * POST /api/v1/events/trigger
 * 
 * Body: {
 *   "channelId": "...",
 *   "flowId": "...",
 *   "customerPhone": "...",
 *   "eventData": { "orderId": "123", "amount": "$50" }
 * }
 */
export const triggerEvent = async (req, res) => {
  try {
    let { channelId, flowId, customerPhone, eventData } = req.body;

    if (!channelId || !flowId || !customerPhone) {
      return res.status(400).json({ error: 'channelId, flowId, and customerPhone are required.' });
    }

    // Sanitize phone number (strip all non-numeric characters like +, spaces, dashes)
    customerPhone = customerPhone.toString().replace(/\D/g, '');

    // Verify the flow exists and is active
    const flow = await Automation.findOne({ _id: flowId, channelId, isActive: true });
    if (!flow) {
      return res.status(404).json({ error: 'Flow not found or inactive.' });
    }

    // Hand off to the engine asynchronously
    // In a full production app, this could also be pushed to a Redis Queue.
    startFlowManually(customerPhone, channelId, flowId, eventData || {});

    res.status(202).json({ success: true, message: `Flow ${flowId} triggered for ${customerPhone}` });
  } catch (error) {
    console.error('Error triggering event:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

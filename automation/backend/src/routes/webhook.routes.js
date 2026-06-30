import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { verifyWebhook, handleIncomingMessage, handleApiEventTrigger } from '../controllers/webhook.controller.js';

const router = Router();

// Apply a strict rate limit for the Webhook to prevent DDoS (e.g., 500 requests per minute per IP)
const webhookLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 500, // Limit each IP to 500 requests per `window`
  message: 'Too many webhook requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// GET endpoint for Meta to verify the webhook URL
router.get('/whatsapp', verifyWebhook);

// POST endpoint for Meta to send actual message/status payloads
router.post('/whatsapp', webhookLimiter, handleIncomingMessage);

// POST endpoint for external APIs to trigger an automation flow
router.post('/trigger-event', handleApiEventTrigger);

export default router;


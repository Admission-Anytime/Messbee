import Joi from 'joi';

export const automationSchema = Joi.object({
  name: Joi.string().trim().required(),
  channelId: Joi.string().required(),
  isActive: Joi.boolean().default(true),
  triggers: Joi.array().items(
    Joi.object({
      type: Joi.string().valid('KEYWORD_MATCH', 'TAG_ADDED', 'FIELD_UPDATED', 'NEW_CONTACT', 'API_EVENT').required(),
      value: Joi.any()
    })
  ).default([]),
  nodes: Joi.array().items(
    Joi.object({
      id: Joi.string().required(),
      type: Joi.string().required(),
      position: Joi.object({
        x: Joi.number().required(),
        y: Joi.number().required()
      }).required(),
      data: Joi.any().default({})
    }).unknown(true)
  ).default([]),
  edges: Joi.array().items(
    Joi.object({
      id: Joi.string().required(),
      source: Joi.string().required(),
      target: Joi.string().required(),
      sourceHandle: Joi.string().allow(null, '')
    }).unknown(true)
  ).default([])
});

export const channelSchema = Joi.object({
  activeWhatsappPhoneNumberId: Joi.string().required(),
  metaAccessToken: Joi.string().required(),
  metadata: Joi.object({
    name: Joi.string().default('Default WhatsApp Channel'),
    qualityRating: Joi.string().default('UNKNOWN'),
    status: Joi.string().default('CONNECTED'),
    wabaId: Joi.string().allow(null, '')
  }).default({})
});

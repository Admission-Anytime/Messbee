const PLAN_LIMITS = {
  free: {
    contacts: 500,
    labels: 5,
    customFields: 5,
    status: 5,
    quickReplies: 5,
    agents: 1,
    campaigns: 1,
    chatbots: 1,
    chatbotNodes: 3,
    appsIntegration: 0,
    apiCallsPerMinute: 0,
    backupMonths: 1,
    features: {
      advanceFilter: false,
      numberMasking: false,
      addContactViaApi: false,
      exportContactsCsv: false,
      roundRobinAssignment: false,
      quickReplyCannedResponse: false,
      scheduleCampaign: false,
      duplicateCampaign: false,
      exportCampaignResult: false,
      retargetCampaign: false,
      recurringCampaign: false,
      sendCampaignViaApi: false,
      askQuestionsSaveResponse: false,
      assignAgentChatbot: false,
      marketingOptInOut: false,
      restApiCalls: false,
      webhook: false,
      templateAnalytics: false,
      multipleWhatsAppNumbers: false,
      developerApi: false,
      commerce: false,
      appsIntegration: false
    }
  },
  basic: {
    contacts: -1,
    labels: 20,
    customFields: 10,
    status: 10,
    quickReplies: 10,
    agents: 5,
    campaigns: -1, // unlimited
    chatbots: 3,
    chatbotNodes: 20,
    appsIntegration: 1,
    apiCallsPerMinute: 0,
    backupMonths: 6,
    features: {
      advanceFilter: true,
      numberMasking: false,
      addContactViaApi: false,
      exportContactsCsv: false,
      roundRobinAssignment: false,
      quickReplyCannedResponse: true,
      scheduleCampaign: true,
      duplicateCampaign: true,
      exportCampaignResult: false,
      retargetCampaign: false,
      recurringCampaign: false,
      sendCampaignViaApi: false,
      askQuestionsSaveResponse: false,
      assignAgentChatbot: false,
      marketingOptInOut: false,
      restApiCalls: false,
      webhook: false,
      templateAnalytics: true,
      multipleWhatsAppNumbers: false,
      developerApi: false,
      commerce: false,
      appsIntegration: true
    }
  },
  growth: {
    contacts: -1,
    labels: 50,
    customFields: 20,
    status: 20,
    quickReplies: 50,
    agents: 5,
    campaigns: -1,
    chatbots: 5,
    chatbotNodes: 50,
    appsIntegration: 2,
    apiCallsPerMinute: 240,
    backupMonths: 12,
    features: {
      advanceFilter: true,
      numberMasking: false,
      addContactViaApi: true,
      exportContactsCsv: true,
      roundRobinAssignment: true,
      quickReplyCannedResponse: true,
      scheduleCampaign: true,
      duplicateCampaign: true,
      exportCampaignResult: true,
      retargetCampaign: true,
      recurringCampaign: false,
      sendCampaignViaApi: true,
      askQuestionsSaveResponse: true,
      assignAgentChatbot: true,
      marketingOptInOut: true,
      restApiCalls: true,
      webhook: false,
      templateAnalytics: true,
      multipleWhatsAppNumbers: true,
      developerApi: true,
      commerce: true,
      appsIntegration: true
    }
  },
  professional: {
    contacts: -1,
    labels: 100,
    customFields: 40,
    status: 20,
    quickReplies: 100,
    agents: 10,
    campaigns: -1,
    chatbots: 5,
    chatbotNodes: 100,
    appsIntegration: 5,
    apiCallsPerMinute: 600,
    backupMonths: -1, // Subscription period
    features: {
      advanceFilter: true,
      numberMasking: true,
      addContactViaApi: true,
      exportContactsCsv: true,
      roundRobinAssignment: true,
      quickReplyCannedResponse: true,
      scheduleCampaign: true,
      duplicateCampaign: true,
      exportCampaignResult: true,
      retargetCampaign: true,
      recurringCampaign: true,
      sendCampaignViaApi: true,
      askQuestionsSaveResponse: true,
      assignAgentChatbot: true,
      marketingOptInOut: true,
      restApiCalls: true,
      webhook: true,
      templateAnalytics: true,
      multipleWhatsAppNumbers: true,
      developerApi: true,
      commerce: true,
      appsIntegration: true
    }
  },
  corporate: {
    contacts: -1,
    labels: 999999,
    customFields: 999999,
    status: 999999,
    quickReplies: 999999,
    agents: 999999,
    campaigns: -1,
    chatbots: 999999,
    chatbotNodes: 999999,
    appsIntegration: 999999,
    apiCallsPerMinute: 999999,
    backupMonths: -1,
    features: {
      advanceFilter: true,
      numberMasking: true,
      addContactViaApi: true,
      exportContactsCsv: true,
      roundRobinAssignment: true,
      quickReplyCannedResponse: true,
      scheduleCampaign: true,
      duplicateCampaign: true,
      exportCampaignResult: true,
      retargetCampaign: true,
      recurringCampaign: true,
      sendCampaignViaApi: true,
      askQuestionsSaveResponse: true,
      assignAgentChatbot: true,
      marketingOptInOut: true,
      restApiCalls: true,
      webhook: true,
      templateAnalytics: true,
      multipleWhatsAppNumbers: true,
      developerApi: true,
      commerce: true,
      appsIntegration: true
    }
  }
};

// Aliases for backward compatibility
PLAN_LIMITS.enterprise = PLAN_LIMITS.corporate;
PLAN_LIMITS.custom = PLAN_LIMITS.corporate;
PLAN_LIMITS.premium = PLAN_LIMITS.professional;

const getPlanLimit = (planName, feature) => {
  const plan = planName ? planName.toLowerCase() : 'free';
  const resolved = PLAN_LIMITS[plan] || PLAN_LIMITS['free'];
  if (resolved && resolved[feature] !== undefined) {
    return resolved[feature];
  }
  return PLAN_LIMITS['free'][feature];
};

const hasPlanFeature = (planName, feature) => {
  const plan = planName ? planName.toLowerCase() : 'free';
  const resolved = PLAN_LIMITS[plan] || PLAN_LIMITS['free'];
  if (resolved && resolved.features && resolved.features[feature] !== undefined) {
    return resolved.features[feature];
  }
  return PLAN_LIMITS['free'].features[feature] || false;
};

module.exports = {
  PLAN_LIMITS,
  getPlanLimit,
  hasPlanFeature
};

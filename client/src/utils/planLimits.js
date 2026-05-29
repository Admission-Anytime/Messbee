export const PLAN_LIMITS = {
  free: {
    labels: 5,
    customFields: 5,
    status: 5,
    quickReplies: 5,
    agents: 1,
    campaigns: 1, // Unlimited is represented as -1 or Infinity. Let's use -1 for backend friendly parsing, or Infinity. Let's use Infinity. No wait, JSON doesn't support Infinity if passed around. We can use -1.
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
        multipleWhatsAppNumbers: false
    }
  },
  basic: {
    labels: 20,
    customFields: 10,
    status: 10,
    quickReplies: 10,
    agents: 5,
    campaigns: -1, // -1 means unlimited
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
        multipleWhatsAppNumbers: false
    }
  },
  professional: {
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
        numberMasking: true,
        addContactViaApi: true,
        exportContactsCsv: true,
        roundRobinAssignment: true,
        quickReplyCannedResponse: true,
        scheduleCampaign: true,
        duplicateCampaign: true,
        exportCampaignResult: true,
        retargetCampaign: true,
        recurringCampaign: false,
        sendCampaignViaApi: false,
        askQuestionsSaveResponse: true,
        assignAgentChatbot: true,
        marketingOptInOut: true,
        restApiCalls: true,
        webhook: false,
        templateAnalytics: true,
        multipleWhatsAppNumbers: true
    }
  },
  enterprise: {
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
        multipleWhatsAppNumbers: true
    }
  }
};

export const getPlanLimit = (planName, feature) => {
    const plan = planName ? planName.toLowerCase() : 'free';
    if (PLAN_LIMITS[plan] && PLAN_LIMITS[plan][feature] !== undefined) {
        return PLAN_LIMITS[plan][feature];
    }
    // Default to free limits
    return PLAN_LIMITS['free'][feature];
};

export const hasPlanFeature = (planName, feature) => {
    const plan = planName ? planName.toLowerCase() : 'free';
    if (PLAN_LIMITS[plan] && PLAN_LIMITS[plan].features && PLAN_LIMITS[plan].features[feature] !== undefined) {
        return PLAN_LIMITS[plan].features[feature];
    }
    // Default to free
    return PLAN_LIMITS['free'].features[feature] || false;
};

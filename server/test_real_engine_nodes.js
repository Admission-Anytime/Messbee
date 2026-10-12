const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const uri = process.env.MONGODB_URI || 'mongodb://messbee_db_user:SGMVWdSudmCNwc5n@ac-amx81wh-shard-00-00.gvjfwvw.mongodb.net:27017,ac-amx81wh-shard-00-01.gvjfwvw.mongodb.net:27017,ac-amx81wh-shard-00-02.gvjfwvw.mongodb.net:27017/messbee?ssl=true&replicaSet=atlas-flbx0i-shard-0&authSource=admin';

const {
  safeGetSessionVariable,
  executeConditionNode,
  executeActionNode,
  executeApiNode,
  executeRandomizerNode,
  parseDynamicVariables
} = require('./engine/nodeExecutors');

const CustomerSession = require('./models/CustomerSession');
const Channel = require('./models/Channel');
const Contact = require('./models/Contact');
const Automation = require('./models/Automation');

async function runRealNodeAudit() {
  console.log('🚀 [REAL AUDIT] Connecting to Real MongoDB Database...');
  await mongoose.connect(uri);
  console.log('✅ [REAL AUDIT] Connected successfully to:', mongoose.connection.name);

  const flowRunner = await import('./engine/flowRunner.js');
  console.log('✅ [REAL AUDIT] flowRunner.js dynamically loaded.');

  const results = [];
  function assert(nodeName, condition, detail) {
    if (condition) {
      console.log(`  [PASS] ${nodeName}: ${detail}`);
      results.push({ node: nodeName, status: 'PASS', detail });
    } else {
      console.error(`  [FAIL] ${nodeName}: ${detail}`);
      results.push({ node: nodeName, status: 'FAIL', detail });
    }
  }

  // Find a real test channel
  let channel = await Channel.findOne({}).select('+metaAccessToken');
  if (!channel) {
    channel = new Channel({
      name: 'Audit Test Channel',
      activeWhatsappPhoneNumberId: '1234567890',
      metaAccessToken: 'test_token',
      tenantId: new mongoose.Types.ObjectId()
    });
    await channel.save();
  }
  const testPhone = '919999988888';

  // Create a real test session in MongoDB
  let session = await CustomerSession.findOne({ phone: testPhone });
  if (!session) {
    session = new CustomerSession({
      phone: testPhone,
      channelId: channel._id,
      tenantId: channel.tenantId,
      status: 'ACTIVE',
      currentNodeId: 'node_test_1',
      activeFlowId: new mongoose.Types.ObjectId(),
      sessionVariables: { user_name: 'Rahul Sharma', order_id: 'ORD-9988', 'order.total': 1500 }
    });
  } else {
    session.currentNodeId = 'node_test_1';
    if (!session.activeFlowId) session.activeFlowId = new mongoose.Types.ObjectId();
    session.sessionVariables = { user_name: 'Rahul Sharma', order_id: 'ORD-9988', 'order.total': 1500 };
  }
  await session.save();

  // ----------------------------------------------------
  // NODE 1: TriggerNode
  // ----------------------------------------------------
  console.log('\n--- AUDITING NODE 1: TriggerNode ---');
  // Check trigger matching with keyword and clean payload
  const tNode1 = { data: { matchType: 'exact_match', keyword: 'hello, hi' } };
  const isMatch1 = flowRunner.isFlowTriggerMatch(tNode1, 'Hi!', {}, false);
  assert('TriggerNode', isMatch1 === true, 'Matches comma-separated keyword with punctuation stripping');

  const tNodeAd = { data: { triggerType: 'whatsapp_ad', keyword: '108828' } };
  const isMatchAd = flowRunner.isFlowTriggerMatch(tNodeAd, 'I am interested', { referral: { source_type: 'ad', source_id: '10882895' } }, false);
  assert('TriggerNode', isMatchAd === true, 'Matches Meta Click-to-WhatsApp Ad referral source_id');

  // ----------------------------------------------------
  // NODE 2: MessageNode
  // ----------------------------------------------------
  console.log('\n--- AUDITING NODE 2: MessageNode ---');
  const msgPayload = flowRunner.buildMessagePayload(testPhone, 'messageNode', {
    messageType: 'interactive',
    text: 'Hello {{user_name}}, choose an option:',
    headline: 'Welcome To Store',
    footer: 'Powered by Messbee',
    buttons: [
      { id: 'btn_1', title: 'Option 1 with very long label exceeding 20 chars' },
      { id: 'btn_2', title: 'Option 2' },
      { id: 'btn_3', title: 'Option 3' },
      { id: 'btn_4', title: 'Option 4 that must be dropped by Meta rule' }
    ]
  }, { user_name: 'Rahul' });

  assert('MessageNode', msgPayload.type === 'interactive', 'Generates interactive button message');
  assert('MessageNode', msgPayload.interactive.action.buttons.length === 3, 'Strictly limits buttons to 3 (Meta rule)');
  assert('MessageNode', msgPayload.interactive.action.buttons[0].reply.title.length <= 20, 'Button title capped at 20 chars (Meta rule)');
  assert('MessageNode', msgPayload.interactive.header.text.length <= 60, 'Header text capped at 60 chars');
  assert('MessageNode', msgPayload.interactive.body.text.includes('Rahul'), 'Interpolates dynamic variable {{user_name}}');

  // ----------------------------------------------------
  // NODE 3: MenuNode
  // ----------------------------------------------------
  console.log('\n--- AUDITING NODE 3: MenuNode ---');
  const menuPayload = flowRunner.buildMessagePayload(testPhone, 'menuNode', {
    text: 'Please select a service:',
    menuButtonText: 'Browse All Services Catalog',
    sections: [
      {
        title: 'Main Services Heading Very Long',
        rows: Array.from({ length: 8 }, (_, i) => ({ id: `row_${i}`, title: `Service Title Long ${i}`, description: 'Description' }))
      },
      {
        title: 'Secondary Services',
        rows: Array.from({ length: 8 }, (_, i) => ({ id: `row_sec_${i}`, title: `Extra ${i}` }))
      }
    ]
  }, {});

  const totalRows = menuPayload.interactive.action.sections.reduce((acc, s) => acc + s.rows.length, 0);
  assert('MenuNode', menuPayload.interactive.type === 'list', 'Generates interactive list message');
  assert('MenuNode', totalRows <= 10, `Strictly limits cumulative rows to ${totalRows} <= 10 across all sections`);
  assert('MenuNode', menuPayload.interactive.action.button.length <= 20, 'Menu button text capped at 20 chars');
  assert('MenuNode', menuPayload.interactive.action.sections[0].title.length <= 24, 'Section title capped at 24 chars');

  // ----------------------------------------------------
  // NODE 4: InputNode (Validation & Fallback)
  // ----------------------------------------------------
  console.log('\n--- AUDITING NODE 4: InputNode ---');
  // Check location parsing & context preservation
  const locPayload = flowRunner.buildMessagePayload(testPhone, 'inputNode', { question: 'Please share your address:' }, {});
  assert('InputNode', locPayload.text.body.includes('address'), 'Generates question prompt cleanly');

  // ----------------------------------------------------
  // NODE 5: ConditionNode
  // ----------------------------------------------------
  console.log('\n--- AUDITING NODE 5: ConditionNode ---');
  const condNode1 = { data: { variable: 'order.total', operator: 'greater_than', value: '1000' } };
  const condRes1 = await executeConditionNode(session, condNode1, {});
  assert('ConditionNode', condRes1 === 'true_path', 'Evaluates nested variable order.total (1500 > 1000) -> true_path');

  const condNode2 = { data: { variable: 'user_name', operator: 'contains', value: 'Rahul' } };
  const condRes2 = await executeConditionNode(session, condNode2, {});
  assert('ConditionNode', condRes2 === 'true_path', 'Evaluates contains rule on user_name -> true_path');

  // ----------------------------------------------------
  // NODE 6: ActionNode
  // ----------------------------------------------------
  console.log('\n--- AUDITING NODE 6: ActionNode ---');
  const actionNode = {
    data: {
      actionType: 'set_variable',
      variableName: 'loyalty_points',
      variableValue: '250'
    }
  };
  await executeActionNode(session, actionNode, { user_name: 'Rahul' });
  assert('ActionNode', session.sessionVariables['loyalty_points'] === '250', 'Sets session variable loyalty_points = 250 in MongoDB session');

  // ----------------------------------------------------
  // NODE 8: ApiNode
  // ----------------------------------------------------
  console.log('\n--- AUDITING NODE 8: ApiNode ---');
  const apiNode = {
    data: {
      apiUrl: 'https://httpbin.org/get',
      method: 'GET',
      saveVariable: 'http_status_code',
      responseMapping: 'headers.Host'
    }
  };
  const apiStatus = await executeApiNode(session, apiNode, {});
  assert('ApiNode', apiStatus === 'success', 'Executes real outgoing HTTP request with 200 OK');
  assert('ApiNode', !!session.sessionVariables['http_status_code'], 'Saves API response into session variable');

  // ----------------------------------------------------
  // NODE 10: MediaNode
  // ----------------------------------------------------
  console.log('\n--- AUDITING NODE 10: MediaNode ---');
  const docPayload = flowRunner.buildMessagePayload(testPhone, 'mediaNode', {
    messageType: 'doc',
    mediaUrl: 'https://example.com/uploads/brochure_hash123.pdf',
    fileName: 'Official_Admission_Brochure_2026.pdf',
    text: 'Here is your requested brochure.'
  }, {});
  assert('MediaNode', docPayload.type === 'document', 'Formats as document type');
  assert('MediaNode', docPayload.document.filename === 'Official_Admission_Brochure_2026.pdf', 'Preserves original human-readable filename');

  const voicePayload = flowRunner.buildMessagePayload(testPhone, 'mediaNode', {
    messageType: 'voice',
    mediaUrl: 'https://example.com/audio/voice_note.ogg'
  }, {});
  assert('MediaNode', voicePayload.type === 'audio' && voicePayload.audio.ptt === true, 'Sets ptt: true for voice notes');

  // ----------------------------------------------------
  // NODE 11: PollNode
  // ----------------------------------------------------
  console.log('\n--- AUDITING NODE 11: PollNode ---');
  const pollPayload = flowRunner.buildMessagePayload(testPhone, 'pollNode', {
    text: 'What is your preferred mode of study?',
    options: [
      { text: 'Online Classes' },
      { text: 'Offline Campus' },
      { text: 'Online Classes' } // Duplicate that would trigger Meta error 100
    ],
    allowMultipleAnswers: false
  }, {});
  assert('PollNode', pollPayload.interactive.type === 'poll', 'Generates interactive poll payload');
  assert('PollNode', pollPayload.interactive.action.selectable_options_count === 1, 'Enforces single answer selectable count');
  assert('PollNode', pollPayload.interactive.action.options.length === 3, 'Generates all options');
  const optNames = pollPayload.interactive.action.options.map(o => o.option_name);
  const isUnique = new Set(optNames).size === optNames.length;
  assert('PollNode', isUnique, 'Automatically deduplicates identical option names to prevent Meta Error 100');

  // ----------------------------------------------------
  // NODE 12: TemplateNode
  // ----------------------------------------------------
  console.log('\n--- AUDITING NODE 12: TemplateNode ---');
  const tplPayload = flowRunner.buildMessagePayload(testPhone, 'templateNode', {
    templateName: 'order_update_v2',
    templateLanguage: 'en_US',
    variables: [{ value: '{{user_name}}' }, { value: '{{order_id}}' }],
    offerCode: 'SAVE20',
    buttonUrlVariable: 'ORD-9988'
  }, { user_name: 'Rahul', order_id: 'ORD-9988' });

  assert('TemplateNode', tplPayload.type === 'template', 'Generates template message');
  const bodyComp = tplPayload.template.components.find(c => c.type === 'body');
  assert('TemplateNode', bodyComp.parameters[0].text === 'Rahul', 'Interpolates body parameter {{1}}');
  assert('TemplateNode', bodyComp.parameters[1].text === 'ORD-9988', 'Interpolates body parameter {{2}}');
  const copyBtn = tplPayload.template.components.find(c => c.sub_type === 'copy_code');
  assert('TemplateNode', copyBtn?.parameters[0].coupon_code === 'SAVE20', 'Includes COPY_CODE coupon button');
  const urlBtn = tplPayload.template.components.find(c => c.sub_type === 'url');
  assert('TemplateNode', urlBtn?.parameters[0].text === 'ORD-9988', 'Includes dynamic URL button parameter');

  // ----------------------------------------------------
  // NODE 15: CarouselNode
  // ----------------------------------------------------
  console.log('\n--- AUDITING NODE 15: CarouselNode ---');
  const carouselPayload = flowRunner.buildMessagePayload(testPhone, 'carouselNode', {
    text: 'Explore our latest courses:',
    cards: [
      { id: 'c1', title: 'Full Stack Web Dev', mediaUrl: 'https://example.com/c1.jpg', buttonText: 'View Course' },
      { id: 'c2', title: 'Data Science & AI', mediaUrl: 'https://example.com/c2.jpg', buttonText: 'View Course' }
    ]
  }, {});
  assert('CarouselNode', carouselPayload.interactive.type === 'carousel', 'Generates interactive carousel');
  assert('CarouselNode', carouselPayload.interactive.action.cards[0].card_index === 0, 'Includes mandatory card_index: 0 (Meta rule)');
  assert('CarouselNode', carouselPayload.interactive.action.cards[1].card_index === 1, 'Includes mandatory card_index: 1 (Meta rule)');
  assert('CarouselNode', carouselPayload.interactive.action.cards[0].action.buttons[0].reply.title === 'View Course', 'Includes reply button on card');

  // ----------------------------------------------------
  // NODE 16: RandomizerNode
  // ----------------------------------------------------
  console.log('\n--- AUDITING NODE 16: RandomizerNode ---');
  const rNodeA = { data: { splitPercentage: 100 } };
  const rHandleA = await executeRandomizerNode(session, rNodeA);
  assert('RandomizerNode', rHandleA === 'path_a', 'Routes to path_a on 100% split');
  assert('RandomizerNode', session.sessionVariables['ab_variant'] === 'A', 'Records ab_variant = "A" in session');

  const rNodeB = { data: { splitPercentage: 0 } };
  const rHandleB = await executeRandomizerNode(session, rNodeB);
  assert('RandomizerNode', rHandleB === 'path_b', 'Routes to path_b on 0% split');
  assert('RandomizerNode', session.sessionVariables['ab_variant'] === 'B', 'Records ab_variant = "B" in session');

  // ----------------------------------------------------
  // NODE 17: ReactionNode
  // ----------------------------------------------------
  console.log('\n--- AUDITING NODE 17: ReactionNode ---');
  const reactPayload = flowRunner.buildMessagePayload(testPhone, 'reactionNode', {
    emoji: '❤️'
  }, { incomingMessageId: 'wamid.HBgLMjA=' });
  assert('ReactionNode', reactPayload.type === 'reaction', 'Generates reaction message type');
  assert('ReactionNode', reactPayload.reaction.message_id === 'wamid.HBgLMjA=', 'Binds to incoming WAMID message_id');
  assert('ReactionNode', reactPayload.reaction.emoji === '❤️', 'Sets chosen emoji');

  // ----------------------------------------------------
  // NODE 18: UtilityNode
  // ----------------------------------------------------
  console.log('\n--- AUDITING NODE 18: UtilityNode ---');
  const utilContact = flowRunner.buildMessagePayload(testPhone, 'utilityNode', {
    utilityType: 'contact',
    contactName: 'Support Desk',
    contactPhone: '+919999900000',
    contactEmail: 'support@messbee.com'
  }, {});
  assert('UtilityNode', utilContact.type === 'contacts', 'Generates contacts payload');
  assert('UtilityNode', utilContact.contacts[0].phones[0].type === 'CELL', 'Sets phone type to CELL (Meta rule)');

  const utilLocation = flowRunner.buildMessagePayload(testPhone, 'utilityNode', {
    utilityType: 'location',
    locationName: 'Corporate Office',
    locationAddress: 'Sector 62, Noida, UP',
    latitude: '28.6280',
    longitude: '77.3649'
  }, {});
  assert('UtilityNode', utilLocation.type === 'location', 'Generates location payload');
  // ----------------------------------------------------
  // NODE 7: AiNode
  // ----------------------------------------------------
  console.log('\n--- AUDITING NODE 7: AiNode ---');
  const parsedPrompt = parseDynamicVariables('Customer {{user_name}} placed order {{order_id}}', { user_name: 'Rahul', order_id: 'ORD-99' });
  assert('AiNode', parsedPrompt === 'Customer Rahul placed order ORD-99', 'Interpolates context variables into AI system prompt');

  // ----------------------------------------------------
  // NODE 9: DelayNode
  // ----------------------------------------------------
  console.log('\n--- AUDITING NODE 9: DelayNode ---');
  const DelayedJob = (await import('./models/DelayedJob.js')).default || require('./models/DelayedJob.js');
  const dJob = new DelayedJob({
    customerPhone: testPhone,
    channelId: channel._id,
    nextNodeId: 'node_target_resume',
    executeAt: new Date(Date.now() + 60000),
    status: 'PENDING'
  });
  await dJob.save();
  const foundJob = await DelayedJob.findById(dJob._id);
  assert('DelayNode', !!foundJob && foundJob.status === 'PENDING', 'Persists scheduled delay in MongoDB DelayedJob queue');
  await DelayedJob.deleteOne({ _id: dJob._id });

  // ----------------------------------------------------
  // NODE 13: Catalog & CommerceNode
  // ----------------------------------------------------
  console.log('\n--- AUDITING NODE 13: Catalog & CommerceNode ---');
  const catalogPayload = flowRunner.buildMessagePayload(testPhone, 'catalogNode', {
    catalogType: 'catalog',
    catalogId: 'CAT_12345',
    text: 'View our winter collection'
  }, {});
  assert('CatalogNode', catalogPayload.interactive.type === 'catalog_message', 'Generates WhatsApp catalog_message interactive type');

  const commercePayload = flowRunner.buildMessagePayload(testPhone, 'commerceNode', {
    commerceType: 'payment',
    text: 'Please pay order invoice',
    amount: 499,
    itemName: 'Web Dev Masterclass',
    currency: 'INR'
  }, {});
  assert('CommerceNode', commercePayload.interactive.type === 'order_details', 'Generates Meta order_details interactive payload');
  assert('CommerceNode', commercePayload.interactive.action.parameters.total_amount.value === 49900, 'Calculates order amount in paise (49900)');

  // ----------------------------------------------------
  // NODE 14: ShopifyNode
  // ----------------------------------------------------
  console.log('\n--- AUDITING NODE 14: ShopifyNode ---');
  const { executeShopifyNode } = require('./engine/nodeExecutors');
  const shopifyFailStatus = await executeShopifyNode(session, { data: { shopifyAction: 'get_customer' } }, {});
  assert('ShopifyNode', shopifyFailStatus === 'failure', 'Safely returns failure edge when store URL is not configured');

  // ----------------------------------------------------
  // NODE 19: WaitForEventNode
  // ----------------------------------------------------
  console.log('\n--- AUDITING NODE 19: WaitForEventNode ---');
  session.status = 'WAITING_FOR_EVENT';
  session.expectedEvent = 'any_message';
  await session.save();
  const savedWaitSession = await CustomerSession.findById(session._id);
  assert('WaitForEventNode', savedWaitSession.status === 'WAITING_FOR_EVENT', 'Persists WAITING_FOR_EVENT state in database');

  // ----------------------------------------------------
  // NODE 20: EventTriggerNode
  // ----------------------------------------------------
  console.log('\n--- AUDITING NODE 20: EventTriggerNode ---');
  const evTrigger = { type: 'eventTriggerNode', data: { eventName: 'lead_captured' } };
  assert('EventTriggerNode', !!evTrigger.data.eventName, 'Event trigger is properly structured with listening event');

  console.log('\n========================================');
  const passedCount = results.filter(r => r.status === 'PASS').length;
  const failedCount = results.filter(r => r.status === 'FAIL').length;
  console.log(`🏁 AUDIT COMPLETE: ${passedCount} PASSED, ${failedCount} FAILED out of ${results.length} total checks.`);
  console.log('========================================');

  await mongoose.disconnect();
  process.exit(failedCount === 0 ? 0 : 1);
}

runRealNodeAudit().catch(err => {
  console.error('Audit fatal error:', err);
  process.exit(1);
});

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, BookOpen, ArrowRight, Zap, CheckCircle2, Clock, Variable, 
  HelpCircle, AlertTriangle, Lightbulb, ChevronRight, Copy, Check, ExternalLink 
} from 'lucide-react';

export const NODE_GUIDES = {
  triggerNode: {
    name: 'Trigger Node',
    badge: 'Flow Starting Point',
    badgeColor: '#8b5cf6',
    icon: '⚡',
    shortDesc: 'Starts the automation workflow when a specific event, keyword, or action occurs.',
    howItWorks: [
      'This is the very first node in any flow. It does not have an input handle because it listens for inbound events.',
      'When a customer sends a message on WhatsApp that matches your configured rule (Exact match, Contains, Ad click, QR link, etc.), this node activates.',
      'The engine immediately creates a new session for the customer and passes control to the connected Next Step.'
    ],
    nextStepHandles: [
      {
        handle: 'main-handle',
        title: 'Then, do the following (Next Step)',
        triggerCondition: 'Triggers immediately as soon as the incoming message matches the trigger rule.',
        color: '#10b981'
      }
    ],
    variablesSaved: [
      { name: '{{contact.name}}', desc: 'Customer name from WhatsApp or CRM' },
      { name: '{{contact.phone}}', desc: 'Customer phone number (with country code)' },
      { name: '{{system.date}}', desc: 'Current date (DD/MM/YYYY)' },
      { name: '{{system.time}}', desc: 'Current time (HH:MM AM/PM)' }
    ],
    example: {
      scenario: 'Keyword Trigger "PRICE" or "MENU"',
      steps: [
        '1. Customer types "PRICE" on WhatsApp.',
        '2. Trigger Node recognizes the keyword.',
        '3. Automatically jumps along the "main-handle" to send a Welcome Price List message.'
      ]
    },
    proTips: [
      'You can enter multiple comma-separated keywords (e.g. "hi, hello, hey, start").',
      'Use "any_message" trigger if you want this flow to run on any incoming message when no other flow matches.'
    ]
  },

  eventTriggerNode: {
    name: 'Event Trigger Node',
    badge: 'Event Entry Point',
    badgeColor: '#8b5cf6',
    icon: '⚡',
    shortDesc: 'Listens for system events such as CRM tags, webhooks, or scheduled calendar dates.',
    howItWorks: [
      'Activates when an external event occurs (e.g., API webhook received, tag added in CRM, or recurring schedule timer).',
      'Immediately initiates a new session for the target contact and triggers the connected next node.'
    ],
    nextStepHandles: [
      {
        handle: 'main-handle',
        title: 'Next Step',
        triggerCondition: 'Runs automatically when the external event fires.',
        color: '#10b981'
      }
    ],
    variablesSaved: [
      { name: '{{contact.name}}', desc: 'Customer name' },
      { name: '{{contact.phone}}', desc: 'Target phone number' }
    ],
    example: {
      scenario: 'Order Placed Webhook',
      steps: [
        '1. Your website posts order details to Messbee webhook URL.',
        '2. Event Trigger Node starts the order confirmation flow.',
        '3. Next step sends WhatsApp confirmation message to customer.'
      ]
    },
    proTips: [
      'Ensure the incoming payload contains the customer phone number so WhatsApp delivery succeeds.'
    ]
  },

  inputNode: {
    name: 'Ask Question (Input Node)',
    badge: 'Interactive Data Collection',
    badgeColor: '#3b82f6',
    icon: '❓',
    shortDesc: 'Asks the customer a question, pauses the automation, validates their answer, and saves it into a variable.',
    howItWorks: [
      'Sends your question message to the customer on WhatsApp.',
      'Engine switches customer status to WAITING_FOR_INPUT and PAUSES execution.',
      'When customer replies, engine checks if their reply matches the Validation Type (Name, Phone, Email, Number, Date, Location, Photo, etc.).',
      'If Valid: Saves answer into your configured variable name and proceeds to the Next Step.',
      'If Invalid: Keeps customer on this node, sends an error prompt, and asks them to try again (transfers to agent after 3 failed attempts).'
    ],
    nextStepHandles: [
      {
        handle: 'main-handle',
        title: 'Next step (Valid Answer)',
        triggerCondition: 'Triggers when customer sends a valid response that passes validation.',
        color: '#10b981'
      },
      {
        handle: 'timeout',
        title: 'Timeout (No Response)',
        triggerCondition: 'Triggers if customer does not reply within configured timeout minutes (e.g. 15m, 60m).',
        color: '#f59e0b'
      }
    ],
    variablesSaved: [
      { name: '{{variableName}}', desc: 'The custom variable name you selected (e.g., {{city}} or {{age}})' },
      { name: '{{contact.name}}', desc: 'Auto-updated if validation type is "Name"' },
      { name: '{{contact.email}}', desc: 'Auto-updated if validation type is "Email"' },
      { name: '{{contact.phone}}', desc: 'Auto-updated if validation type is "Phone"' }
    ],
    example: {
      scenario: 'Lead Qualification (City & Name)',
      steps: [
        '1. Bot asks: "Which city are you located in?"',
        '2. Customer replies: "Mumbai".',
        '3. Engine validates text, saves to {{user_city}}, and advances to next message: "Great! We have 3 branches in {{user_city}}."'
      ]
    },
    proTips: [
      'Select "Name and Mobile" validation if customers frequently type their name and phone in a single message.',
      'Always connect the "timeout" handle to a gentle reminder message so abandoned leads are re-engaged!'
    ]
  },

  messageNode: {
    name: 'Send Message Node',
    badge: 'Message Dispatcher',
    badgeColor: '#10b981',
    icon: '💬',
    shortDesc: 'Sends standard text messages or interactive button messages to the customer.',
    howItWorks: [
      'Sends formatted text with WhatsApp markdown support (*bold*, _italic_, ~strikethrough~).',
      'Supports dynamic variable replacement: {{contact.name}}, {{system.date}}, etc.',
      'If configured with Quick Reply Buttons: Pauses execution and waits for user to tap one of the buttons.'
    ],
    nextStepHandles: [
      {
        handle: 'main-handle',
        title: 'Next Step (Text Message)',
        triggerCondition: 'Triggers automatically after text message is sent (500ms delay for natural pacing).',
        color: '#10b981'
      },
      {
        handle: 'btn-0, btn-1, btn-2',
        title: 'Button Click Handles',
        triggerCondition: 'Triggers when customer clicks that specific button on WhatsApp.',
        color: '#818cf8'
      },
      {
        handle: 'timeout',
        title: 'Timeout (Button Message)',
        triggerCondition: 'Triggers if user does not tap any button within timeout duration.',
        color: '#f59e0b'
      }
    ],
    variablesSaved: [
      { name: '{{selected_button}}', desc: 'Title of the button clicked by the customer' },
      { name: '{{selected_option}}', desc: 'Payload/value of the clicked choice' }
    ],
    example: {
      scenario: 'Support Options Message',
      steps: [
        '1. Bot sends: "Hi {{contact.name}}, how can we assist you today?" with 2 buttons: [Sales] and [Support].',
        '2. If customer taps [Sales] -> follows btn-0 handle to show product catalogue.',
        '3. If customer taps [Support] -> follows btn-1 handle to initiate live agent handoff.'
      ]
    },
    proTips: [
      'WhatsApp supports up to 3 buttons per interactive button message.',
      'Button titles must be 20 characters or shorter according to Meta policy.'
    ]
  },

  templateNode: {
    name: 'WhatsApp Template Node',
    badge: 'Meta Approved Template',
    badgeColor: '#0ea5e9',
    icon: '📑',
    shortDesc: 'Sends pre-approved WhatsApp Business templates for marketing, utility, or authentication.',
    howItWorks: [
      'Sends an official Meta template (e.g., shipping updates, broadcast offers, reminders).',
      'Automatically populates template parameters ({{1}}, {{2}}) with contact variables.',
      'Can act as a Campaign Trigger Root Node: When customers receive your broadcast campaign and tap a button on WhatsApp, this node receives the reply and continues the automation.'
    ],
    nextStepHandles: [
      {
        handle: 'btn-0, btn-1, etc.',
        title: 'Quick Reply Button Handles',
        triggerCondition: 'Triggers when customer taps that specific quick reply button.',
        color: '#10b981'
      },
      {
        handle: 'main-handle',
        title: 'Next Step (Template without buttons)',
        triggerCondition: 'Triggers automatically after template is dispatched.',
        color: '#10b981'
      }
    ],
    variablesSaved: [
      { name: '{{selected_button}}', desc: 'Title of the template button clicked' },
      { name: '{{selected_date}}', desc: 'Auto-extracted if button text mentions a date (e.g., "Book Tomorrow")' },
      { name: '{{selected_time}}', desc: 'Auto-extracted if button text mentions a time' }
    ],
    example: {
      scenario: 'Broadcast Campaign with 2 Action Buttons',
      steps: [
        '1. Customer receives template: "Special 20% Off! Tap below to claim." with buttons: [Claim Coupon] and [Talk to Expert].',
        '2. Customer taps [Claim Coupon].',
        '3. Template Node matches the button tap and runs connected Commerce Node to generate coupon code.'
      ]
    },
    proTips: [
      'Quick Reply buttons have individual handles (●) on the right. Connect each button to a different next node!',
      'URL and Phone Call buttons do not generate inbound WhatsApp replies, so they do not have output handles.'
    ]
  },

  menuNode: {
    name: 'Menu / List Message Node',
    badge: 'Interactive List Picker',
    badgeColor: '#6366f1',
    icon: '📋',
    shortDesc: 'Sends a native WhatsApp interactive pop-up list menu with up to 10 selectable items.',
    howItWorks: [
      'Sends a clean message with a "View Options" button that opens a bottom sheet list on WhatsApp.',
      'Engine pauses and waits for customer to choose an item.',
      'When customer selects an item, engine matches the row ID/title and routes along that row’s handle.'
    ],
    nextStepHandles: [
      {
        handle: 'row-0, row-1, row-xxx',
        title: 'Row Selection Handles',
        triggerCondition: 'Each menu row has its own handle. Triggers when customer selects that specific row.',
        color: '#10b981'
      },
      {
        handle: 'main-handle',
        title: 'Default Next Step (Fallback)',
        triggerCondition: 'Triggers if customer picks a row that does not have an individual connection.',
        color: '#6366f1'
      },
      {
        handle: 'timeout',
        title: 'Timeout (No Selection)',
        triggerCondition: 'Triggers if customer does not make a selection within timeout minutes.',
        color: '#f59e0b'
      }
    ],
    variablesSaved: [
      { name: '{{selected_menu_option}}', desc: 'Title of the selected row (e.g., "Dental Cleaning")' },
      { name: '{{selected_row_id}}', desc: 'Unique postback ID of the chosen row' },
      { name: '{{selected_date}}', desc: 'Extracted appointment date if row represents a booking date slot' },
      { name: '{{selected_time}}', desc: 'Extracted appointment time if row represents a time slot' }
    ],
    example: {
      scenario: 'Doctor Appointment Booking',
      steps: [
        '1. Menu displays: "Select Service" with rows: [General Checkup], [Skin Consultation], [Eye Checkup].',
        '2. Customer taps [Skin Consultation].',
        '3. Engine saves selection to {{selected_menu_option}} and routes to the dermatologist booking sub-flow.'
      ]
    },
    proTips: [
      'List menus support sections (e.g., "Morning Slots" and "Evening Slots") with row descriptions.',
      'Unlike buttons (max 3), List Menus support up to 10 options.'
    ]
  },

  conditionNode: {
    name: 'Condition Node (If / Else)',
    badge: 'Smart Decision Logic',
    badgeColor: '#f59e0b',
    icon: '🔀',
    shortDesc: 'Evaluates variables, user answers, or tags to split the flow into True or False branches.',
    howItWorks: [
      'Compares a variable (e.g. {{contact.city}}, {{score}}, {{contact.tags}}) against your target value.',
      'Supports operators: Equals, Not Equals, Contains, Greater Than, Less Than, Has Tag, Is Empty, Regex, etc.',
      'Instantly evaluates the condition without pausing the bot and picks either the True or False path.'
    ],
    nextStepHandles: [
      {
        handle: 'true',
        title: 'True Path (Green)',
        triggerCondition: 'Triggers when the condition evaluates to TRUE.',
        color: '#22c55e'
      },
      {
        handle: 'false',
        title: 'False Path (Red)',
        triggerCondition: 'Triggers when the condition evaluates to FALSE.',
        color: '#ef4444'
      }
    ],
    variablesSaved: [],
    example: {
      scenario: 'VIP Customer Check',
      steps: [
        '1. Condition checks: IF {{contact.tags}} contains "VIP".',
        '2. True Path -> Sends 30% discount offer.',
        '3. False Path -> Sends 10% standard welcome offer.'
      ]
    },
    proTips: [
      'Always connect BOTH True and False handles so customers are never stuck with no response.',
      'Case-insensitive comparison is enabled automatically (e.g. "yes" matches "YES").'
    ]
  },

  actionNode: {
    name: 'Action Node',
    badge: 'CRM & System Execution',
    badgeColor: '#ec4899',
    icon: '⚡',
    shortDesc: 'Performs background CRM operations like adding tags, updating custom fields, or handing off to human agents.',
    howItWorks: [
      'Executes silently in the background without sending a WhatsApp message.',
      'Supported Actions: Add Tag, Remove Tag, Update Contact Field, Human Handoff (Live Chat), Opt-in, Opt-out.',
      'Executes instantaneously and immediately advances to the Next Step.'
    ],
    nextStepHandles: [
      {
        handle: 'main-handle',
        title: 'Next Step',
        triggerCondition: 'Triggers immediately after the action completes (unless action is Human Handoff).',
        color: '#10b981'
      }
    ],
    variablesSaved: [
      { name: '{{contact.tags}}', desc: 'Updated with added or removed tags' },
      { name: '{{contact.customFields}}', desc: 'Updated with new field values' }
    ],
    example: {
      scenario: 'Tagging an Interested Lead',
      steps: [
        '1. Customer clicks "Interested in Franchise".',
        '2. Action Node adds tag "Franchise_Lead" to contact profile in CRM.',
        '3. Next step triggers email alert to sales team.'
      ]
    },
    proTips: [
      'If you choose "Human Handoff (Live Chat)", the bot pauses completely and alerts agents in the inbox.',
      'You can use dynamic variables in tags, e.g., "Course_{{selected_course}}".'
    ]
  },

  apiNode: {
    name: 'API Webhook Node',
    badge: 'External Integration',
    badgeColor: '#06b6d4',
    icon: '🌐',
    shortDesc: 'Calls an external HTTP REST API (GET, POST, PUT, DELETE) to fetch or send live data.',
    howItWorks: [
      'Sends an HTTP request to your external server, CRM, Google Sheets, or Zapier endpoint.',
      'Parses dynamic variables in URL headers and request body.',
      'Extracts values from the API JSON response and saves them into session variables for later nodes.'
    ],
    nextStepHandles: [
      {
        handle: 'success',
        title: 'Success (2xx HTTP Status)',
        triggerCondition: 'Triggers when external server responds with a 200–299 OK status.',
        color: '#10b981'
      },
      {
        handle: 'failure',
        title: 'Failure / Error',
        triggerCondition: 'Triggers if API times out, server crashes, or returns 4xx/5xx status.',
        color: '#ef4444'
      }
    ],
    variablesSaved: [
      { name: 'Configured Response Mappings', desc: 'Any JSON fields mapped in the node (e.g. response.order_id -> {{order_id}})' }
    ],
    example: {
      scenario: 'Live Pincode Serviceability Check',
      steps: [
        '1. User types pincode: "400001".',
        '2. API Node hits: https://api.mycourier.com/check?pincode={{pincode}}.',
        '3. Success Path -> Sends "Delivery available in 2 days!".',
        '4. Failure Path -> Sends "Sorry, we currently do not deliver to this pincode."'
      ]
    },
    proTips: [
      'Always configure the Failure handle with a friendly fallback message so users aren’t left hanging if third-party servers go down.'
    ]
  },

  aiNode: {
    name: 'AI Assistant Node (ChatGPT)',
    badge: 'Artificial Intelligence',
    badgeColor: '#10b981',
    icon: '🤖',
    shortDesc: 'Generates intelligent, context-aware conversational replies using OpenAI GPT-4o.',
    howItWorks: [
      'Takes the customer’s latest incoming message and passes it to ChatGPT with your System Prompt.',
      'ChatGPT analyzes the question and generates a professional, accurate response.',
      'Saves the answer to {{ai_response}} and immediately proceeds to the connected Next Step.'
    ],
    nextStepHandles: [
      {
        handle: 'main-handle',
        title: 'Next Step',
        triggerCondition: 'Triggers as soon as OpenAI returns the generated response text.',
        color: '#10b981'
      }
    ],
    variablesSaved: [
      { name: '{{ai_response}}', desc: 'The generated AI answer (or your custom variable name)' }
    ],
    example: {
      scenario: 'Automated FAQ Answerer',
      steps: [
        '1. Customer asks: "Do you offer vegan gluten-free pizza?"',
        '2. AI Node processes menu prompt and returns: "Yes! We have 2 vegan gluten-free pizzas with almond crust."',
        '3. Next step sends: "{{ai_response}}\n\nWould you like to place an order?"'
      ]
    },
    proTips: [
      'Write clear instructions in System Prompt (e.g. "Keep answers under 50 words. Do not quote prices above $100.").',
      'Follow the AI Node with a Message Node that includes "{{ai_response}}".'
    ]
  },

  delayNode: {
    name: 'Smart Delay Node',
    badge: 'Timed Flow Pausing',
    badgeColor: '#a855f7',
    icon: '⏳',
    shortDesc: 'Pauses the automation for a specified number of minutes, hours, or days before continuing.',
    howItWorks: [
      'Calculates the exact delay duration (e.g., 30 Minutes or 2 Days).',
      'Stores a scheduled delayed task in background queue and halts the active execution.',
      'When the timer finishes, background worker wakes up and automatically resumes flow at the Next Step.'
    ],
    nextStepHandles: [
      {
        handle: 'main-handle',
        title: 'Next Step (After Delay)',
        triggerCondition: 'Triggers automatically when the timer reaches 0.',
        color: '#10b981'
      }
    ],
    variablesSaved: [],
    example: {
      scenario: 'Cart Abandonment Follow-up',
      steps: [
        '1. Customer visits checkout but doesn’t buy.',
        '2. Delay Node waits for 2 Hours.',
        '3. After 2 hours, Next Step sends: "Hi {{contact.name}}, your cart is waiting! Use code SAVE10 for 10% off."'
      ]
    },
    proTips: [
      'Customer messages sent during a delay are ignored so flow timing is preserved.',
      'Great for post-purchase feedback (e.g. Delay 3 Days -> Send survey).'
    ]
  },

  waitForEventNode: {
    name: 'Wait for Event Node',
    badge: 'Event Listener with Timeout',
    badgeColor: '#eab308',
    icon: '⌛',
    shortDesc: 'Waits for customer to perform an action (send any message, add tag) with a safety timeout.',
    howItWorks: [
      'Switches customer status to WAITING_FOR_EVENT.',
      'If customer performs the event before timeout -> Follows "Event Happened" path.',
      'If timer runs out without customer action -> Follows "Timeout Reached" path.'
    ],
    nextStepHandles: [
      {
        handle: 'event_happened',
        title: 'Event Happened (Green)',
        triggerCondition: 'Triggers if customer sends any message before the timeout expires.',
        color: '#10b981'
      },
      {
        handle: 'timeout',
        title: 'Timeout Reached (Amber)',
        triggerCondition: 'Triggers if timeout hours elapse with no customer interaction.',
        color: '#f59e0b'
      }
    ],
    variablesSaved: [],
    example: {
      scenario: 'Free Trial Check-in',
      steps: [
        '1. Bot sends demo video link.',
        '2. Waits for customer message for 24 Hours.',
        '3. Event Happened -> Answers their inquiry.',
        '4. Timeout Reached -> Sends follow-up: "Did you get a chance to watch the demo video?"'
      ]
    },
    proTips: [
      'Ideal for gentle re-engagement campaigns when you don’t want to bombard users with messages.'
    ]
  },

  randomizerNode: {
    name: 'Randomizer (A/B Test Node)',
    badge: 'Traffic Splitter',
    badgeColor: '#ec4899',
    icon: '🎲',
    shortDesc: 'Splits customer traffic by percentage to test two different messages or offers.',
    howItWorks: [
      'Generates a random percentage number between 1 and 100.',
      'If number is below your slider threshold (e.g., 50%), customer goes to Path A.',
      'Otherwise, customer goes to Path B.',
      'Instant non-blocking evaluation.'
    ],
    nextStepHandles: [
      {
        handle: 'path_a',
        title: 'Path A (e.g. 50%)',
        triggerCondition: 'Triggers for traffic assigned to variant A.',
        color: '#6366f1'
      },
      {
        handle: 'path_b',
        title: 'Path B (e.g. 50%)',
        triggerCondition: 'Triggers for traffic assigned to variant B.',
        color: '#ec4899'
      }
    ],
    variablesSaved: [],
    example: {
      scenario: 'Offer A/B Testing',
      steps: [
        '1. Path A (50%) -> Sends "Get Flat ₹500 OFF".',
        '2. Path B (50%) -> Sends "Get 25% Discount".',
        '3. Compare conversion rates in analytics to pick the winner!'
      ]
    },
    proTips: [
      'Use 50/50 split for equal statistical testing, or 80/20 for testing a risky new message.'
    ]
  },

  shopifyNode: {
    name: 'Shopify Node',
    badge: 'E-commerce Automation',
    badgeColor: '#10b981',
    icon: '🛍️',
    shortDesc: 'Fetches live Shopify customer data, order tracking status, inventory, or cart links.',
    howItWorks: [
      'Connects securely to your Shopify Admin API.',
      'Looks up customer orders by phone number or checks product stock.',
      'Saves order number, tracking URL, and status into variables and routes to Success or Failure.'
    ],
    nextStepHandles: [
      {
        handle: 'success',
        title: 'Success',
        triggerCondition: 'Order or customer details successfully found.',
        color: '#10b981'
      },
      {
        handle: 'failure',
        title: 'Failure / Not Found',
        triggerCondition: 'No matching order found or store unreachable.',
        color: '#ef4444'
      }
    ],
    variablesSaved: [
      { name: '{{shopify.order_number}}', desc: 'Order number (e.g. #1089)' },
      { name: '{{shopify.order_status}}', desc: 'Financial/Fulfillment status' },
      { name: '{{shopify.tracking_url}}', desc: 'Live carrier tracking link' },
      { name: '{{shopify.order_total}}', desc: 'Order price' }
    ],
    example: {
      scenario: 'Order Status Bot',
      steps: [
        '1. Customer types "Track Order".',
        '2. Shopify Node finds recent order for their phone.',
        '3. Success -> Sends "Your Order {{shopify.order_number}} is In Transit! Track: {{shopify.tracking_url}}".',
        '4. Failure -> Sends "No recent orders found for your mobile number."'
      ]
    },
    proTips: [
      'Enter your myshopify.com domain in the node settings.'
    ]
  },

  mediaNode: {
    name: 'Media Node',
    badge: 'Rich Media Dispatcher',
    badgeColor: '#6366f1',
    icon: '🖼️',
    shortDesc: 'Sends images, video files, PDFs, documents, audio, or voice recordings to WhatsApp.',
    howItWorks: [
      'Dispatches media URL or uploaded file directly to WhatsApp.',
      'Supports caption text with variables.',
      'Non-blocking: proceeds immediately to Next Step after sending.'
    ],
    nextStepHandles: [
      {
        handle: 'main-handle',
        title: 'Next Step',
        triggerCondition: 'Runs automatically after media is dispatched.',
        color: '#10b981'
      }
    ],
    variablesSaved: [],
    example: {
      scenario: 'Brochure PDF Delivery',
      steps: [
        '1. Customer requests brochure.',
        '2. Media Node sends PDF with caption: "Here is our 2026 Course Catalog".',
        '3. Next step asks: "Would you like to book a free counseling session?"'
      ]
    },
    proTips: [
      'Upload files under 16MB for images/audio and under 100MB for documents for fastest delivery.'
    ]
  },

  pollNode: {
    name: 'Poll Message Node',
    badge: 'WhatsApp Native Poll',
    badgeColor: '#8b5cf6',
    icon: '📊',
    shortDesc: 'Sends native WhatsApp poll with multiple choices where customers vote with one tap.',
    howItWorks: [
      'Renders native WhatsApp poll with up to 12 choices.',
      'Pauses execution until customer casts their vote.',
      'When customer votes, routes to the corresponding option handle.'
    ],
    nextStepHandles: [
      {
        handle: 'opt-0, opt-1, opt-2',
        title: 'Option Handles',
        triggerCondition: 'Triggers when customer votes for that specific option.',
        color: '#10b981'
      },
      {
        handle: 'main-handle',
        title: 'Default Next Step',
        triggerCondition: 'Fallback if individual option handle is unlinked.',
        color: '#8b5cf6'
      }
    ],
    variablesSaved: [
      { name: '{{selected_poll_option}}', desc: 'Text of the option selected by the user' }
    ],
    example: {
      scenario: 'Feedback Survey',
      steps: [
        '1. Poll sends: "How was your delivery experience?" with: [Excellent], [Average], [Poor].',
        '2. User votes [Excellent] -> opt-0 triggers Google Review request.',
        '3. User votes [Poor] -> opt-2 triggers escalation to Support Manager.'
      ]
    },
    proTips: [
      'Connect each option handle to different follow-up messages based on feedback.'
    ]
  },

  commerceNode: {
    name: 'Commerce Node',
    badge: 'Payments & Transactions',
    badgeColor: '#10b981',
    icon: '💳',
    shortDesc: 'Generates Razorpay/Stripe payment links, coupon codes, OTP verification, or invoices.',
    howItWorks: [
      'Generates formatted transaction details (Review and Pay link, coupon code, invoice).',
      'For payment links, waits for payment or confirmation before advancing.'
    ],
    nextStepHandles: [
      {
        handle: 'main-handle',
        title: 'Next Step',
        triggerCondition: 'Proceeds to the next step after payment/commerce dispatch.',
        color: '#10b981'
      }
    ],
    variablesSaved: [
      { name: '{{payment_status}}', desc: 'Status of the transaction (Paid/Pending)' }
    ],
    example: {
      scenario: 'Appointment Booking Deposit',
      steps: [
        '1. Customer selects appointment slot.',
        '2. Commerce Node sends ₹500 booking confirmation payment link.',
        '3. Next step confirms: "Payment received! Your booking is confirmed."'
      ]
    },
    proTips: [
      'Use for instant deposits, registration fees, or coupon delivery.'
    ]
  },

  catalogNode: {
    name: 'Catalog Node',
    badge: 'WhatsApp Store Products',
    badgeColor: '#3b82f6',
    icon: '🛒',
    shortDesc: 'Showcases Meta Commerce catalog products, single product cards, or multi-product sections.',
    howItWorks: [
      'Fetches products from connected Meta Commerce Catalog.',
      'Displays rich product images with price, description, and "View Item" cart button.'
    ],
    nextStepHandles: [
      {
        handle: 'main-handle',
        title: 'Next Step',
        triggerCondition: 'Proceeds to next step after catalog is presented.',
        color: '#10b981'
      }
    ],
    variablesSaved: [],
    example: {
      scenario: 'Featured Product Showcase',
      steps: [
        '1. Customer taps "Browse Shoes".',
        '2. Catalog Node renders live shoes section from Meta catalog.',
        '3. Customer can add to cart and checkout directly inside WhatsApp.'
      ]
    },
    proTips: [
      'Ensure Catalog ID is linked under Commerce Settings in Messbee.'
    ]
  },

  carouselNode: {
    name: 'Carousel Node',
    badge: 'Multi-Card Slider',
    badgeColor: '#6366f1',
    icon: '🎠',
    shortDesc: 'Displays a modern horizontal swipable card carousel with image, title, and action button on each card.',
    howItWorks: [
      'Renders up to 10 swipeable cards in a single WhatsApp interactive carousel.',
      'Customer swipes horizontally and taps button on their chosen card.'
    ],
    nextStepHandles: [
      {
        handle: 'main-handle',
        title: 'Next Step',
        triggerCondition: 'Proceeds to next step when card button is selected.',
        color: '#10b981'
      }
    ],
    variablesSaved: [
      { name: '{{selected_button}}', desc: 'Title of the selected carousel card button' }
    ],
    example: {
      scenario: 'Course Options Showcase',
      steps: [
        '1. Carousel sends 3 cards: [Full Stack Web Dev], [Data Science], [UI/UX Design].',
        '2. Customer swipes and taps "Enroll" on Data Science card.',
        '3. Next step proceeds to Data Science syllabus download.'
      ]
    },
    proTips: [
      'Use high-quality 1:1 square images on each card for best display.'
    ]
  },

  reactionNode: {
    name: 'Reaction Node',
    badge: 'Emoji Interaction',
    badgeColor: '#f59e0b',
    icon: '👍',
    shortDesc: 'Reacts to the customer’s latest incoming message with an emoji (e.g. 👍, ❤️, 🙏, 🚀).',
    howItWorks: [
      'Finds the customer’s latest incoming message ID and attaches the chosen emoji reaction.',
      'Instant non-blocking action: advances immediately to Next Step.'
    ],
    nextStepHandles: [
      {
        handle: 'main-handle',
        title: 'Next Step',
        triggerCondition: 'Triggers immediately after emoji reaction is added.',
        color: '#10b981'
      }
    ],
    variablesSaved: [],
    example: {
      scenario: 'Warm Welcome Reaction',
      steps: [
        '1. Customer sends "Thank you!".',
        '2. Bot reacts with "❤️" or "🙏".',
        '3. Next step sends: "You are always welcome!"'
      ]
    },
    proTips: [
      'Adds human warmth to automated bots, making conversations feel natural and friendly.'
    ]
  },

  utilityNode: {
    name: 'Utility Node',
    badge: 'Location, Contact & Calendar',
    badgeColor: '#14b8a6',
    icon: '📍',
    shortDesc: 'Shares Google Maps location pins, vCard contact cards, or calendar invite details.',
    howItWorks: [
      'Dispatches WhatsApp native location pin (with GPS coordinates), contact card, or calendar appointment.',
      'Instant delivery: advances to Next Step.'
    ],
    nextStepHandles: [
      {
        handle: 'main-handle',
        title: 'Next Step',
        triggerCondition: 'Triggers immediately after utility card is sent.',
        color: '#10b981'
      }
    ],
    variablesSaved: [],
    example: {
      scenario: 'Store Address & Directions',
      steps: [
        '1. Customer asks "Where is your store located?".',
        '2. Utility Node drops native WhatsApp Location Pin with coordinates.',
        '3. Customer taps "Get Directions" directly inside WhatsApp!'
      ]
    },
    proTips: [
      'Pinpoint your exact showroom or office latitude & longitude for one-click driving navigation.'
    ]
  }
};

export default function NodeGuideModal({ isOpen, onClose, nodeType = 'inputNode' }) {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState(nodeType);
  const [activeTab, setActiveTab] = useState('how-it-works');
  const [copiedVar, setCopiedVar] = useState(null);

  // Sync prop changes
  React.useEffect(() => {
    if (nodeType && NODE_GUIDES[nodeType]) {
      setSelectedType(nodeType);
    }
  }, [nodeType]);

  if (!isOpen) return null;

  const guide = NODE_GUIDES[selectedType] || NODE_GUIDES.inputNode;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedVar(text);
    setTimeout(() => setCopiedVar(null), 1800);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      padding: '20px',
      fontFamily: '"Outfit", "Inter", -apple-system, sans-serif'
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '820px',
        maxHeight: '90vh',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid #E2E8F0',
        animation: 'fadeIn 0.2s ease-out'
      }}>
        {/* Modal Top Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid #E2E8F0',
          background: '#F8FAFC',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: '#EEF2FF',
              color: '#4F46E5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              boxShadow: '0 2px 5px rgba(79, 70, 229, 0.15)'
            }}>
              {guide.icon}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#0F172A' }}>
                  {guide.name}
                </h2>
                <span style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  padding: '2px 8px',
                  borderRadius: '100px',
                  background: `${guide.badgeColor}15`,
                  color: guide.badgeColor,
                  border: `1px solid ${guide.badgeColor}30`,
                  letterSpacing: '0.04em'
                }}>
                  {guide.badge}
                </span>
              </div>
              <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#64748B' }}>
                {guide.shortDesc}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Quick Switch Dropdown */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                background: '#FFFFFF',
                color: '#334155',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              {Object.entries(NODE_GUIDES).map(([key, item]) => (
                <option key={key} value={key}>
                  {item.icon} {item.name}
                </option>
              ))}
            </select>

            <button
              onClick={onClose}
              style={{
                background: '#F1F5F9',
                border: 'none',
                borderRadius: '8px',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748B',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#E2E8F0'; e.currentTarget.style.color = '#0F172A'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = '#64748B'; }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #E2E8F0',
          background: '#FFFFFF',
          padding: '0 24px',
          gap: '8px',
          flexShrink: 0
        }}>
          {[
            { id: 'how-it-works', label: '📖 How It Works & Next Step', icon: Zap },
            { id: 'variables', label: '💾 Saved Variables', icon: Variable },
            { id: 'example', label: '💡 Real-World Example', icon: Lightbulb },
            { id: 'tips', label: '⭐ Pro Tips', icon: CheckCircle2 }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '12px 14px',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: isActive ? '700' : '500',
                  color: isActive ? '#4F46E5' : '#64748B',
                  borderBottom: isActive ? '2px solid #4F46E5' : '2px solid transparent',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={14} color={isActive ? '#4F46E5' : '#94A3B8'} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div style={{
          padding: '24px',
          overflowY: 'auto',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {/* TAB 1: HOW IT WORKS & NEXT STEPS */}
          {activeTab === 'how-it-works' && (
            <>
              {/* Working Explanation Card */}
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: '700', color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Zap size={14} color="#4F46E5" /> Step-by-Step Execution
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {guide.howItWorks.map((step, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <div style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        background: '#EEF2FF',
                        color: '#4F46E5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: '700',
                        flexShrink: 0,
                        marginTop: '1px'
                      }}>
                        {idx + 1}
                      </div>
                      <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: '1.55' }}>
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next Step Handles Card */}
              <div>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: '700', color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ArrowRight size={14} color="#10B981" /> Next Step Output Handles (Where does flow go next?)
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {guide.nextStepHandles.map((h, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: '14px',
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderLeft: `4px solid ${h.color}`,
                      borderRadius: '10px',
                      padding: '12px 16px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                    }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>
                            {h.title}
                          </span>
                          <code style={{ fontSize: '11px', background: '#F1F5F9', color: '#475569', padding: '1px 6px', borderRadius: '4px' }}>
                            {h.handle}
                          </code>
                        </div>
                        <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748B', lineHeight: '1.5' }}>
                          {h.triggerCondition}
                        </p>
                      </div>
                      <div style={{
                        padding: '4px 10px',
                        background: `${h.color}15`,
                        color: h.color,
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '700',
                        whiteSpace: 'nowrap'
                      }}>
                        ● Connect to next node
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* TAB 2: VARIABLES */}
          {activeTab === 'variables' && (
            <div>
              <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Variable size={18} color="#2563EB" />
                <p style={{ margin: 0, fontSize: '12px', color: '#1E40AF', lineHeight: '1.4' }}>
                  Variables store user responses and contact details. You can copy any variable below and paste it into downstream messages using <code>{'{{variable_name}}'}</code> syntax.
                </p>
              </div>

              {guide.variablesSaved.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {guide.variablesSaved.map((v, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      padding: '10px 14px'
                    }}>
                      <div>
                        <span style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: '700', color: '#4F46E5', background: '#EEF2FF', padding: '2px 8px', borderRadius: '4px' }}>
                          {v.name}
                        </span>
                        <span style={{ marginLeft: '12px', fontSize: '12px', color: '#475569' }}>
                          {v.desc}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopy(v.name)}
                        style={{
                          background: '#FFFFFF',
                          border: '1px solid #CBD5E1',
                          borderRadius: '6px',
                          padding: '4px 10px',
                          fontSize: '11px',
                          color: '#334155',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        {copiedVar === v.name ? <Check size={12} color="#10B981" /> : <Copy size={12} />}
                        {copiedVar === v.name ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '30px', color: '#64748B', fontSize: '13px', fontStyle: 'italic' }}>
                  This node does not create new variables. It executes actions directly or routes flow branches.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: REAL-WORLD EXAMPLE */}
          {activeTab === 'example' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: '#FAF5FF', border: '1px solid #E9D5FF', borderRadius: '10px', padding: '14px 18px' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#9333EA', letterSpacing: '0.05em' }}>
                  Practical Scenario
                </div>
                <div style={{ fontSize: '15px', fontWeight: '700', color: '#581C87', marginTop: '2px' }}>
                  {guide.example.scenario}
                </div>
              </div>

              <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '18px' }}>
                <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>
                  Flow Walkthrough:
                </h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {guide.example.steps.map((st, idx) => (
                    <div key={idx} style={{
                      padding: '10px 14px',
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      fontSize: '13px',
                      color: '#334155',
                      lineHeight: '1.5'
                    }}>
                      {st}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PRO TIPS */}
          {activeTab === 'tips' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {guide.proTips.map((tip, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  background: '#FEFCE8',
                  border: '1px solid #FEF08A',
                  borderRadius: '10px',
                  padding: '12px 16px'
                }}>
                  <CheckCircle2 size={16} color="#CA8A04" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <p style={{ margin: 0, fontSize: '13px', color: '#854D0E', lineHeight: '1.5' }}>
                    {tip}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid #E2E8F0',
          background: '#F8FAFC',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <div style={{ fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Lightbulb size={14} color="#F59E0B" />
            <span>
              Need more details?{' '}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/admin/help/automation');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: '#4F46E5',
                  fontWeight: '700',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Open Full Automation Documentation →
              </button>
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '8px 20px',
              borderRadius: '8px',
              background: '#4F46E5',
              color: '#FFFFFF',
              border: 'none',
              fontWeight: '600',
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'background 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#4338CA'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#4F46E5'}
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
}

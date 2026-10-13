/**
 * Pre-built Flow Templates for Automation Canvas
 * Each template provides a rich, multi-step, fully functional business flow.
 */

export const PREBUILT_FLOWS = {
  // 1. QR Reception & Staff Routing (Healthcare)
  qr_reception: {
    name: 'QR Reception Desk & Doctor Routing',
    nodes: [
      {
        id: '1', type: 'triggerNode', position: { x: 50, y: 300 },
        data: { label: 'Step 1: Scan QR Code', triggerType: 'qr_link', keyword: 'Check-in' }
      },
      {
        id: '2', type: 'inputNode', position: { x: 380, y: 300 },
        data: { 
          label: 'Step 2: Ask Full Name', 
          text: '🏥 Welcome! Please share the patient/visitor Full Name:',
          question: '🏥 Welcome! Please share the patient/visitor Full Name:',
          validationType: 'name', 
          variableName: 'name' 
        }
      },
      {
        id: '3', type: 'inputNode', position: { x: 710, y: 300 },
        data: { 
          label: 'Step 3: Ask Symptoms', 
          text: 'Thank you! Please briefly describe your symptoms or reason for visit:',
          question: 'Thank you! Please briefly describe your symptoms or reason for visit:',
          validationType: 'text', 
          variableName: 'problem' 
        }
      },
      {
        id: '4', type: 'inputNode', position: { x: 1040, y: 300 },
        data: { 
          label: 'Step 4: Ask Preferred Slot', 
          text: 'What is your preferred date or time slot? (e.g. Today 5:00 PM):',
          question: 'What is your preferred date or time slot? (e.g. Today 5:00 PM):',
          validationType: 'appointment', 
          variableName: 'appointment_slot' 
        }
      },
      {
        id: '5', type: 'messageNode', position: { x: 1370, y: 300 },
        data: { 
          label: 'Step 5: Select Doctor', 
          messageType: 'interactive',
          text: 'Please select which doctor you would like to consult with:',
          buttons: [
            { id: 'btn_rahul', title: 'Dr. Rahul', text: 'Dr. Rahul' },
            { id: 'btn_anil', title: 'Dr. Anil', text: 'Dr. Anil' },
            { id: 'btn_sunil', title: 'Dr. Sunil', text: 'Dr. Sunil' }
          ]
        }
      },
      {
        id: '6_rahul', type: 'actionNode', position: { x: 1720, y: 120 },
        data: { 
          label: 'Alert Dr. Rahul (WhatsApp)', 
          actionType: 'notify_whatsapp',
          recipientPhone: '+919876543210',
          adminPhone: '+919800011122',
          assignToStaff: 'Dr. Rahul',
          notificationMessage: '🏥 *NEW APPOINTMENT ALERT*\n\nDoctor: Dr. Rahul\nPatient: {{name}}\nPhone: +{{contact.phone}}\nProblem: {{problem}}\nSlot: {{appointment_slot}}\n\nDirect WhatsApp Chat: https://wa.me/{{contact.phone}}?text=Hello%20{{name}}'
        }
      },
      {
        id: '7_rahul', type: 'messageNode', position: { x: 2060, y: 120 },
        data: { 
          label: 'Confirmation (Dr. Rahul)', 
          messageType: 'text',
          text: '✅ Your appointment request has been sent to *Dr. Rahul*!\n\nDr. Rahul will review your symptoms and connect with you on WhatsApp shortly.'
        }
      },
      {
        id: '6_anil', type: 'actionNode', position: { x: 1720, y: 300 },
        data: { 
          label: 'Alert Dr. Anil (WhatsApp)', 
          actionType: 'notify_whatsapp',
          recipientPhone: '+919876543211',
          adminPhone: '+919800011122',
          assignToStaff: 'Dr. Anil',
          notificationMessage: '🏥 *NEW APPOINTMENT ALERT*\n\nDoctor: Dr. Anil\nPatient: {{name}}\nPhone: +{{contact.phone}}\nProblem: {{problem}}\nSlot: {{appointment_slot}}\n\nDirect WhatsApp Chat: https://wa.me/{{contact.phone}}?text=Hello%20{{name}}'
        }
      },
      {
        id: '7_anil', type: 'messageNode', position: { x: 2060, y: 300 },
        data: { 
          label: 'Confirmation (Dr. Anil)', 
          messageType: 'text',
          text: '✅ Your appointment request has been sent to *Dr. Anil*!\n\nDr. Anil will review your symptoms and connect with you on WhatsApp shortly.'
        }
      },
      {
        id: '6_sunil', type: 'actionNode', position: { x: 1720, y: 480 },
        data: { 
          label: 'Alert Dr. Sunil (WhatsApp)', 
          actionType: 'notify_whatsapp',
          recipientPhone: '+919876543212',
          adminPhone: '+919800011122',
          assignToStaff: 'Dr. Sunil',
          notificationMessage: '🏥 *NEW APPOINTMENT ALERT*\n\nDoctor: Dr. Sunil\nPatient: {{name}}\nPhone: +{{contact.phone}}\nProblem: {{problem}}\nSlot: {{appointment_slot}}\n\nDirect WhatsApp Chat: https://wa.me/{{contact.phone}}?text=Hello%20{{name}}'
        }
      },
      {
        id: '7_sunil', type: 'messageNode', position: { x: 2060, y: 480 },
        data: { 
          label: 'Confirmation (Dr. Sunil)', 
          messageType: 'text',
          text: '✅ Your appointment request has been sent to *Dr. Sunil*!\n\nDr. Sunil will review your symptoms and connect with you on WhatsApp shortly.'
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: '1', sourceHandle: 'main-handle', target: '2', targetHandle: 'target-handle', type: 'smoothstep' },
      { id: 'e2-3', source: '2', sourceHandle: 'main-handle', target: '3', targetHandle: 'target-handle', type: 'smoothstep' },
      { id: 'e3-4', source: '3', sourceHandle: 'main-handle', target: '4', targetHandle: 'target-handle', type: 'smoothstep' },
      { id: 'e4-5', source: '4', sourceHandle: 'main-handle', target: '5', type: 'smoothstep' },
      { id: 'e5-6r', source: '5', sourceHandle: 'btn-btn_rahul', target: '6_rahul', type: 'smoothstep' },
      { id: 'e6r-7r', source: '6_rahul', sourceHandle: 'main-handle', target: '7_rahul', type: 'smoothstep' },
      { id: 'e5-6a', source: '5', sourceHandle: 'btn-btn_anil', target: '6_anil', type: 'smoothstep' },
      { id: 'e6a-7a', source: '6_anil', sourceHandle: 'main-handle', target: '7_anil', type: 'smoothstep' },
      { id: 'e5-6s', source: '5', sourceHandle: 'btn-btn_sunil', target: '6_sunil', type: 'smoothstep' },
      { id: 'e6s-7s', source: '6_sunil', sourceHandle: 'main-handle', target: '7_sunil', type: 'smoothstep' }
    ]
  },

  // 2. Clinic Appointment Booking
  clinic_appointment: {
    name: 'Clinic Appointment Booking',
    nodes: [
      {
        id: '1', type: 'triggerNode', position: { x: 50, y: 250 },
        data: { label: 'Step 1: Appointment Request', triggerType: 'keyword', keyword: 'appointment' }
      },
      {
        id: '2', type: 'inputNode', position: { x: 380, y: 250 },
        data: { 
          label: 'Step 2: Patient Name', 
          text: '🩺 Welcome to our clinic! Please share the Patient Full Name:',
          question: '🩺 Welcome to our clinic! Please share the Patient Full Name:',
          validationType: 'name', 
          variableName: 'patient_name' 
        }
      },
      {
        id: '3', type: 'inputNode', position: { x: 710, y: 250 },
        data: { 
          label: 'Step 3: Age & Gender', 
          text: 'Please mention the patient age and gender (e.g. 32 Male):',
          question: 'Please mention the patient age and gender (e.g. 32 Male):',
          validationType: 'text', 
          variableName: 'patient_demographics' 
        }
      },
      {
        id: '4', type: 'inputNode', position: { x: 1040, y: 250 },
        data: { 
          label: 'Step 4: Preferred Date & Time', 
          text: 'What is your preferred appointment date and time slot? (e.g. Tomorrow 11:30 AM):',
          question: 'What is your preferred appointment date and time slot? (e.g. Tomorrow 11:30 AM):',
          validationType: 'appointment', 
          variableName: 'preferred_slot' 
        }
      },
      {
        id: '5', type: 'actionNode', position: { x: 1370, y: 250 },
        data: { 
          label: 'Alert Clinic Helpdesk', 
          actionType: 'notify_whatsapp',
          recipientPhone: '+919876543201',
          notificationMessage: '🩺 *NEW CLINIC BOOKING*\n\nPatient: {{patient_name}}\nDetails: {{patient_demographics}}\nSlot: {{preferred_slot}}\nPhone: +{{contact.phone}}'
        }
      },
      {
        id: '6', type: 'messageNode', position: { x: 1700, y: 250 },
        data: { 
          label: 'Confirmation Message', 
          messageType: 'text',
          text: '✅ Thank you *{{patient_name}}*!\n\nYour appointment request for *{{preferred_slot}}* has been received. Our clinic receptionist will send your token confirmation shortly.'
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: '1', sourceHandle: 'main-handle', target: '2', targetHandle: 'target-handle', type: 'smoothstep' },
      { id: 'e2-3', source: '2', sourceHandle: 'main-handle', target: '3', targetHandle: 'target-handle', type: 'smoothstep' },
      { id: 'e3-4', source: '3', sourceHandle: 'main-handle', target: '4', targetHandle: 'target-handle', type: 'smoothstep' },
      { id: 'e4-5', source: '4', sourceHandle: 'main-handle', target: '5', type: 'smoothstep' },
      { id: 'e5-6', source: '5', sourceHandle: 'main-handle', target: '6', type: 'smoothstep' }
    ]
  },

  // 3. Hotel Check-In & Room Service (QR)
  hotel_checkin: {
    name: 'Hotel Check-In & Room Service',
    nodes: [
      {
        id: '1', type: 'triggerNode', position: { x: 50, y: 300 },
        data: { label: 'Step 1: Scan Room QR', triggerType: 'qr_link', keyword: 'Checkin' }
      },
      {
        id: '2', type: 'inputNode', position: { x: 380, y: 300 },
        data: { 
          label: 'Step 2: Room Number', 
          text: '🏨 Welcome to Grand Palace Hotel! Please enter your Room Number (e.g. 402):',
          question: '🏨 Welcome to Grand Palace Hotel! Please enter your Room Number (e.g. 402):',
          validationType: 'number', 
          variableName: 'room_number' 
        }
      },
      {
        id: '3', type: 'inputNode', position: { x: 710, y: 300 },
        data: { 
          label: 'Step 3: Guest Name', 
          text: 'Thank you! Please share Primary Guest Full Name:',
          question: 'Thank you! Please share Primary Guest Full Name:',
          validationType: 'name', 
          variableName: 'guest_name' 
        }
      },
      {
        id: '4', type: 'messageNode', position: { x: 1040, y: 300 },
        data: { 
          label: 'Step 4: Select Service', 
          messageType: 'interactive',
          text: 'Welcome {{guest_name}} (Room {{room_number}})! How may we assist you today?',
          buttons: [
            { id: 'btn_room_service', title: 'Room Service', text: 'Room Service' },
            { id: 'btn_housekeeping', title: 'Housekeeping', text: 'Housekeeping' },
            { id: 'btn_front_desk', title: 'Front Desk', text: 'Front Desk' }
          ]
        }
      },
      {
        id: '5_rs', type: 'actionNode', position: { x: 1400, y: 120 },
        data: { 
          label: 'Alert Kitchen & Pantry', 
          actionType: 'notify_whatsapp',
          recipientPhone: '+919876543202',
          notificationMessage: '🍽️ *ROOM SERVICE REQUEST*\n\nRoom: {{room_number}}\nGuest: {{guest_name}}\nPhone: +{{contact.phone}}'
        }
      },
      {
        id: '6_rs', type: 'messageNode', position: { x: 1740, y: 120 },
        data: { 
          label: 'Menu Link Sent', 
          messageType: 'text',
          text: '🍽️ Room Service staff has been alerted for Room {{room_number}}! Our digital in-room menu: https://hotel.com/menu. An attendant is on the way.'
        }
      },
      {
        id: '5_hk', type: 'actionNode', position: { x: 1400, y: 300 },
        data: { 
          label: 'Alert Housekeeping Staff', 
          actionType: 'notify_whatsapp',
          recipientPhone: '+919876543203',
          notificationMessage: '🧹 *HOUSEKEEPING ALERT*\n\nRoom: {{room_number}}\nGuest: {{guest_name}}\nRequest: Towels / Cleaning'
        }
      },
      {
        id: '6_hk', type: 'messageNode', position: { x: 1740, y: 300 },
        data: { 
          label: 'Housekeeping Confirmed', 
          messageType: 'text',
          text: '🧹 Housekeeping request received for Room {{room_number}}! An attendant will arrive within 10 minutes.'
        }
      },
      {
        id: '5_fd', type: 'actionNode', position: { x: 1400, y: 480 },
        data: { 
          label: 'Alert Front Desk Manager', 
          actionType: 'notify_whatsapp',
          recipientPhone: '+919876543204',
          notificationMessage: '🛎️ *FRONT DESK ASSISTANCE*\n\nRoom: {{room_number}}\nGuest: {{guest_name}}\nPhone: +{{contact.phone}}'
        }
      },
      {
        id: '6_fd', type: 'messageNode', position: { x: 1740, y: 480 },
        data: { 
          label: 'Front Desk Connecting', 
          messageType: 'text',
          text: '🛎️ Front Desk Manager has been notified for Room {{room_number}}. We will connect with you immediately.'
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: '1', sourceHandle: 'main-handle', target: '2', targetHandle: 'target-handle', type: 'smoothstep' },
      { id: 'e2-3', source: '2', sourceHandle: 'main-handle', target: '3', targetHandle: 'target-handle', type: 'smoothstep' },
      { id: 'e3-4', source: '3', sourceHandle: 'main-handle', target: '4', type: 'smoothstep' },
      { id: 'e4-5rs', source: '4', sourceHandle: 'btn-btn_room_service', target: '5_rs', type: 'smoothstep' },
      { id: 'e5rs-6rs', source: '5_rs', sourceHandle: 'main-handle', target: '6_rs', type: 'smoothstep' },
      { id: 'e4-5hk', source: '4', sourceHandle: 'btn-btn_housekeeping', target: '5_hk', type: 'smoothstep' },
      { id: 'e5hk-6hk', source: '5_hk', sourceHandle: 'main-handle', target: '6_hk', type: 'smoothstep' },
      { id: 'e4-5fd', source: '4', sourceHandle: 'btn-btn_front_desk', target: '5_fd', type: 'smoothstep' },
      { id: 'e5fd-6fd', source: '5_fd', sourceHandle: 'main-handle', target: '6_fd', type: 'smoothstep' }
    ]
  },

  // 4. Restaurant Table Ordering (QR)
  restaurant_order: {
    name: 'Restaurant Table Ordering',
    nodes: [
      {
        id: '1', type: 'triggerNode', position: { x: 50, y: 300 },
        data: { label: 'Step 1: Scan Table QR', triggerType: 'qr_link', keyword: 'Menu' }
      },
      {
        id: '2', type: 'inputNode', position: { x: 380, y: 300 },
        data: { 
          label: 'Step 2: Table Number', 
          text: '🍽️ Welcome! Please enter your Table Number (e.g. T-12):',
          question: '🍽️ Welcome! Please enter your Table Number (e.g. T-12):',
          validationType: 'text', 
          variableName: 'table_no' 
        }
      },
      {
        id: '3', type: 'inputNode', position: { x: 710, y: 300 },
        data: { 
          label: 'Step 3: Customer Name', 
          text: 'Please share your Name to personalize your order:',
          question: 'Please share your Name to personalize your order:',
          validationType: 'name', 
          variableName: 'customer_name' 
        }
      },
      {
        id: '4', type: 'messageNode', position: { x: 1040, y: 300 },
        data: { 
          label: 'Step 4: Select Order Type', 
          messageType: 'interactive',
          text: 'Hello {{customer_name}} (Table {{table_no}})! What would you like to order today?',
          buttons: [
            { id: 'btn_starters', title: 'Starters & Drinks', text: 'Starters & Drinks' },
            { id: 'btn_main', title: 'Main Course', text: 'Main Course' },
            { id: 'btn_waiter', title: 'Call Waiter', text: 'Call Waiter' }
          ]
        }
      },
      {
        id: '5_waiter', type: 'actionNode', position: { x: 1400, y: 450 },
        data: { 
          label: 'Alert Floor Captain', 
          actionType: 'notify_whatsapp',
          recipientPhone: '+919876543205',
          notificationMessage: '🔔 *WAITER CALLED*\n\nTable: {{table_no}}\nCustomer: {{customer_name}}\nPhone: +{{contact.phone}}'
        }
      },
      {
        id: '6_waiter', type: 'messageNode', position: { x: 1740, y: 450 },
        data: { 
          label: 'Waiter Notified', 
          messageType: 'text',
          text: '🔔 Floor captain alerted for Table {{table_no}}! A waiter will attend to you in 60 seconds.'
        }
      },
      {
        id: '5_order', type: 'inputNode', position: { x: 1400, y: 200 },
        data: { 
          label: 'Enter Order Items', 
          text: 'Please reply with the items and quantity (e.g. 2 Paneer Tikka, 1 Mojito):',
          question: 'Please reply with the items and quantity (e.g. 2 Paneer Tikka, 1 Mojito):',
          validationType: 'text', 
          variableName: 'order_items' 
        }
      },
      {
        id: '6_kot', type: 'actionNode', position: { x: 1740, y: 200 },
        data: { 
          label: 'Send KOT to Kitchen', 
          actionType: 'notify_whatsapp',
          recipientPhone: '+919876543206',
          notificationMessage: '🍳 *NEW KITCHEN ORDER (KOT)*\n\nTable: {{table_no}}\nCustomer: {{customer_name}}\nItems: {{order_items}}'
        }
      },
      {
        id: '7_kot', type: 'messageNode', position: { x: 2080, y: 200 },
        data: { 
          label: 'Order Confirmed', 
          messageType: 'text',
          text: '✅ Order placed for Table {{table_no}}!\n\nItems: {{order_items}}\n\nYour fresh dishes are now being prepared by our chef.'
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: '1', sourceHandle: 'main-handle', target: '2', targetHandle: 'target-handle', type: 'smoothstep' },
      { id: 'e2-3', source: '2', sourceHandle: 'main-handle', target: '3', targetHandle: 'target-handle', type: 'smoothstep' },
      { id: 'e3-4', source: '3', sourceHandle: 'main-handle', target: '4', type: 'smoothstep' },
      { id: 'e4-5w', source: '4', sourceHandle: 'btn-btn_waiter', target: '5_waiter', type: 'smoothstep' },
      { id: 'e5w-6w', source: '5_waiter', sourceHandle: 'main-handle', target: '6_waiter', type: 'smoothstep' },
      { id: 'e4-5s', source: '4', sourceHandle: 'btn-btn_starters', target: '5_order', type: 'smoothstep' },
      { id: 'e4-5m', source: '4', sourceHandle: 'btn-btn_main', target: '5_order', type: 'smoothstep' },
      { id: 'e5o-6k', source: '5_order', sourceHandle: 'main-handle', target: '6_kot', type: 'smoothstep' },
      { id: 'e6k-7k', source: '6_kot', sourceHandle: 'main-handle', target: '7_kot', type: 'smoothstep' }
    ]
  },

  // 5. College Admission Enquiry
  college_admission: {
    name: 'College Admission Enquiry',
    nodes: [
      {
        id: '1', type: 'triggerNode', position: { x: 50, y: 250 },
        data: { label: 'Step 1: Admission Enquiry', triggerType: 'keyword', keyword: 'admission' }
      },
      {
        id: '2', type: 'inputNode', position: { x: 380, y: 250 },
        data: { 
          label: 'Step 2: Student Name', 
          text: '🎓 Welcome to University Admissions! Please share Student Full Name:',
          question: '🎓 Welcome to University Admissions! Please share Student Full Name:',
          validationType: 'name', 
          variableName: 'student_name' 
        }
      },
      {
        id: '3', type: 'inputNode', position: { x: 710, y: 250 },
        data: { 
          label: 'Step 3: Course of Interest', 
          text: 'Which course are you interested in? (e.g. B.Tech CS, MBA, BCA, BBA):',
          question: 'Which course are you interested in? (e.g. B.Tech CS, MBA, BCA, BBA):',
          validationType: 'text', 
          variableName: 'target_course' 
        }
      },
      {
        id: '4', type: 'inputNode', position: { x: 1040, y: 250 },
        data: { 
          label: 'Step 4: Academic Score', 
          text: 'What was your 12th / Graduation percentage or CGPA? (e.g. 84%):',
          question: 'What was your 12th / Graduation percentage or CGPA? (e.g. 84%):',
          validationType: 'text', 
          variableName: 'academic_score' 
        }
      },
      {
        id: '5', type: 'actionNode', position: { x: 1370, y: 250 },
        data: { 
          label: 'Alert Admission Counselor', 
          actionType: 'notify_whatsapp',
          recipientPhone: '+919876543207',
          notificationMessage: '🎓 *NEW ADMISSION LEAD*\n\nStudent: {{student_name}}\nCourse: {{target_course}}\nScore: {{academic_score}}\nPhone: +{{contact.phone}}'
        }
      },
      {
        id: '6', type: 'messageNode', position: { x: 1700, y: 250 },
        data: { 
          label: 'Brochure & Counselor Info', 
          messageType: 'text',
          text: '🎓 Thank you *{{student_name}}*!\n\nYour profile has been matched for *{{target_course}}*. An academic counselor will call you within 2 business hours with scholarship options and syllabus details.'
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: '1', sourceHandle: 'main-handle', target: '2', targetHandle: 'target-handle', type: 'smoothstep' },
      { id: 'e2-3', source: '2', sourceHandle: 'main-handle', target: '3', targetHandle: 'target-handle', type: 'smoothstep' },
      { id: 'e3-4', source: '3', sourceHandle: 'main-handle', target: '4', targetHandle: 'target-handle', type: 'smoothstep' },
      { id: 'e4-5', source: '4', sourceHandle: 'main-handle', target: '5', type: 'smoothstep' },
      { id: 'e5-6', source: '5', sourceHandle: 'main-handle', target: '6', type: 'smoothstep' }
    ]
  },

  // 6. School Fee Reminder & Enquiry
  school_fee: {
    name: 'School Fee Reminder & Enquiry',
    nodes: [
      {
        id: '1', type: 'triggerNode', position: { x: 50, y: 250 },
        data: { label: 'Step 1: Fee Enquiry', triggerType: 'keyword', keyword: 'fee' }
      },
      {
        id: '2', type: 'inputNode', position: { x: 380, y: 250 },
        data: { 
          label: 'Step 2: Roll Number', 
          text: '📚 Welcome to School Accounts Helpdesk! Please enter Student Roll / Admission No (e.g. 2024-A14):',
          question: '📚 Welcome to School Accounts Helpdesk! Please enter Student Roll / Admission No (e.g. 2024-A14):',
          validationType: 'text', 
          variableName: 'roll_no' 
        }
      },
      {
        id: '3', type: 'inputNode', position: { x: 710, y: 250 },
        data: { 
          label: 'Step 3: Parent Name', 
          text: 'Please share Parent / Guardian Full Name:',
          question: 'Please share Parent / Guardian Full Name:',
          validationType: 'name', 
          variableName: 'parent_name' 
        }
      },
      {
        id: '4', type: 'messageNode', position: { x: 1040, y: 250 },
        data: { 
          label: 'Step 4: Select Service', 
          messageType: 'interactive',
          text: 'Hello {{parent_name}}! What fee details are you looking for?',
          buttons: [
            { id: 'btn_due', title: 'Check Due Amount', text: 'Check Due Amount' },
            { id: 'btn_link', title: 'Online Pay Link', text: 'Online Pay Link' },
            { id: 'btn_talk', title: 'Accounts Officer', text: 'Accounts Officer' }
          ]
        }
      },
      {
        id: '5_due', type: 'messageNode', position: { x: 1400, y: 120 },
        data: { 
          label: 'Due Amount Details', 
          messageType: 'text',
          text: '📄 Current Term Fee for Roll No {{roll_no}} is ₹18,500. Due date is the 10th of next month.'
        }
      },
      {
        id: '5_link', type: 'messageNode', position: { x: 1400, y: 280 },
        data: { 
          label: 'Payment Gateway Link', 
          messageType: 'text',
          text: '💳 Instant fee payment portal (UPI / NetBanking): https://school.edu/pay?roll={{roll_no}}'
        }
      },
      {
        id: '5_talk', type: 'actionNode', position: { x: 1400, y: 440 },
        data: { 
          label: 'Alert Accounts Team', 
          actionType: 'notify_whatsapp',
          recipientPhone: '+919876543208',
          notificationMessage: '💼 *FEE CALL REQUEST*\n\nRoll No: {{roll_no}}\nParent: {{parent_name}}\nPhone: +{{contact.phone}}'
        }
      },
      {
        id: '6_talk', type: 'messageNode', position: { x: 1740, y: 440 },
        data: { 
          label: 'Accounts Call Confirmation', 
          messageType: 'text',
          text: '📞 Our Accounts Officer has been notified. They will call you between 10 AM - 3 PM.'
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: '1', sourceHandle: 'main-handle', target: '2', targetHandle: 'target-handle', type: 'smoothstep' },
      { id: 'e2-3', source: '2', sourceHandle: 'main-handle', target: '3', targetHandle: 'target-handle', type: 'smoothstep' },
      { id: 'e3-4', source: '3', sourceHandle: 'main-handle', target: '4', type: 'smoothstep' },
      { id: 'e4-5d', source: '4', sourceHandle: 'btn-btn_due', target: '5_due', type: 'smoothstep' },
      { id: 'e4-5l', source: '4', sourceHandle: 'btn-btn_link', target: '5_link', type: 'smoothstep' },
      { id: 'e4-5t', source: '4', sourceHandle: 'btn-btn_talk', target: '5_talk', type: 'smoothstep' },
      { id: 'e5t-6t', source: '5_talk', sourceHandle: 'main-handle', target: '6_talk', type: 'smoothstep' }
    ]
  },

  // 7. Order Tracking & Support (E-Commerce)
  ecommerce_order: {
    name: 'Order Tracking & Support',
    nodes: [
      {
        id: '1', type: 'triggerNode', position: { x: 50, y: 250 },
        data: { label: 'Step 1: Track Order', triggerType: 'keyword', keyword: 'track' }
      },
      {
        id: '2', type: 'inputNode', position: { x: 380, y: 250 },
        data: { 
          label: 'Step 2: Ask Order ID', 
          text: '📦 Hello! Please share your Order ID (e.g. #ORD-8823):',
          question: '📦 Hello! Please share your Order ID (e.g. #ORD-8823):',
          validationType: 'text', 
          variableName: 'order_id' 
        }
      },
      {
        id: '3', type: 'messageNode', position: { x: 710, y: 250 },
        data: { 
          label: 'Step 3: Tracking Actions', 
          messageType: 'interactive',
          text: 'Order *{{order_id}}* located! What would you like to check?',
          buttons: [
            { id: 'btn_status', title: 'Live Status', text: 'Live Status' },
            { id: 'btn_agent', title: 'Live Support', text: 'Live Support' }
          ]
        }
      },
      {
        id: '4_status', type: 'messageNode', position: { x: 1040, y: 150 },
        data: { 
          label: 'Live Delivery Status', 
          messageType: 'text',
          text: '🚚 *Order {{order_id}} Status:* Out for Delivery with Courier partner.\nEstimated arrival: Today by 6:00 PM.'
        }
      },
      {
        id: '4_agent', type: 'actionNode', position: { x: 1040, y: 380 },
        data: { 
          label: 'Assign to Support Agent', 
          actionType: 'notify_whatsapp',
          recipientPhone: '+919876543209',
          notificationMessage: '🎧 *CUSTOMER SUPPORT TICKET*\n\nOrder: {{order_id}}\nPhone: +{{contact.phone}}'
        }
      },
      {
        id: '5_agent', type: 'messageNode', position: { x: 1370, y: 380 },
        data: { 
          label: 'Agent Connecting', 
          messageType: 'text',
          text: '🎧 A customer support executive has been assigned to your ticket for Order {{order_id}}. You will receive a response shortly.'
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: '1', sourceHandle: 'main-handle', target: '2', targetHandle: 'target-handle', type: 'smoothstep' },
      { id: 'e2-3', source: '2', sourceHandle: 'main-handle', target: '3', type: 'smoothstep' },
      { id: 'e3-4s', source: '3', sourceHandle: 'btn-btn_status', target: '4_status', type: 'smoothstep' },
      { id: 'e3-4a', source: '3', sourceHandle: 'btn-btn_agent', target: '4_agent', type: 'smoothstep' },
      { id: 'e4a-5a', source: '4_agent', sourceHandle: 'main-handle', target: '5_agent', type: 'smoothstep' }
    ]
  },

  // 8. Return & Refund Request (E-Commerce)
  ecommerce_return: {
    name: 'Return & Refund Request',
    nodes: [
      {
        id: '1', type: 'triggerNode', position: { x: 50, y: 250 },
        data: { label: 'Step 1: Return Keyword', triggerType: 'keyword', keyword: 'return' }
      },
      {
        id: '2', type: 'inputNode', position: { x: 380, y: 250 },
        data: { 
          label: 'Step 2: Order ID', 
          text: '🔄 We are sorry the product did not work out! Please share your Order ID (e.g. #ORD-5541):',
          question: '🔄 We are sorry the product did not work out! Please share your Order ID (e.g. #ORD-5541):',
          validationType: 'text', 
          variableName: 'order_id' 
        }
      },
      {
        id: '3', type: 'inputNode', position: { x: 710, y: 250 },
        data: { 
          label: 'Step 3: Return Reason', 
          text: 'Please mention the reason for return (e.g. Size Too Small / Damaged / Defective):',
          question: 'Please mention the reason for return (e.g. Size Too Small / Damaged / Defective):',
          validationType: 'text', 
          variableName: 'return_reason' 
        }
      },
      {
        id: '4', type: 'actionNode', position: { x: 1040, y: 250 },
        data: { 
          label: 'Alert Warehouse Team', 
          actionType: 'notify_whatsapp',
          recipientPhone: '+919876543210',
          notificationMessage: '🔄 *NEW RETURN REQUEST*\n\nOrder: {{order_id}}\nReason: {{return_reason}}\nCustomer Phone: +{{contact.phone}}'
        }
      },
      {
        id: '5', type: 'messageNode', position: { x: 1370, y: 250 },
        data: { 
          label: 'Return Confirmation', 
          messageType: 'text',
          text: '✅ Return request approved for Order *{{order_id}}*!\n\nPickup courier will arrive at your address within 48 business hours. Refund will be credited within 24 hours of pickup.'
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: '1', sourceHandle: 'main-handle', target: '2', targetHandle: 'target-handle', type: 'smoothstep' },
      { id: 'e2-3', source: '2', sourceHandle: 'main-handle', target: '3', targetHandle: 'target-handle', type: 'smoothstep' },
      { id: 'e3-4', source: '3', sourceHandle: 'main-handle', target: '4', type: 'smoothstep' },
      { id: 'e4-5', source: '4', sourceHandle: 'main-handle', target: '5', type: 'smoothstep' }
    ]
  },

  // 9. Property Enquiry & Site Visit (Real Estate)
  realestate_lead: {
    name: 'Property Enquiry & Site Visit',
    nodes: [
      {
        id: '1', type: 'triggerNode', position: { x: 50, y: 300 },
        data: { label: 'Step 1: Property QR / Ad', triggerType: 'qr_link', keyword: 'Property' }
      },
      {
        id: '2', type: 'inputNode', position: { x: 380, y: 300 },
        data: { 
          label: 'Step 2: Buyer Name', 
          text: '🏡 Welcome to Skyview Heights! Please enter your Full Name:',
          question: '🏡 Welcome to Skyview Heights! Please enter your Full Name:',
          validationType: 'name', 
          variableName: 'buyer_name' 
        }
      },
      {
        id: '3', type: 'inputNode', position: { x: 710, y: 300 },
        data: { 
          label: 'Step 3: Budget Range', 
          text: 'What is your approximate budget range? (e.g. ₹60L - ₹1.2 Cr):',
          question: 'What is your approximate budget range? (e.g. ₹60L - ₹1.2 Cr):',
          validationType: 'text', 
          variableName: 'budget' 
        }
      },
      {
        id: '4', type: 'messageNode', position: { x: 1040, y: 300 },
        data: { 
          label: 'Step 4: Property Category', 
          messageType: 'interactive',
          text: 'Thank you {{buyer_name}}! Which configuration are you most interested in?',
          buttons: [
            { id: 'btn_2bhk', title: '2 BHK Luxury', text: '2 BHK Luxury' },
            { id: 'btn_3bhk', title: '3 BHK Premium', text: '3 BHK Premium' },
            { id: 'btn_villa', title: 'Exclusive Villa', text: 'Exclusive Villa' }
          ]
        }
      },
      {
        id: '5_agent', type: 'actionNode', position: { x: 1400, y: 300 },
        data: { 
          label: 'Alert Real Estate Agent', 
          actionType: 'notify_whatsapp',
          recipientPhone: '+919876543211',
          notificationMessage: '🏡 *HOT REAL ESTATE LEAD*\n\nBuyer: {{buyer_name}}\nBudget: {{budget}}\nPhone: +{{contact.phone}}'
        }
      },
      {
        id: '6_brochure', type: 'messageNode', position: { x: 1740, y: 300 },
        data: { 
          label: 'Brochure & Site Visit Link', 
          messageType: 'text',
          text: '🏡 Download our Digital Brochure & Floor Plans: https://realestate.com/skyview-brochure.pdf\n\nOur property consultant will connect with you to book a complimentary VIP site visit.'
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: '1', sourceHandle: 'main-handle', target: '2', targetHandle: 'target-handle', type: 'smoothstep' },
      { id: 'e2-3', source: '2', sourceHandle: 'main-handle', target: '3', targetHandle: 'target-handle', type: 'smoothstep' },
      { id: 'e3-4', source: '3', sourceHandle: 'main-handle', target: '4', type: 'smoothstep' },
      { id: 'e4-5a', source: '4', sourceHandle: 'btn-btn_2bhk', target: '5_agent', type: 'smoothstep' },
      { id: 'e4-5b', source: '4', sourceHandle: 'btn-btn_3bhk', target: '5_agent', type: 'smoothstep' },
      { id: 'e4-5v', source: '4', sourceHandle: 'btn-btn_villa', target: '5_agent', type: 'smoothstep' },
      { id: 'e5a-6b', source: '5_agent', sourceHandle: 'main-handle', target: '6_brochure', type: 'smoothstep' }
    ]
  },

  // 10. Gym Membership & Trial Class (Fitness)
  gym_membership: {
    name: 'Gym Membership & Trial Class',
    nodes: [
      {
        id: '1', type: 'triggerNode', position: { x: 50, y: 250 },
        data: { label: 'Step 1: Scan Gym QR', triggerType: 'qr_link', keyword: 'Join' }
      },
      {
        id: '2', type: 'inputNode', position: { x: 380, y: 250 },
        data: { 
          label: 'Step 2: Member Name', 
          text: '💪 Welcome to IronFit Gym! Please enter your Full Name:',
          question: '💪 Welcome to IronFit Gym! Please enter your Full Name:',
          validationType: 'name', 
          variableName: 'member_name' 
        }
      },
      {
        id: '3', type: 'inputNode', position: { x: 710, y: 250 },
        data: { 
          label: 'Step 3: Fitness Goal', 
          text: 'What is your primary fitness goal? (e.g. Weight Loss / Muscle Building / CrossFit):',
          question: 'What is your primary fitness goal? (e.g. Weight Loss / Muscle Building / CrossFit):',
          validationType: 'text', 
          variableName: 'fitness_goal' 
        }
      },
      {
        id: '4', type: 'actionNode', position: { x: 1040, y: 250 },
        data: { 
          label: 'Alert Head Trainer', 
          actionType: 'notify_whatsapp',
          recipientPhone: '+919876543212',
          notificationMessage: '🏋️ *NEW GYM TRIAL PASS*\n\nMember: {{member_name}}\nGoal: {{fitness_goal}}\nPhone: +{{contact.phone}}'
        }
      },
      {
        id: '5', type: 'messageNode', position: { x: 1370, y: 250 },
        data: { 
          label: 'Trial Pass Activated', 
          messageType: 'text',
          text: '🎉 Welcome *{{member_name}}*!\n\nYour *FREE 1-Day VIP Trial Pass* is now active! Visit our center anytime between 6:00 AM - 10:00 PM. Show this message at the front desk for immediate entry.'
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: '1', sourceHandle: 'main-handle', target: '2', targetHandle: 'target-handle', type: 'smoothstep' },
      { id: 'e2-3', source: '2', sourceHandle: 'main-handle', target: '3', targetHandle: 'target-handle', type: 'smoothstep' },
      { id: 'e3-4', source: '3', sourceHandle: 'main-handle', target: '4', type: 'smoothstep' },
      { id: 'e4-5', source: '4', sourceHandle: 'main-handle', target: '5', type: 'smoothstep' }
    ]
  },

  // 11. Car Service Appointment (Automobile)
  car_service: {
    name: 'Car Service Appointment',
    nodes: [
      {
        id: '1', type: 'triggerNode', position: { x: 50, y: 250 },
        data: { label: 'Step 1: Service Keyword', triggerType: 'keyword', keyword: 'service' }
      },
      {
        id: '2', type: 'inputNode', position: { x: 380, y: 250 },
        data: { 
          label: 'Step 2: Vehicle Number', 
          text: '🚗 Welcome to AutoCare Service! Please share Vehicle Reg. Number (e.g. MH-02-CD-4512):',
          question: '🚗 Welcome to AutoCare Service! Please share Vehicle Reg. Number (e.g. MH-02-CD-4512):',
          validationType: 'text', 
          variableName: 'vehicle_no' 
        }
      },
      {
        id: '3', type: 'inputNode', position: { x: 710, y: 250 },
        data: { 
          label: 'Step 3: Service Requirement', 
          text: 'What service is required? (e.g. Periodic Service, AC Cooling, Brake Issue, Denting/Painting):',
          question: 'What service is required? (e.g. Periodic Service, AC Cooling, Brake Issue, Denting/Painting):',
          validationType: 'text', 
          variableName: 'service_type' 
        }
      },
      {
        id: '4', type: 'actionNode', position: { x: 1040, y: 250 },
        data: { 
          label: 'Alert Workshop Manager', 
          actionType: 'notify_whatsapp',
          recipientPhone: '+919876543213',
          notificationMessage: '🚗 *NEW CAR SERVICE BOOKING*\n\nVehicle: {{vehicle_no}}\nIssue: {{service_type}}\nCustomer: +{{contact.phone}}'
        }
      },
      {
        id: '5', type: 'messageNode', position: { x: 1370, y: 250 },
        data: { 
          label: 'Booking Confirmed', 
          messageType: 'text',
          text: '✅ Service slot confirmed for *{{vehicle_no}}*!\n\nOur workshop supervisor will call you in 15 minutes to arrange free doorstep pickup or confirm your arrival slot.'
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: '1', sourceHandle: 'main-handle', target: '2', targetHandle: 'target-handle', type: 'smoothstep' },
      { id: 'e2-3', source: '2', sourceHandle: 'main-handle', target: '3', targetHandle: 'target-handle', type: 'smoothstep' },
      { id: 'e3-4', source: '3', sourceHandle: 'main-handle', target: '4', type: 'smoothstep' },
      { id: 'e4-5', source: '4', sourceHandle: 'main-handle', target: '5', type: 'smoothstep' }
    ]
  },

  // 12. HR Leave Request Automation (Corporate)
  hr_leave: {
    name: 'HR Leave Request Automation',
    nodes: [
      {
        id: '1', type: 'triggerNode', position: { x: 50, y: 250 },
        data: { label: 'Step 1: Leave Request', triggerType: 'keyword', keyword: 'leave' }
      },
      {
        id: '2', type: 'inputNode', position: { x: 380, y: 250 },
        data: { 
          label: 'Step 2: Employee ID & Name', 
          text: '📋 HR Leave Portal: Please enter your Employee Name and ID (e.g. Rohit Sharma - EMP401):',
          question: '📋 HR Leave Portal: Please enter your Employee Name and ID (e.g. Rohit Sharma - EMP401):',
          validationType: 'text', 
          variableName: 'emp_details' 
        }
      },
      {
        id: '3', type: 'inputNode', position: { x: 710, y: 250 },
        data: { 
          label: 'Step 3: Leave Dates & Reason', 
          text: 'Please share Start Date, End Date, and Reason (e.g. 15 Oct to 18 Oct, Family function):',
          question: 'Please share Start Date, End Date, and Reason (e.g. 15 Oct to 18 Oct, Family function):',
          validationType: 'text', 
          variableName: 'leave_info' 
        }
      },
      {
        id: '4', type: 'actionNode', position: { x: 1040, y: 250 },
        data: { 
          label: 'Alert HR Manager', 
          actionType: 'notify_whatsapp',
          recipientPhone: '+919876543214',
          notificationMessage: '📋 *EMPLOYEE LEAVE REQUEST*\n\nEmployee: {{emp_details}}\nDates/Reason: {{leave_info}}\nPhone: +{{contact.phone}}'
        }
      },
      {
        id: '5', type: 'messageNode', position: { x: 1370, y: 250 },
        data: { 
          label: 'Submission Acknowledgment', 
          messageType: 'text',
          text: '✅ Your leave request has been logged and sent to your Reporting Manager and HR department for review.'
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: '1', sourceHandle: 'main-handle', target: '2', targetHandle: 'target-handle', type: 'smoothstep' },
      { id: 'e2-3', source: '2', sourceHandle: 'main-handle', target: '3', targetHandle: 'target-handle', type: 'smoothstep' },
      { id: 'e3-4', source: '3', sourceHandle: 'main-handle', target: '4', type: 'smoothstep' },
      { id: 'e4-5', source: '4', sourceHandle: 'main-handle', target: '5', type: 'smoothstep' }
    ]
  },

  // 13. Office Visitor Management (QR Lobby)
  corporate_visitor: {
    name: 'Office Visitor Management',
    nodes: [
      {
        id: '1', type: 'triggerNode', position: { x: 50, y: 250 },
        data: { label: 'Step 1: Scan Lobby QR', triggerType: 'qr_link', keyword: 'Visit' }
      },
      {
        id: '2', type: 'inputNode', position: { x: 380, y: 250 },
        data: { 
          label: 'Step 2: Visitor Name', 
          text: '🏢 Welcome to CyberTech Towers! Please enter your Full Name:',
          question: '🏢 Welcome to CyberTech Towers! Please enter your Full Name:',
          validationType: 'name', 
          variableName: 'visitor_name' 
        }
      },
      {
        id: '3', type: 'inputNode', position: { x: 710, y: 250 },
        data: { 
          label: 'Step 3: Host Employee Name', 
          text: 'Who are you visiting today? (Host employee name):',
          question: 'Who are you visiting today? (Host employee name):',
          validationType: 'name', 
          variableName: 'host_name' 
        }
      },
      {
        id: '4', type: 'actionNode', position: { x: 1040, y: 250 },
        data: { 
          label: 'Alert Host Employee', 
          actionType: 'notify_whatsapp',
          recipientPhone: '+919876543215',
          notificationMessage: '👋 *GUEST ARRIVED AT LOBBY*\n\nVisitor: {{visitor_name}}\nHost: {{host_name}}\nPhone: +{{contact.phone}}'
        }
      },
      {
        id: '5', type: 'messageNode', position: { x: 1370, y: 250 },
        data: { 
          label: 'Visitor Pass Issued', 
          messageType: 'text',
          text: '🏢 Welcome *{{visitor_name}}*!\n\nWe have sent an alert to *{{host_name}}*. Please collect your Visitor Badge from the reception desk.'
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: '1', sourceHandle: 'main-handle', target: '2', targetHandle: 'target-handle', type: 'smoothstep' },
      { id: 'e2-3', source: '2', sourceHandle: 'main-handle', target: '3', targetHandle: 'target-handle', type: 'smoothstep' },
      { id: 'e3-4', source: '3', sourceHandle: 'main-handle', target: '4', type: 'smoothstep' },
      { id: 'e4-5', source: '4', sourceHandle: 'main-handle', target: '5', type: 'smoothstep' }
    ]
  },

  // 14. Delivery Status & Updates (Logistics)
  logistics_delivery: {
    name: 'Delivery Status & Updates',
    nodes: [
      {
        id: '1', type: 'triggerNode', position: { x: 50, y: 250 },
        data: { label: 'Step 1: Track AWB', triggerType: 'keyword', keyword: 'delivery' }
      },
      {
        id: '2', type: 'inputNode', position: { x: 380, y: 250 },
        data: { 
          label: 'Step 2: AWB Tracking Number', 
          text: '🚚 FastTrack Logistics: Please enter your 10-digit AWB or Tracking No:',
          question: '🚚 FastTrack Logistics: Please enter your 10-digit AWB or Tracking No:',
          validationType: 'text', 
          variableName: 'awb_number' 
        }
      },
      {
        id: '3', type: 'messageNode', position: { x: 710, y: 250 },
        data: { 
          label: 'Live AWB Status', 
          messageType: 'text',
          text: '📍 *Shipment {{awb_number}} Update:*\n\nCurrent Location: Central Hub\nStatus: Out for Delivery with Rider\nExpected Time: Today before 7:00 PM.'
        }
      },
      {
        id: '4', type: 'actionNode', position: { x: 1040, y: 250 },
        data: { 
          label: 'Notify Logistics Dispatch', 
          actionType: 'notify_whatsapp',
          recipientPhone: '+919876543216',
          notificationMessage: '📦 *DELIVERY INQUIRY LOGGED*\n\nAWB: {{awb_number}}\nPhone: +{{contact.phone}}'
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: '1', sourceHandle: 'main-handle', target: '2', targetHandle: 'target-handle', type: 'smoothstep' },
      { id: 'e2-3', source: '2', sourceHandle: 'main-handle', target: '3', type: 'smoothstep' },
      { id: 'e3-4', source: '3', sourceHandle: 'main-handle', target: '4', type: 'smoothstep' }
    ]
  },

  // 15. Customer Feedback Collection (General)
  feedback_collection: {
    name: 'Customer Feedback Collection',
    nodes: [
      {
        id: '1', type: 'triggerNode', position: { x: 50, y: 250 },
        data: { label: 'Step 1: Feedback Trigger', triggerType: 'keyword', keyword: 'feedback' }
      },
      {
        id: '2', type: 'inputNode', position: { x: 380, y: 250 },
        data: { 
          label: 'Step 2: Customer Name', 
          text: '⭐ Thank you for choosing us! Please share your Name:',
          question: '⭐ Thank you for choosing us! Please share your Name:',
          validationType: 'name', 
          variableName: 'customer_name' 
        }
      },
      {
        id: '3', type: 'messageNode', position: { x: 710, y: 250 },
        data: { 
          label: 'Step 3: Rate Experience', 
          messageType: 'interactive',
          text: 'Hi {{customer_name}}, how would you rate your experience today?',
          buttons: [
            { id: 'btn_5star', title: '⭐⭐⭐⭐⭐ 5 Stars', text: '5 Stars' },
            { id: 'btn_3star', title: '⭐⭐⭐ 3 Stars', text: '3 Stars' },
            { id: 'btn_1star', title: '⭐ 1 Star (Need Help)', text: '1 Star' }
          ]
        }
      },
      {
        id: '4_positive', type: 'messageNode', position: { x: 1040, y: 150 },
        data: { 
          label: 'Thank You & Discount', 
          messageType: 'text',
          text: '🎉 Thank you for the wonderful 5-star rating, *{{customer_name}}*! As a token of gratitude, here is a 10% coupon for your next visit: *THANKYOU10*'
        }
      },
      {
        id: '4_negative', type: 'actionNode', position: { x: 1040, y: 380 },
        data: { 
          label: 'Alert Support Manager', 
          actionType: 'notify_whatsapp',
          recipientPhone: '+919876543217',
          notificationMessage: '⚠️ *NEGATIVE CUSTOMER FEEDBACK*\n\nCustomer: {{customer_name}}\nPhone: +{{contact.phone}}'
        }
      },
      {
        id: '5_negative', type: 'messageNode', position: { x: 1370, y: 380 },
        data: { 
          label: 'Manager Apology Note', 
          messageType: 'text',
          text: '🙏 We are deeply sorry your experience was not up to our standard, *{{customer_name}}*. Our manager has been alerted and will personally call you to make this right.'
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: '1', sourceHandle: 'main-handle', target: '2', targetHandle: 'target-handle', type: 'smoothstep' },
      { id: 'e2-3', source: '2', sourceHandle: 'main-handle', target: '3', type: 'smoothstep' },
      { id: 'e3-4p', source: '3', sourceHandle: 'btn-btn_5star', target: '4_positive', type: 'smoothstep' },
      { id: 'e3-4m', source: '3', sourceHandle: 'btn-btn_3star', target: '4_positive', type: 'smoothstep' },
      { id: 'e3-4n', source: '3', sourceHandle: 'btn-btn_1star', target: '4_negative', type: 'smoothstep' },
      { id: 'e4n-5n', source: '4_negative', sourceHandle: 'main-handle', target: '5_negative', type: 'smoothstep' }
    ]
  },

  // 16. Lead Capture & Follow-Up (General)
  lead_capture: {
    name: 'Lead Capture & Follow-Up',
    nodes: [
      {
        id: '1', type: 'triggerNode', position: { x: 50, y: 250 },
        data: { label: 'Step 1: Lead Inquiry', triggerType: 'keyword', keyword: 'info' }
      },
      {
        id: '2', type: 'inputNode', position: { x: 380, y: 250 },
        data: { 
          label: 'Step 2: Prospect Name', 
          text: '👋 Hello! Welcome to our sales desk. What is your Full Name?',
          question: '👋 Hello! Welcome to our sales desk. What is your Full Name?',
          validationType: 'name', 
          variableName: 'lead_name' 
        }
      },
      {
        id: '3', type: 'inputNode', position: { x: 710, y: 250 },
        data: { 
          label: 'Step 3: Requirement Details', 
          text: 'What product or service are you interested in?',
          question: 'What product or service are you interested in?',
          validationType: 'text', 
          variableName: 'lead_requirement' 
        }
      },
      {
        id: '4', type: 'actionNode', position: { x: 1040, y: 250 },
        data: { 
          label: 'Alert Sales Executive', 
          actionType: 'notify_whatsapp',
          recipientPhone: '+919876543218',
          notificationMessage: '💼 *HOT BUSINESS LEAD*\n\nName: {{lead_name}}\nRequirement: {{lead_requirement}}\nPhone: +{{contact.phone}}'
        }
      },
      {
        id: '5', type: 'messageNode', position: { x: 1370, y: 250 },
        data: { 
          label: 'Lead Acknowledgment', 
          messageType: 'text',
          text: '✅ Thank you *{{lead_name}}*! Our solutions consultant has received your inquiry and will connect with you on WhatsApp within 15 minutes.'
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: '1', sourceHandle: 'main-handle', target: '2', targetHandle: 'target-handle', type: 'smoothstep' },
      { id: 'e2-3', source: '2', sourceHandle: 'main-handle', target: '3', targetHandle: 'target-handle', type: 'smoothstep' },
      { id: 'e3-4', source: '3', sourceHandle: 'main-handle', target: '4', type: 'smoothstep' },
      { id: 'e4-5', source: '4', sourceHandle: 'main-handle', target: '5', type: 'smoothstep' }
    ]
  }
};

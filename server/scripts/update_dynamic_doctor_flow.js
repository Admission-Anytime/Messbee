const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');

const BASE_URI = 'mongodb://messbee_db_user:SGMVWdSudmCNwc5n@ac-amx81wh-shard-00-00.gvjfwvw.mongodb.net:27017,ac-amx81wh-shard-00-01.gvjfwvw.mongodb.net:27017,ac-amx81wh-shard-00-02.gvjfwvw.mongodb.net:27017';
const PARAMS = '?ssl=true&replicaSet=atlas-flbx0i-shard-0&authSource=admin';

const FLOW_ID = new mongoose.Types.ObjectId('6acf354a17045ca234727ffb');

function buildCleanEdges() {
  return [
    // Ingestion & Patient Details
    { id: 'e_trigger_patient', source: 'node_trigger', target: 'node_patient_name', sourceHandle: 'main-handle' },
    { id: 'e_name_age', source: 'node_patient_name', target: 'node_patient_age', sourceHandle: 'main-handle' },
    { id: 'e_age_gender', source: 'node_patient_age', target: 'node_patient_gender', sourceHandle: 'main-handle' },
    { id: 'e_gender_male', source: 'node_patient_gender', target: 'node_disease', sourceHandle: 'btn-Male' },
    { id: 'e_gender_female', source: 'node_patient_gender', target: 'node_disease', sourceHandle: 'btn-Female' },
    { id: 'e_gender_other', source: 'node_patient_gender', target: 'node_disease', sourceHandle: 'btn-Other' },
    { id: 'e_gender_btn_male', source: 'node_patient_gender', target: 'node_disease', sourceHandle: 'btn-btn_male' },
    { id: 'e_gender_btn_female', source: 'node_patient_gender', target: 'node_disease', sourceHandle: 'btn-btn_female' },
    { id: 'e_gender_main', source: 'node_patient_gender', target: 'node_disease', sourceHandle: 'main-handle' },
    { id: 'e_disease_history', source: 'node_disease', target: 'node_history', sourceHandle: 'main-handle' },
    { id: 'e_history_datetime', source: 'node_history', target: 'node_datetime', sourceHandle: 'main-handle' },
    { id: 'e_datetime_doctor_list', source: 'node_datetime', target: 'node_doctor_list', sourceHandle: 'main-handle' },

    // Doctor Selection -> Live API Availability Check
    { id: 'e_doc_rajesh_api', source: 'node_doctor_list', target: 'node_api_check_rajesh', sourceHandle: 'row-doc_rajesh' },
    { id: 'e_doc_priya_api', source: 'node_doctor_list', target: 'node_api_check_priya', sourceHandle: 'row-doc_priya' },
    { id: 'e_doc_amit_api', source: 'node_doctor_list', target: 'node_api_check_amit', sourceHandle: 'row-doc_amit' },
    { id: 'e_doc_sneha_api', source: 'node_doctor_list', target: 'node_api_check_sneha', sourceHandle: 'row-doc_sneha' },

    // Live API -> Condition Branch
    { id: 'e_api_check_rajesh', source: 'node_api_check_rajesh', target: 'node_check_rajesh', sourceHandle: 'main-handle' },
    { id: 'e_api_check_priya', source: 'node_api_check_priya', target: 'node_check_priya', sourceHandle: 'main-handle' },
    { id: 'e_api_check_amit', source: 'node_api_check_amit', target: 'node_check_amit', sourceHandle: 'main-handle' },
    { id: 'e_api_check_sneha', source: 'node_api_check_sneha', target: 'node_check_sneha', sourceHandle: 'main-handle' },

    // Condition -> Avail (true) / Alt (false)
    { id: 'e_check_rajesh_true', source: 'node_check_rajesh', target: 'node_avail_rajesh', sourceHandle: 'true' },
    { id: 'e_check_rajesh_false', source: 'node_check_rajesh', target: 'node_alt_rajesh', sourceHandle: 'false' },
    { id: 'e_check_priya_true', source: 'node_check_priya', target: 'node_avail_priya', sourceHandle: 'true' },
    { id: 'e_check_priya_false', source: 'node_check_priya', target: 'node_alt_priya', sourceHandle: 'false' },
    { id: 'e_check_amit_true', source: 'node_check_amit', target: 'node_avail_amit', sourceHandle: 'true' },
    { id: 'e_check_amit_false', source: 'node_check_amit', target: 'node_alt_amit', sourceHandle: 'false' },
    { id: 'e_check_sneha_true', source: 'node_check_sneha', target: 'node_avail_sneha', sourceHandle: 'true' },
    { id: 'e_check_sneha_false', source: 'node_check_sneha', target: 'node_alt_sneha', sourceHandle: 'false' },

    // Avail Node -> Yes: Confirm / No: Open Live Slots List
    { id: 'e_avail_rajesh_yes', source: 'node_avail_rajesh', target: 'node_notify_doctor_and_admin', sourceHandle: 'btn-Yes' },
    { id: 'e_avail_rajesh_no', source: 'node_avail_rajesh', target: 'node_book_rajesh', sourceHandle: 'btn-No' },
    { id: 'e_avail_priya_yes', source: 'node_avail_priya', target: 'node_notify_doctor_and_admin', sourceHandle: 'btn-Yes' },
    { id: 'e_avail_priya_no', source: 'node_avail_priya', target: 'node_book_priya', sourceHandle: 'btn-No' },
    { id: 'e_avail_amit_yes', source: 'node_avail_amit', target: 'node_notify_doctor_and_admin', sourceHandle: 'btn-Yes' },
    { id: 'e_avail_amit_no', source: 'node_avail_amit', target: 'node_book_amit', sourceHandle: 'btn-No' },
    { id: 'e_avail_sneha_yes', source: 'node_avail_sneha', target: 'node_notify_doctor_and_admin', sourceHandle: 'btn-Yes' },
    { id: 'e_avail_sneha_no', source: 'node_avail_sneha', target: 'node_book_sneha', sourceHandle: 'btn-No' },

    // Alt Node -> Yes_Alt: Confirm / No_Alt: Open Live Slots List
    { id: 'e_alt_rajesh_yes', source: 'node_alt_rajesh', target: 'node_notify_doctor_and_admin', sourceHandle: 'btn-Yes_Alt' },
    { id: 'e_alt_rajesh_no', source: 'node_alt_rajesh', target: 'node_book_rajesh', sourceHandle: 'btn-No_Alt' },
    { id: 'e_alt_priya_yes', source: 'node_alt_priya', target: 'node_notify_doctor_and_admin', sourceHandle: 'btn-Yes_Alt' },
    { id: 'e_alt_priya_no', source: 'node_alt_priya', target: 'node_book_priya', sourceHandle: 'btn-No_Alt' },
    { id: 'e_alt_amit_yes', source: 'node_alt_amit', target: 'node_notify_doctor_and_admin', sourceHandle: 'btn-Yes_Alt' },
    { id: 'e_alt_amit_no', source: 'node_alt_amit', target: 'node_book_amit', sourceHandle: 'btn-No_Alt' },
    { id: 'e_alt_sneha_yes', source: 'node_alt_sneha', target: 'node_notify_doctor_and_admin', sourceHandle: 'btn-Yes_Alt' },
    { id: 'e_alt_sneha_no', source: 'node_alt_sneha', target: 'node_book_sneha', sourceHandle: 'btn-No_Alt' },

    // Live Slot Booking Nodes -> Confirm
    { id: 'e_book_rajesh_done', source: 'node_book_rajesh', target: 'node_notify_doctor_and_admin', sourceHandle: 'main-handle' },
    { id: 'e_book_priya_done', source: 'node_book_priya', target: 'node_notify_doctor_and_admin', sourceHandle: 'main-handle' },
    { id: 'e_book_amit_done', source: 'node_book_amit', target: 'node_notify_doctor_and_admin', sourceHandle: 'main-handle' },
    { id: 'e_book_sneha_done', source: 'node_book_sneha', target: 'node_notify_doctor_and_admin', sourceHandle: 'main-handle' },

    // Notify Action -> Final Patient Confirmation Receipt Card
    { id: 'e_notify_patient_conf', source: 'node_notify_doctor_and_admin', target: 'node_patient_confirmation', sourceHandle: 'main-handle' }
  ];
}

async function updateDb(dbName) {
  const uri = `${BASE_URI}/${dbName}${PARAMS}`;
  console.log(`\nConnecting to ${dbName}...`);
  const conn = await mongoose.createConnection(uri).asPromise();
  
  // Find entities in this db
  const entities = await conn.collection('entities').find({}).toArray();
  console.log(`Found ${entities.length} entities in ${dbName}`);
  
  const entityMap = {};
  entities.forEach(e => {
    entityMap[e.identifier] = e._id.toString();
  });
  console.log('Entity Map:', entityMap);

  const rajeshId = entityMap['DR_RAJESH_SHARMA'] || '6ad073cbb9f2a9c5542935ba';
  const priyaId = entityMap['DR_PRIYA_VERMA'] || '6ad073ceb9f2a9c5542935bd';
  const amitId = entityMap['DR_AMIT_PATEL'] || '6ad073d4b9f2a9c5542935c0';
  const snehaId = entityMap['DR_SNEHA_KULKARNI'] || '6ad073e0b9f2a9c5542935c3';

  // Find the flow
  const flow = await conn.collection('automations').findOne({ _id: FLOW_ID });
  if (!flow) {
    console.warn(`Flow ${FLOW_ID} not found in ${dbName}`);
    await conn.close();
    return;
  }

  // Update nodes with dynamic configs and correct entity IDs
  const updatedNodes = flow.nodes.map(node => {
    // 1. API Check Nodes
    if (node.id === 'node_api_check_rajesh') {
      return {
        ...node,
        data: {
          ...node.data,
          endpoint: `/api/entities/${rajeshId}/check-availability`,
          url: `/api/entities/${rajeshId}/check-availability`,
          method: 'POST',
          bodyParams: JSON.stringify({ datetime: '{{preferred_datetime}}' }),
          responseMapping: [
            { responseField: 'is_available', sessionVariable: 'is_slot_available' },
            { responseField: 'confirmed_slot_label', sessionVariable: 'booking_slot_label' },
            { responseField: 'confirmed_date_label', sessionVariable: 'booking_date_label' },
            { responseField: 'alt_slot_label', sessionVariable: 'alt_slot_label' },
            { responseField: 'alt_date_label', sessionVariable: 'alt_date_label' },
            { responseField: 'entity_name', sessionVariable: 'booking_entity_name' }
          ]
        }
      };
    }
    if (node.id === 'node_api_check_priya') {
      return {
        ...node,
        data: {
          ...node.data,
          endpoint: `/api/entities/${priyaId}/check-availability`,
          url: `/api/entities/${priyaId}/check-availability`,
          method: 'POST',
          bodyParams: JSON.stringify({ datetime: '{{preferred_datetime}}' }),
          responseMapping: [
            { responseField: 'is_available', sessionVariable: 'is_slot_available' },
            { responseField: 'confirmed_slot_label', sessionVariable: 'booking_slot_label' },
            { responseField: 'confirmed_date_label', sessionVariable: 'booking_date_label' },
            { responseField: 'alt_slot_label', sessionVariable: 'alt_slot_label' },
            { responseField: 'alt_date_label', sessionVariable: 'alt_date_label' },
            { responseField: 'entity_name', sessionVariable: 'booking_entity_name' }
          ]
        }
      };
    }
    if (node.id === 'node_api_check_amit') {
      return {
        ...node,
        data: {
          ...node.data,
          endpoint: `/api/entities/${amitId}/check-availability`,
          url: `/api/entities/${amitId}/check-availability`,
          method: 'POST',
          bodyParams: JSON.stringify({ datetime: '{{preferred_datetime}}' }),
          responseMapping: [
            { responseField: 'is_available', sessionVariable: 'is_slot_available' },
            { responseField: 'confirmed_slot_label', sessionVariable: 'booking_slot_label' },
            { responseField: 'confirmed_date_label', sessionVariable: 'booking_date_label' },
            { responseField: 'alt_slot_label', sessionVariable: 'alt_slot_label' },
            { responseField: 'alt_date_label', sessionVariable: 'alt_date_label' },
            { responseField: 'entity_name', sessionVariable: 'booking_entity_name' }
          ]
        }
      };
    }
    if (node.id === 'node_api_check_sneha') {
      return {
        ...node,
        data: {
          ...node.data,
          endpoint: `/api/entities/${snehaId}/check-availability`,
          url: `/api/entities/${snehaId}/check-availability`,
          method: 'POST',
          bodyParams: JSON.stringify({ datetime: '{{preferred_datetime}}' }),
          responseMapping: [
            { responseField: 'is_available', sessionVariable: 'is_slot_available' },
            { responseField: 'confirmed_slot_label', sessionVariable: 'booking_slot_label' },
            { responseField: 'confirmed_date_label', sessionVariable: 'booking_date_label' },
            { responseField: 'alt_slot_label', sessionVariable: 'alt_slot_label' },
            { responseField: 'alt_date_label', sessionVariable: 'alt_date_label' },
            { responseField: 'entity_name', sessionVariable: 'booking_entity_name' }
          ]
        }
      };
    }

    // 2. Condition Nodes (Evaluate real-time boolean `is_slot_available == true`)
    if (node.id.startsWith('node_check_')) {
      return {
        ...node,
        data: {
          ...node.data,
          variable: 'is_slot_available',
          operator: 'equals',
          value: 'true'
        }
      };
    }

    // 3. Booking Nodes (Dynamic live slot list for entity)
    if (node.id === 'node_book_rajesh') {
      return {
        ...node,
        data: {
          ...node.data,
          entityId: rajeshId,
          daysAhead: 3,
          saveVariableAs: 'booking_slot_id'
        }
      };
    }
    if (node.id === 'node_book_priya') {
      return {
        ...node,
        data: {
          ...node.data,
          entityId: priyaId,
          daysAhead: 3,
          saveVariableAs: 'booking_slot_id'
        }
      };
    }
    if (node.id === 'node_book_amit') {
      return {
        ...node,
        data: {
          ...node.data,
          entityId: amitId,
          daysAhead: 3,
          saveVariableAs: 'booking_slot_id'
        }
      };
    }
    if (node.id === 'node_book_sneha') {
      return {
        ...node,
        data: {
          ...node.data,
          entityId: snehaId,
          daysAhead: 3,
          saveVariableAs: 'booking_slot_id'
        }
      };
    }

    // 4. Available Slot Message Nodes (Dynamic labels)
    if (node.id === 'node_avail_rajesh') {
      return {
        ...node,
        data: {
          ...node.data,
          text: "✅ *Slot is Available!*\n\n👨‍⚕️ *Doctor:* Dr. Rajesh Sharma (General Physician)\n📅 *Date:* {{booking_date_label}}\n⏰ *Confirmed Slot:* {{booking_slot_label}}\n📍 *Location:* OPD Consultation Room 102\n\nWould you like to confirm this consultation?",
          buttons: [
            { id: 'Yes', title: 'Yes, Confirm', payload: 'Yes' },
            { id: 'No', title: 'No, View All Slots', payload: 'No' }
          ],
          interactiveButtons: [
            { id: 'Yes', title: 'Yes, Confirm', payload: 'Yes' },
            { id: 'No', title: 'No, View All Slots', payload: 'No' }
          ]
        }
      };
    }
    if (node.id === 'node_avail_priya') {
      return {
        ...node,
        data: {
          ...node.data,
          text: "✅ *Slot is Available!*\n\n👨‍⚕️ *Doctor:* Dr. Priya Verma (Cardiologist)\n📅 *Date:* {{booking_date_label}}\n⏰ *Confirmed Slot:* {{booking_slot_label}}\n📍 *Location:* Cardiology OPD Room 204\n\nWould you like to confirm this consultation?",
          buttons: [
            { id: 'Yes', title: 'Yes, Confirm', payload: 'Yes' },
            { id: 'No', title: 'No, View All Slots', payload: 'No' }
          ],
          interactiveButtons: [
            { id: 'Yes', title: 'Yes, Confirm', payload: 'Yes' },
            { id: 'No', title: 'No, View All Slots', payload: 'No' }
          ]
        }
      };
    }
    if (node.id === 'node_avail_amit') {
      return {
        ...node,
        data: {
          ...node.data,
          text: "✅ *Slot is Available!*\n\n👨‍⚕️ *Doctor:* Dr. Amit Patel (Orthopedic)\n📅 *Date:* {{booking_date_label}}\n⏰ *Confirmed Slot:* {{booking_slot_label}}\n📍 *Location:* Ortho Care Room 108\n\nWould you like to confirm this consultation?",
          buttons: [
            { id: 'Yes', title: 'Yes, Confirm', payload: 'Yes' },
            { id: 'No', title: 'No, View All Slots', payload: 'No' }
          ],
          interactiveButtons: [
            { id: 'Yes', title: 'Yes, Confirm', payload: 'Yes' },
            { id: 'No', title: 'No, View All Slots', payload: 'No' }
          ]
        }
      };
    }
    if (node.id === 'node_avail_sneha') {
      return {
        ...node,
        data: {
          ...node.data,
          text: "✅ *Slot is Available!*\n\n👨‍⚕️ *Doctor:* Dr. Sneha Kulkarni (Pediatrician)\n📅 *Date:* {{booking_date_label}}\n⏰ *Confirmed Slot:* {{booking_slot_label}}\n📍 *Location:* Pediatric OPD Room 301\n\nWould you like to confirm this consultation?",
          buttons: [
            { id: 'Yes', title: 'Yes, Confirm', payload: 'Yes' },
            { id: 'No', title: 'No, View All Slots', payload: 'No' }
          ],
          interactiveButtons: [
            { id: 'Yes', title: 'Yes, Confirm', payload: 'Yes' },
            { id: 'No', title: 'No, View All Slots', payload: 'No' }
          ]
        }
      };
    }

    // 5. Alternative Slot Offer Message Nodes (Dynamic labels)
    if (node.id === 'node_alt_rajesh') {
      return {
        ...node,
        data: {
          ...node.data,
          text: "⚠️ *Requested Slot Busy or Outside Shift:*\n\nDr. Rajesh Sharma is unavailable at *{{preferred_datetime}}*.\n\n⏰ *Real-Time Next Available Alternative:*\n• *{{alt_date_label}} at {{alt_slot_label}}*\n\nWould you like to book this live slot?",
          buttons: [
            { id: 'Yes_Alt', title: 'Yes, Book Alt Slot', payload: 'Yes_Alt' },
            { id: 'No_Alt', title: 'No, View All Slots', payload: 'No_Alt' }
          ],
          interactiveButtons: [
            { id: 'Yes_Alt', title: 'Yes, Book Alt Slot', payload: 'Yes_Alt' },
            { id: 'No_Alt', title: 'No, View All Slots', payload: 'No_Alt' }
          ]
        }
      };
    }
    if (node.id === 'node_alt_priya') {
      return {
        ...node,
        data: {
          ...node.data,
          text: "⚠️ *Requested Slot Busy or Outside Shift:*\n\nDr. Priya Verma is unavailable at *{{preferred_datetime}}*.\n\n⏰ *Real-Time Next Available Alternative:*\n• *{{alt_date_label}} at {{alt_slot_label}}*\n\nWould you like to book this live slot?",
          buttons: [
            { id: 'Yes_Alt', title: 'Yes, Book Alt Slot', payload: 'Yes_Alt' },
            { id: 'No_Alt', title: 'No, View All Slots', payload: 'No_Alt' }
          ],
          interactiveButtons: [
            { id: 'Yes_Alt', title: 'Yes, Book Alt Slot', payload: 'Yes_Alt' },
            { id: 'No_Alt', title: 'No, View All Slots', payload: 'No_Alt' }
          ]
        }
      };
    }
    if (node.id === 'node_alt_amit') {
      return {
        ...node,
        data: {
          ...node.data,
          text: "⚠️ *Requested Slot Busy or Outside Shift:*\n\nDr. Amit Patel is unavailable at *{{preferred_datetime}}*.\n\n⏰ *Real-Time Next Available Alternative:*\n• *{{alt_date_label}} at {{alt_slot_label}}*\n\nWould you like to book this live slot?",
          buttons: [
            { id: 'Yes_Alt', title: 'Yes, Book Alt Slot', payload: 'Yes_Alt' },
            { id: 'No_Alt', title: 'No, View All Slots', payload: 'No_Alt' }
          ],
          interactiveButtons: [
            { id: 'Yes_Alt', title: 'Yes, Book Alt Slot', payload: 'Yes_Alt' },
            { id: 'No_Alt', title: 'No, View All Slots', payload: 'No_Alt' }
          ]
        }
      };
    }
    if (node.id === 'node_alt_sneha') {
      return {
        ...node,
        data: {
          ...node.data,
          text: "⚠️ *Requested Slot Busy or Outside Shift:*\n\nDr. Sneha Kulkarni is unavailable at *{{preferred_datetime}}*.\n\n⏰ *Real-Time Next Available Alternative:*\n• *{{alt_date_label}} at {{alt_slot_label}}*\n\nWould you like to book this live slot?",
          buttons: [
            { id: 'Yes_Alt', title: 'Yes, Book Alt Slot', payload: 'Yes_Alt' },
            { id: 'No_Alt', title: 'No, View All Slots', payload: 'No_Alt' }
          ],
          interactiveButtons: [
            { id: 'Yes_Alt', title: 'Yes, Book Alt Slot', payload: 'Yes_Alt' },
            { id: 'No_Alt', title: 'No, View All Slots', payload: 'No_Alt' }
          ]
        }
      };
    }

    return node;
  });

  const cleanEdges = buildCleanEdges();

  await conn.collection('automations').updateOne(
    { _id: FLOW_ID },
    {
      $set: {
        nodes: updatedNodes,
        edges: cleanEdges,
        isActive: true,
        status: 'active',
        updatedAt: new Date()
      }
    }
  );

  console.log(`✅ Successfully updated flow ${FLOW_ID} in ${dbName}! Total nodes: ${updatedNodes.length}, edges: ${cleanEdges.length}`);
  await conn.close();
}

async function run() {
  await updateDb('messbee');
  await updateDb('test');
  console.log('\n🎉 Both databases updated successfully!');
  process.exit(0);
}

run().catch(e => {
  console.error('Migration error:', e);
  process.exit(1);
});

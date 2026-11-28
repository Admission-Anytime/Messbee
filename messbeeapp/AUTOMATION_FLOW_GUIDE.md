# MessBee Mobile App — Automation Module Specification & Architecture

This document defines the complete UI/UX, navigation, data model, validation, and backend API integration for the **Automation** section in `messbeeapp/`, matching the Figma design system (`#00B67A` / `#00875A` emerald primary, `#F8FAFC` slate surface, `#0F172A` ink).

---

## 1. Screen Inventory & User Journey

| # | Screen / Modal | Route Name | Purpose |
|---|---|---|---|
| 1 | **Automation Dashboard** | `AutomationDashboard` | Overview KPIs (Total, Active, Paused, Messages Sent), quick actions (`New Flow Builder`, `Use a template`), live search/filter, and "Your automations" list with toggle, configure, test, and delete actions. |
| 2 | **Create Automation** | `CreateAutomation` | Entry point to start a blank flow (`Start from scratch`), choose an Automation Type (`QR Automation`, `Keyword Automation`, `Webhook Flow`), or pick a pre-built template. |
| 3 | **Flow Builder** | `AutomationFlowBuilder` | Visual vertical node-graph editor (`Draft`/`Live` header, toolbar with `Nodes`, `Triggers`, `Preview`, `Simulate`, `Publish`, zoom/undo controls, connected node cards, `+ Add new node` button, and sticky `Save draft` / `Test flow` / `Publish` footer). |
| 4 | **Add Node Bottom Sheet** | (Modal inside `AutomationFlowBuilder`) | Searchable categorized node picker: **Messages** (Text, Media, Button, List, Template, Location), **Logic** (Condition, Delay, Split, Jump), **Actions** (Add Tag, Remove Tag, Assign Agent, Update Field, Webhook, Human Handoff). |
| 5 | **Node Configuration** | `AutomationNodeConfig` | Two-tab editor (`Configuration` and `How Does It Work`) tailored to each node type (Trigger/QR/Keyword/Webhook, Text Message with variables & WhatsApp preview, Media Message with URL & media type, Button/List/Condition/Delay/Action). |
| 6 | **Publish Automation & Confirmation** | `PublishAutomation` | 6-point live validation checklist, Flow Summary grid, `Save as draft` / `Publish automation` footer, Confirmation modal (`Publish Automation?` → `Cancel` / `Publish now`), and **Automation Published** success state (`Live` badge, `View live analytics`, `Back to automations`). |
| 7 | **Automation Simulator** | `AutomationSimulator` | Safe sandbox tester ("Test without messaging real customers"): Test contact selector (from live contacts), Trigger event selector, Test message input, step-by-step **Live execution** checklist with timestamps, and **WhatsApp output** bubble preview. |

---

## 2. Navigation & Params (`RootNavigator.js`)

```text
AutomationDashboard
 ├── CreateAutomation
 │    └── AutomationFlowBuilder (params: { flow?, automationType?, templateId? })
 └── AutomationFlowBuilder (params: { automationId?, flow? })
      ├── AutomationNodeConfig (params: { node, onSaveNode })
      ├── AutomationSimulator (params: { flow })
      └── PublishAutomation (params: { flow, onPublished? })
```

---

## 3. Data Model (`server/models/Automation.js` Compatible)

Every automation saved to MongoDB via `/api/automation` follows this structure:

```json
{
  "_id": "string (Mongo ObjectId, omitted on create)",
  "name": "Reception QR flow",
  "channelId": "string (required by backend AutomationSchema)",
  "isActive": true,
  "triggers": [
    { "type": "qr_code", "value": "reception_qr" }
  ],
  "nodes": [
    {
      "id": "node_trigger_1",
      "type": "triggerNode",
      "position": { "x": 100, "y": 50 },
      "data": {
        "label": "QR code scanned",
        "triggerType": "qr_code",
        "qrName": "Reception Desk QR",
        "keyword": "reception_qr",
        "destination": "Support Desk",
        "enabled": true
      }
    },
    {
      "id": "node_msg_1",
      "type": "messageNode",
      "position": { "x": 100, "y": 200 },
      "data": {
        "label": "Welcome message",
        "messageType": "text",
        "text": "Hi {{name}}, welcome to MessBee! How can we help you today?"
      }
    }
  ],
  "edges": [
    {
      "id": "edge_1",
      "source": "node_trigger_1",
      "target": "node_msg_1",
      "type": "smoothstep"
    }
  ]
}
```

### Supported Node Types & `node.data` Fields

| Category | UI Node Kind | Backend `node.type` | Key `data` Fields |
|---|---|---|---|
| Trigger | QR Code Scanned | `triggerNode` | `triggerType: 'qr_code'`, `qrName`, `keyword`, `destination`, `enabled` |
| Trigger | Keyword Match | `triggerNode` | `triggerType: 'keyword'`, `keyword`, `matchType`, `enabled` |
| Trigger | Webhook / CRM Event | `eventTriggerNode` | `triggerType: 'webhook'`, `eventName`, `eventValue`, `enabled` |
| Messages | Text Message | `messageNode` | `messageType: 'text'`, `label`, `text` |
| Messages | Media Message | `messageNode` | `messageType: 'media'`, `label`, `headerType` (`image`\|`video`\|`document`), `mediaUrl`, `text` |
| Messages | Button Message | `interactiveNode` | `messageType: 'interactive'`, `label`, `text`, `buttons: [{ id, title }]` |
| Messages | List Message | `interactiveNode` | `messageType: 'menu'`, `label`, `text`, `buttonText`, `sections` |
| Logic | Condition | `conditionNode` | `label`, `variable`, `operator` (`equals`\|`contains`\|`greater_than`), `value` |
| Logic | Delay / Wait | `delayNode` | `label`, `delayTimeMs`, `delayDisplay` |
| Actions | Add / Remove Tag | `actionNode` | `actionType: 'add_tag' \| 'remove_tag'`, `tagValue` |
| Actions | Human Handoff / Agent | `actionNode` | `actionType: 'human_handoff'`, `department` |
| Actions | Update Contact Field | `actionNode` | `actionType: 'update_field'`, `fieldKey`, `fieldValue` |
| Actions | API / Webhook | `apiNode` | `endpoint`, `method`, `headers`, `bodyParams` |

---

## 4. Backend API Endpoints (`messbeeapp/src/services/api.js`)

| Action | Method & Path | Service Method |
|---|---|---|
| List all automations | `GET /api/automation` | `automationService.getAutomations()` |
| Get single automation | `GET /api/automation/:id` | `automationService.getAutomationById(id)` |
| Create automation | `POST /api/automation` | `automationService.createAutomation(payload)` |
| Update / Toggle / Publish | `PUT /api/automation/:id` | `automationService.updateAutomation(id, payload)` |
| Delete automation | `DELETE /api/automation/:id` | `automationService.deleteAutomation(id)` |
| Test real WhatsApp number | `POST /api/automation/:id/test` | `automationService.testAutomation(id, { phoneNumber })` |
| Start Simulator session | `POST /api/automation/:id/simulate-start` | `automationService.simulateStart(id, payload)` |
| Send Simulator message | `POST /api/automation/:id/simulate-message` | `automationService.simulateMessage(id, payload)` |
| Activity logs | `GET /api/automation/activity` | `automationService.getAutomationActivity()` |
| Resolve channelId | `GET /api/whatsapp/config` | `whatsappConfigService.getConfig()` |

---

## 5. Validation Rules (`messbeeapp/src/utils/validation.js`)

1. **Flow Name**: Required, minimum 2 characters.
2. **Trigger Node**: Must have a trigger keyword/QR identifier or event name configured.
3. **Message / Media Node**: Text content is required; Media nodes require a valid `http(s)://` URL when media is attached.
4. **Condition / Delay / Action Nodes**: Condition requires variable + value; Delay requires positive duration; Tag action requires a tag name; Webhook action requires a valid URL.
5. **Publish Checklist**: All 6 validation checks must pass before `Publish now` is enabled:
   - Trigger configured
   - Message content set
   - All nodes connected
   - Valid variable syntax (`{{...}}`)
   - WhatsApp channel linked (or ready)
   - No orphan / empty nodes

---

## 6. Design Tokens & Visual Guidelines

- **Primary Emerald**: `#00B67A` (CTA buttons, active badges, dashed node connectors)
- **Dark Emerald**: `#00875A` (Accent icons, active tab indicators)
- **Surface Background**: `#F8FAFC`
- **Card Surface**: `#FFFFFF` with `1px` `#E2E8F0` border and `14px–16px` radius
- **Text Hierarchy**: `#0F172A` (headings), `#334155` (body), `#64748B` (subtitles), `#94A3B8` (placeholders)
- **Category Accents**:
  - Trigger: Emerald (`#EDF9F2` / `#00B67A`)
  - Message: Indigo/Blue (`#EFF6FF` / `#3B82F6`)
  - Logic: Amber (`#FEF3C7` / `#D97706`)
  - Action: Purple (`#F3E8FF` / `#7C3AED`)

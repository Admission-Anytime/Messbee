import React, { useState } from "react";
import {
  CodeBracketIcon, ClipboardDocumentIcon, CheckIcon, KeyIcon, ChatBubbleLeftRightIcon,
  UserGroupIcon, BellAlertIcon, ChartBarIcon, ShieldCheckIcon, RocketLaunchIcon, DocumentDuplicateIcon,
} from "@heroicons/react/24/outline";

const ApiDocs = () => {
  const [activeSection, setActiveSection] = useState("getting-started");
  const [activeLanguage, setActiveLanguage] = useState("curl");
  const [copiedCode, setCopiedCode] = useState(null);

  const copyToClipboard = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const apiSections = [
    { id: "getting-started", label: "Getting Started", icon: RocketLaunchIcon },
    { id: "authentication", label: "Authentication", icon: KeyIcon },
    { id: "messages", label: "Messages API", icon: ChatBubbleLeftRightIcon },
    { id: "contacts", label: "Contacts API", icon: UserGroupIcon },
    { id: "campaigns", label: "Campaigns API", icon: BellAlertIcon },
    { id: "analytics", label: "Analytics API", icon: ChartBarIcon },
    { id: "webhooks", label: "Webhooks", icon: DocumentDuplicateIcon },
    { id: "rate-limits", label: "Rate Limits", icon: ShieldCheckIcon },
  ];

  const codeExamples = {
    authentication: {
      curl: `curl -X POST https://api.messbee.com/v1/auth/token \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "api_key": "your_api_key_here",\n    "api_secret": "your_api_secret_here"\n  }'`,
      javascript: `const response = await fetch('https://api.messbee.com/v1/auth/token', {\n  method: 'POST',\n  headers: {\n    'Content-Type': 'application/json',\n  },\n  body: JSON.stringify({\n    api_key: 'your_api_key_here',\n    api_secret: 'your_api_secret_here'\n  })\n});\n\nconst data = await response.json();\nconsole.log(data.access_token);`,
      python: `import requests\n\nurl = "https://api.messbee.com/v1/auth/token"\npayload = {\n    "api_key": "your_api_key_here",\n    "api_secret": "your_api_secret_here"\n}\n\nresponse = requests.post(url, json=payload)\naccess_token = response.json()['access_token']\nprint(access_token)`,
      php: `<?php\n$curl = curl_init();\n\ncurl_setopt_array($curl, [\n  CURLOPT_URL => "https://api.messbee.com/v1/auth/token",\n  CURLOPT_RETURNTRANSFER => true,\n  CURLOPT_POST => true,\n  CURLOPT_POSTFIELDS => json_encode([\n    "api_key" => "your_api_key_here",\n    "api_secret" => "your_api_secret_here"\n  ]),\n  CURLOPT_HTTPHEADER => ["Content-Type: application/json"],\n]);\n\n$response = curl_exec($curl);\n$data = json_decode($response, true);\necho $data['access_token'];\n?>`,
    },
    sendMessage: {
      curl: `curl -X POST https://api.messbee.com/v1/messages/send \\\n  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "to": "+919876543210",\n    "type": "text",\n    "message": "Hello from MessBee API!"\n  }'`,
      javascript: `const response = await fetch('https://api.messbee.com/v1/messages/send', {\n  method: 'POST',\n  headers: {\n    'Authorization': 'Bearer YOUR_ACCESS_TOKEN',\n    'Content-Type': 'application/json',\n  },\n  body: JSON.stringify({\n    to: '+919876543210',\n    type: 'text',\n    message: 'Hello from MessBee API!'\n  })\n});\n\nconst result = await response.json();\nconsole.log(result);`,
      python: `import requests\n\nurl = "https://api.messbee.com/v1/messages/send"\nheaders = {\n    "Authorization": "Bearer YOUR_ACCESS_TOKEN",\n    "Content-Type": "application/json"\n}\npayload = {\n    "to": "+919876543210",\n    "type": "text",\n    "message": "Hello from MessBee API!"\n}\n\nresponse = requests.post(url, json=payload, headers=headers)\nprint(response.json())`,
      php: `<?php\n$curl = curl_init();\n\ncurl_setopt_array($curl, [\n  CURLOPT_URL => "https://api.messbee.com/v1/messages/send",\n  CURLOPT_RETURNTRANSFER => true,\n  CURLOPT_POST => true,\n  CURLOPT_POSTFIELDS => json_encode([\n    "to" => "+919876543210",\n    "type" => "text",\n    "message" => "Hello from MessBee API!"\n  ]),\n  CURLOPT_HTTPHEADER => [\n    "Authorization: Bearer YOUR_ACCESS_TOKEN",\n    "Content-Type: application/json"\n  ],\n]);\n\n$response = curl_exec($curl);\necho $response;\n?>`,
    },
  };

  const CodeBlock = ({ code, language, id }) => (
    <div className="relative group">
      <div className="absolute right-3 top-3 z-10">
        <button onClick={() => copyToClipboard(code, id)} className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors border border-slate-600" title="Copy to clipboard">
          {copiedCode === id ? <CheckIcon className="w-4 h-4 text-emerald-400" /> : <ClipboardDocumentIcon className="w-4 h-4 text-slate-300" />}
        </button>
      </div>
      <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto text-sm border border-slate-700 shadow-lg">
        <code className="font-mono">{code}</code>
      </pre>
    </div>
  );

  const EndpointCard = ({ method, path, description }) => (
    <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-emerald-300 transition-colors">
      <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${method === "GET" ? "bg-blue-100 text-blue-700" : method === "POST" ? "bg-emerald-100 text-emerald-700" : method === "PUT" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
        {method}
      </span>
      <div className="flex-1">
        <code className="text-sm font-semibold text-slate-800">{path}</code>
        <p className="text-xs text-slate-600 mt-1">{description}</p>
      </div>
    </div>
  );

  const ResponseExample = ({ status, data }) => (
    <div className="mt-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-bold text-slate-500 uppercase">Response</span>
        <span className={`px-2 py-0.5 rounded text-xs font-bold ${status === 200 || status === 201 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
          {status}
        </span>
      </div>
      <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto text-sm border border-slate-700">
        <code className="font-mono">{JSON.stringify(data, null, 2)}</code>
      </pre>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "getting-started":
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-3">Getting Started with MessBee API</h1>
              <p className="text-slate-600 text-lg">Build powerful WhatsApp integrations with our REST API. Send messages, manage contacts, automate campaigns, and more.</p>
            </div>
            <div className="bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center shrink-0">
                  <RocketLaunchIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Quick Start</h3>
                  <p className="text-slate-700 mb-4">Get your API credentials from the <a href="/admin/developer/api" className="text-emerald-600 font-semibold hover:underline">Developer Settings</a> page and start making API calls in minutes.</p>
                  <div className="flex gap-3">
                    <span className="px-3 py-1 bg-white rounded-lg text-sm font-semibold text-slate-700 border border-slate-200">
                      Base URL: <code className="text-emerald-600">https://api.messbee.com/v1</code>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">API Endpoints Overview</h2>
              <div className="space-y-3">
                <EndpointCard method="POST" path="/v1/auth/token" description="Get authentication token" />
                <EndpointCard method="POST" path="/v1/messages/send" description="Send a WhatsApp message" />
                <EndpointCard method="GET" path="/v1/contacts" description="List all contacts" />
                <EndpointCard method="POST" path="/v1/campaigns" description="Create a new campaign" />
              </div>
            </div>
          </div>
        );
      case "authentication":
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-3">Authentication</h1>
              <p className="text-slate-600 text-lg">Secure your API requests with Bearer token authentication.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Request Access Token</h2>
              <div className="space-y-4">
                <div className="flex gap-2 border-b border-slate-200">
                  {["curl", "javascript", "python", "php"].map((lang) => (
                    <button key={lang} onClick={() => setActiveLanguage(lang)} className={`px-4 py-2 font-semibold text-sm border-b-2 transition-colors ${activeLanguage === lang ? "border-emerald-500 text-emerald-600" : "border-transparent text-slate-500"}`}>
                      {lang === "curl" ? "cURL" : lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </button>
                  ))}
                </div>
                <CodeBlock code={codeExamples.authentication[activeLanguage]} language={activeLanguage} id="auth-token" />
                <ResponseExample status={200} data={{ success: true, access_token: "eyJhbGci...", token_type: "Bearer", expires_in: 3600 }} />
              </div>
            </div>
          </div>
        );
      case "messages":
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-3">Messages API</h1>
              <p className="text-slate-600 text-lg">Send WhatsApp messages programmatically.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Send a Message</h2>
              <EndpointCard method="POST" path="/v1/messages/send" description="Send a text, media, or template message" />
              <div className="mt-6 space-y-4">
                <div className="flex gap-2 border-b border-slate-200">
                  {["curl", "javascript", "python", "php"].map((lang) => (
                    <button key={lang} onClick={() => setActiveLanguage(lang)} className={`px-4 py-2 font-semibold text-sm border-b-2 transition-colors ${activeLanguage === lang ? "border-emerald-500 text-emerald-600" : "border-transparent text-slate-500"}`}>
                      {lang === "curl" ? "cURL" : lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </button>
                  ))}
                </div>
                <CodeBlock code={codeExamples.sendMessage[activeLanguage]} language={activeLanguage} id="send-message" />
                <ResponseExample status={200} data={{ success: true, message_id: "msg_1a2b3c4d5e6f", status: "sent" }} />
              </div>
            </div>
          </div>
        );
      case "contacts":
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-3">Contacts API</h1>
              <p className="text-slate-600 text-lg">Manage your WhatsApp contacts, import lists, and retrieve user information programmatically.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Add a Contact</h2>
              <EndpointCard method="POST" path="/v1/contacts" description="Add a new contact to your list" />
              <div className="mt-6 space-y-4">
                <CodeBlock code={`curl -X POST https://api.messbee.com/v1/contacts \\\n  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "phone": "+919876543210",\n    "name": "John Doe",\n    "tags": ["vip", "customer"]\n  }'`} language="curl" id="add-contact" />
                <ResponseExample status={201} data={{ success: true, contact_id: "cont_xyz123", status: "created" }} />
              </div>
            </div>
          </div>
        );
      case "campaigns":
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-3">Campaigns API</h1>
              <p className="text-slate-600 text-lg">Create, schedule, and manage your WhatsApp marketing campaigns.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Create Campaign</h2>
              <EndpointCard method="POST" path="/v1/campaigns" description="Create a new promotional campaign" />
              <div className="mt-6 space-y-4">
                <CodeBlock code={`curl -X POST https://api.messbee.com/v1/campaigns \\\n  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "name": "Summer Sale 2024",\n    "template_id": "tpl_summer50",\n    "audience": "tag:vip",\n    "schedule_time": "2024-06-01T10:00:00Z"\n  }'`} language="curl" id="create-campaign" />
                <ResponseExample status={201} data={{ success: true, campaign_id: "camp_8899", status: "scheduled" }} />
              </div>
            </div>
          </div>
        );
      case "analytics":
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-3">Analytics API</h1>
              <p className="text-slate-600 text-lg">Retrieve detailed metrics for your account, messages, and campaigns.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Get Account Stats</h2>
              <EndpointCard method="GET" path="/v1/analytics/overview" description="Get high-level message and delivery metrics" />
              <div className="mt-6 space-y-4">
                <CodeBlock code={`curl -X GET "https://api.messbee.com/v1/analytics/overview?start_date=2024-01-01&end_date=2024-01-31" \\\n  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"`} language="curl" id="get-analytics" />
                <ResponseExample status={200} data={{ success: true, data: { messages_sent: 15420, messages_delivered: 15380, messages_read: 12100, response_rate: "78%" } }} />
              </div>
            </div>
          </div>
        );
      case "webhooks":
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-3">Webhooks</h1>
              <p className="text-slate-600 text-lg">Receive real-time HTTP callbacks for incoming messages and delivery events.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Incoming Message Event</h2>
              <p className="text-slate-700 mb-4">When a user sends a message to your WhatsApp number, we will send a POST request to your configured webhook URL.</p>
              <div className="mt-6 space-y-4">
                <ResponseExample status={200} data={{ event: "message.received", data: { from: "+919876543210", type: "text", text: { body: "I need help with my order." }, timestamp: 1718293847 } }} />
              </div>
            </div>
          </div>
        );
      case "rate-limits":
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-3">Rate Limits</h1>
              <p className="text-slate-600 text-lg">Understand API rate limiting to ensure continuous availability.</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-900 font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Endpoint</th>
                    <th className="px-6 py-4">Limit</th>
                    <th className="px-6 py-4">Window</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr><td className="px-6 py-4 font-mono">/v1/messages/send</td><td className="px-6 py-4">100 requests</td><td className="px-6 py-4">Per second</td></tr>
                  <tr><td className="px-6 py-4 font-mono">/v1/contacts</td><td className="px-6 py-4">50 requests</td><td className="px-6 py-4">Per second</td></tr>
                  <tr><td className="px-6 py-4 font-mono">/v1/analytics/*</td><td className="px-6 py-4">60 requests</td><td className="px-6 py-4">Per minute</td></tr>
                </tbody>
              </table>
            </div>
            <p className="text-slate-700 leading-relaxed bg-amber-50 p-4 rounded-lg border border-amber-200">If you exceed the rate limits, the API will return a <code className="font-bold text-amber-700 bg-amber-100 px-1 py-0.5 rounded">429 Too Many Requests</code> HTTP status code. Check the <code className="font-bold text-amber-700 bg-amber-100 px-1 py-0.5 rounded">X-RateLimit-Reset</code> header for when to retry.</p>
          </div>
        );
      default:
        return (
          <div className="py-20 text-center">
            <h2 className="text-2xl font-bold text-slate-700">Section Not Found</h2>
            <p className="text-slate-500 mt-2">The requested documentation section does not exist.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-full bg-slate-50 font-sans">
      <aside className="w-64 bg-white border-r border-slate-200 overflow-y-auto shrink-0">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <CodeBracketIcon className="w-6 h-6 text-emerald-600" />
            <h2 className="text-xl font-bold text-slate-900">API Docs</h2>
          </div>
          <p className="text-xs text-slate-500">Version 1.0</p>
        </div>
        <nav className="p-4">
          <div className="space-y-1">
            {apiSections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                    activeSection === section.id ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{section.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto bg-white">
        <div className="max-w-4xl mx-auto p-8 md:p-12">{renderContent()}</div>
      </main>
    </div>
  );
};

export default ApiDocs;
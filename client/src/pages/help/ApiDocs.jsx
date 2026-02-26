import React, { useState } from "react";
import {
  CodeBracketIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  KeyIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  BellAlertIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
  DocumentDuplicateIcon,
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

  // API Sections Navigation
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

  // Code Examples
  const codeExamples = {
    authentication: {
      curl: `curl -X POST https://api.messbee.com/v1/auth/token \\
  -H "Content-Type: application/json" \\
  -d '{
    "api_key": "your_api_key_here",
    "api_secret": "your_api_secret_here"
  }'`,
      javascript: `const response = await fetch('https://api.messbee.com/v1/auth/token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    api_key: 'your_api_key_here',
    api_secret: 'your_api_secret_here'
  })
});

const data = await response.json();
console.log(data.access_token);`,
      python: `import requests

url = "https://api.messbee.com/v1/auth/token"
payload = {
    "api_key": "your_api_key_here",
    "api_secret": "your_api_secret_here"
}

response = requests.post(url, json=payload)
access_token = response.json()['access_token']
print(access_token)`,
      php: `<?php
$curl = curl_init();

curl_setopt_array($curl, [
  CURLOPT_URL => "https://api.messbee.com/v1/auth/token",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_POST => true,
  CURLOPT_POSTFIELDS => json_encode([
    "api_key" => "your_api_key_here",
    "api_secret" => "your_api_secret_here"
  ]),
  CURLOPT_HTTPHEADER => ["Content-Type: application/json"],
]);

$response = curl_exec($curl);
$data = json_decode($response, true);
echo $data['access_token'];
?>`,
    },
    sendMessage: {
      curl: `curl -X POST https://api.messbee.com/v1/messages/send \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "+919876543210",
    "type": "text",
    "message": "Hello from MessBee API!"
  }'`,
      javascript: `const response = await fetch('https://api.messbee.com/v1/messages/send', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    to: '+919876543210',
    type: 'text',
    message: 'Hello from MessBee API!'
  })
});

const result = await response.json();
console.log(result);`,
      python: `import requests

url = "https://api.messbee.com/v1/messages/send"
headers = {
    "Authorization": "Bearer YOUR_ACCESS_TOKEN",
    "Content-Type": "application/json"
}
payload = {
    "to": "+919876543210",
    "type": "text",
    "message": "Hello from MessBee API!"
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`,
      php: `<?php
$curl = curl_init();

curl_setopt_array($curl, [
  CURLOPT_URL => "https://api.messbee.com/v1/messages/send",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_POST => true,
  CURLOPT_POSTFIELDS => json_encode([
    "to" => "+919876543210",
    "type" => "text",
    "message" => "Hello from MessBee API!"
  ]),
  CURLOPT_HTTPHEADER => [
    "Authorization: Bearer YOUR_ACCESS_TOKEN",
    "Content-Type: application/json"
  ],
]);

$response = curl_exec($curl);
echo $response;
?>`,
    },
  };

  const CodeBlock = ({ code, language, id }) => (
    <div className="relative group">
      <div className="absolute right-3 top-3 z-10">
        <button
          onClick={() => copyToClipboard(code, id)}
          className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors border border-slate-600"
          title="Copy to clipboard"
        >
          {copiedCode === id ? (
            <CheckIcon className="w-4 h-4 text-emerald-400" />
          ) : (
            <ClipboardDocumentIcon className="w-4 h-4 text-slate-300" />
          )}
        </button>
      </div>
      <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto text-sm border border-slate-700 shadow-lg">
        <code className="font-mono">{code}</code>
      </pre>
    </div>
  );

  const EndpointCard = ({ method, path, description }) => (
    <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-emerald-300 transition-colors">
      <span
        className={`px-2.5 py-1 rounded-md text-xs font-bold ${
          method === "GET"
            ? "bg-blue-100 text-blue-700"
            : method === "POST"
            ? "bg-emerald-100 text-emerald-700"
            : method === "PUT"
            ? "bg-amber-100 text-amber-700"
            : "bg-red-100 text-red-700"
        }`}
      >
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
        <span
          className={`px-2 py-0.5 rounded text-xs font-bold ${
            status === 200 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
          }`}
        >
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
              <p className="text-slate-600 text-lg">
                Build powerful WhatsApp integrations with our REST API. Send messages, manage contacts, automate campaigns, and more.
              </p>
            </div>

            <div className="bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center shrink-0">
                  <RocketLaunchIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Quick Start</h3>
                  <p className="text-slate-700 mb-4">
                    Get your API credentials from the{" "}
                    <a href="/admin/developer/api" className="text-emerald-600 font-semibold hover:underline">
                      Developer Settings
                    </a>{" "}
                    page and start making API calls in minutes.
                  </p>
                  <div className="flex gap-3">
                    <span className="px-3 py-1 bg-white rounded-lg text-sm font-semibold text-slate-700 border border-slate-200">
                      Base URL: <code className="text-emerald-600">https://api.messbee.com/v1</code>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Key Features</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { icon: ChatBubbleLeftRightIcon, title: "Send Messages", desc: "Text, media, templates, and interactive messages" },
                  { icon: UserGroupIcon, title: "Contact Management", desc: "Create, update, and organize contacts with custom fields" },
                  { icon: BellAlertIcon, title: "Campaign Automation", desc: "Schedule and automate bulk messaging campaigns" },
                  { icon: ChartBarIcon, title: "Real-time Analytics", desc: "Track delivery, read receipts, and engagement metrics" },
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
                      <feature.icon className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{feature.title}</h4>
                      <p className="text-sm text-slate-600">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">API Endpoints Overview</h2>
              <div className="space-y-3">
                <EndpointCard method="POST" path="/v1/auth/token" description="Get authentication token" />
                <EndpointCard method="POST" path="/v1/messages/send" description="Send a WhatsApp message" />
                <EndpointCard method="GET" path="/v1/contacts" description="List all contacts" />
                <EndpointCard method="POST" path="/v1/campaigns" description="Create a new campaign" />
                <EndpointCard method="GET" path="/v1/analytics/messages" description="Get message analytics" />
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

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <KeyIcon className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-bold text-amber-900 mb-1">API Credentials Required</h4>
                  <p className="text-sm text-amber-800">
                    You'll need your <strong>API Key</strong> and <strong>API Secret</strong> from your MessBee dashboard to authenticate.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Request Access Token</h2>
              <p className="text-slate-600 mb-4">
                Use your API credentials to get an access token. This token must be included in the Authorization header of all subsequent requests.
              </p>

              <div className="space-y-4">
                <div className="flex gap-2 border-b border-slate-200">
                  {["curl", "javascript", "python", "php"].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setActiveLanguage(lang)}
                      className={`px-4 py-2 font-semibold text-sm border-b-2 transition-colors ${
                        activeLanguage === lang
                          ? "border-emerald-500 text-emerald-600"
                          : "border-transparent text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {lang === "curl" ? "cURL" : lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </button>
                  ))}
                </div>

                <CodeBlock code={codeExamples.authentication[activeLanguage]} language={activeLanguage} id="auth-token" />

                <ResponseExample
                  status={200}
                  data={{
                    success: true,
                    access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                    token_type: "Bearer",
                    expires_in: 3600,
                  }}
                />
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Using the Access Token</h2>
              <p className="text-slate-600 mb-4">Include the token in the Authorization header of your requests:</p>
              <CodeBlock
                code={`Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`}
                language="text"
                id="auth-header"
              />
            </div>

            <div className="bg-red-50 border border-red-200 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <ShieldCheckIcon className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-bold text-red-900 mb-1">Security Best Practices</h4>
                  <ul className="text-sm text-red-800 space-y-1 list-disc list-inside">
                    <li>Never expose your API credentials in client-side code</li>
                    <li>Store credentials securely using environment variables</li>
                    <li>Rotate your API keys regularly</li>
                    <li>Use HTTPS for all API requests</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case "messages":
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-3">Messages API</h1>
              <p className="text-slate-600 text-lg">Send WhatsApp messages programmatically to your contacts.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Send a Message</h2>
              <EndpointCard method="POST" path="/v1/messages/send" description="Send a text, media, or template message" />

              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-bold text-slate-900">Request Body</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-100 border-b-2 border-slate-200">
                      <tr>
                        <th className="text-left p-3 font-bold text-slate-900">Parameter</th>
                        <th className="text-left p-3 font-bold text-slate-900">Type</th>
                        <th className="text-left p-3 font-bold text-slate-900">Required</th>
                        <th className="text-left p-3 font-bold text-slate-900">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr className="hover:bg-slate-50">
                        <td className="p-3 font-mono text-emerald-600">to</td>
                        <td className="p-3 text-slate-600">string</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded">Yes</span>
                        </td>
                        <td className="p-3 text-slate-600">Recipient's WhatsApp number with country code</td>
                      </tr>
                      <tr className="hover:bg-slate-50">
                        <td className="p-3 font-mono text-emerald-600">type</td>
                        <td className="p-3 text-slate-600">string</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded">Yes</span>
                        </td>
                        <td className="p-3 text-slate-600">Message type: text, image, video, document, template</td>
                      </tr>
                      <tr className="hover:bg-slate-50">
                        <td className="p-3 font-mono text-emerald-600">message</td>
                        <td className="p-3 text-slate-600">string</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded">Yes</span>
                        </td>
                        <td className="p-3 text-slate-600">Message content (for text type)</td>
                      </tr>
                      <tr className="hover:bg-slate-50">
                        <td className="p-3 font-mono text-emerald-600">mediaUrl</td>
                        <td className="p-3 text-slate-600">string</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-xs font-bold rounded">No</span>
                        </td>
                        <td className="p-3 text-slate-600">URL to media file (for media types)</td>
                      </tr>
                      <tr className="hover:bg-slate-50">
                        <td className="p-3 font-mono text-emerald-600">caption</td>
                        <td className="p-3 text-slate-600">string</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-xs font-bold rounded">No</span>
                        </td>
                        <td className="p-3 text-slate-600">Caption for media messages</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-bold text-slate-900">Example Request</h3>
                <div className="flex gap-2 border-b border-slate-200">
                  {["curl", "javascript", "python", "php"].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setActiveLanguage(lang)}
                      className={`px-4 py-2 font-semibold text-sm border-b-2 transition-colors ${
                        activeLanguage === lang
                          ? "border-emerald-500 text-emerald-600"
                          : "border-transparent text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {lang === "curl" ? "cURL" : lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </button>
                  ))}
                </div>
                <CodeBlock code={codeExamples.sendMessage[activeLanguage]} language={activeLanguage} id="send-message" />

                <ResponseExample
                  status={200}
                  data={{
                    success: true,
                    message_id: "msg_1a2b3c4d5e6f",
                    status: "sent",
                    timestamp: "2026-02-26T10:30:00Z",
                    to: "+919876543210",
                  }}
                />
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Other Message Endpoints</h2>
              <div className="space-y-3">
                <EndpointCard method="GET" path="/v1/messages/{id}" description="Get message details by ID" />
                <EndpointCard method="GET" path="/v1/messages/status/{id}" description="Check message delivery status" />
                <EndpointCard method="GET" path="/v1/messages/history" description="Get message history with pagination" />
              </div>
            </div>
          </div>
        );

      case "contacts":
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-3">Contacts API</h1>
              <p className="text-slate-600 text-lg">Manage your contact database programmatically.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Available Endpoints</h2>
              <div className="space-y-3">
                <EndpointCard method="GET" path="/v1/contacts" description="List all contacts with pagination" />
                <EndpointCard method="POST" path="/v1/contacts" description="Create a new contact" />
                <EndpointCard method="GET" path="/v1/contacts/{id}" description="Get contact details" />
                <EndpointCard method="PUT" path="/v1/contacts/{id}" description="Update contact information" />
                <EndpointCard method="DELETE" path="/v1/contacts/{id}" description="Delete a contact" />
                <EndpointCard method="POST" path="/v1/contacts/import" description="Bulk import contacts from CSV" />
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Create Contact Example</h2>
              <CodeBlock
                code={`curl -X POST https://api.messbee.com/v1/contacts \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "John Doe",
    "phone": "+919876543210",
    "email": "john@example.com",
    "tags": ["customer", "premium"],
    "custom_fields": {
      "company": "Acme Inc",
      "city": "Mumbai"
    }
  }'`}
                language="bash"
                id="create-contact"
              />

              <ResponseExample
                status={201}
                data={{
                  success: true,
                  contact: {
                    id: "cnt_1a2b3c4d",
                    name: "John Doe",
                    phone: "+919876543210",
                    email: "john@example.com",
                    tags: ["customer", "premium"],
                    created_at: "2026-02-26T10:30:00Z",
                  },
                }}
              />
            </div>
          </div>
        );

      case "campaigns":
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-3">Campaigns API</h1>
              <p className="text-slate-600 text-lg">Create and manage bulk messaging campaigns.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Campaign Endpoints</h2>
              <div className="space-y-3">
                <EndpointCard method="GET" path="/v1/campaigns" description="List all campaigns" />
                <EndpointCard method="POST" path="/v1/campaigns" description="Create a new campaign" />
                <EndpointCard method="GET" path="/v1/campaigns/{id}" description="Get campaign details and stats" />
                <EndpointCard method="PUT" path="/v1/campaigns/{id}" description="Update campaign" />
                <EndpointCard method="POST" path="/v1/campaigns/{id}/launch" description="Launch a scheduled campaign" />
                <EndpointCard method="DELETE" path="/v1/campaigns/{id}" description="Delete a campaign" />
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Create Campaign Example</h2>
              <CodeBlock
                code={`curl -X POST https://api.messbee.com/v1/campaigns \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Summer Sale 2026",
    "message": "🎉 Get 50% off on all products! Use code: SUMMER50",
    "contacts": ["cnt_123", "cnt_456"],
    "schedule_at": "2026-06-01T09:00:00Z",
    "tags": ["promotional"]
  }'`}
                language="bash"
                id="create-campaign"
              />

              <ResponseExample
                status={201}
                data={{
                  success: true,
                  campaign: {
                    id: "cmp_1a2b3c4d",
                    name: "Summer Sale 2026",
                    status: "scheduled",
                    total_contacts: 2,
                    schedule_at: "2026-06-01T09:00:00Z",
                    created_at: "2026-02-26T10:30:00Z",
                  },
                }}
              />
            </div>
          </div>
        );

      case "analytics":
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-3">Analytics API</h1>
              <p className="text-slate-600 text-lg">Get insights and metrics about your messaging activity.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Analytics Endpoints</h2>
              <div className="space-y-3">
                <EndpointCard method="GET" path="/v1/analytics/messages" description="Message statistics and trends" />
                <EndpointCard method="GET" path="/v1/analytics/campaigns" description="Campaign performance metrics" />
                <EndpointCard method="GET" path="/v1/analytics/delivery" description="Delivery and read rates" />
                <EndpointCard method="GET" path="/v1/analytics/credits" description="Credit usage and balance" />
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Get Message Analytics</h2>
              <CodeBlock
                code={`curl -X GET "https://api.messbee.com/v1/analytics/messages?start_date=2026-02-01&end_date=2026-02-26" \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"`}
                language="bash"
                id="analytics-messages"
              />

              <ResponseExample
                status={200}
                data={{
                  success: true,
                  analytics: {
                    total_messages: 15420,
                    delivered: 14892,
                    read: 12341,
                    failed: 528,
                    delivery_rate: "96.6%",
                    read_rate: "80.0%",
                    period: {
                      start: "2026-02-01",
                      end: "2026-02-26",
                    },
                  },
                }}
              />
            </div>
          </div>
        );

      case "webhooks":
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-3">Webhooks</h1>
              <p className="text-slate-600 text-lg">Receive real-time notifications about events in your MessBee account.</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <DocumentDuplicateIcon className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-bold text-blue-900 mb-1">Configure Webhooks</h4>
                  <p className="text-sm text-blue-800">
                    Set up webhook URLs in your{" "}
                    <a href="/admin/settings/webhooks" className="font-semibold underline">
                      Settings → Webhooks
                    </a>{" "}
                    section.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Available Webhook Events</h2>
              <div className="space-y-3">
                {[
                  { event: "message.sent", desc: "Triggered when a message is successfully sent" },
                  { event: "message.delivered", desc: "Triggered when a message is delivered to recipient" },
                  { event: "message.read", desc: "Triggered when recipient reads the message" },
                  { event: "message.failed", desc: "Triggered when message sending fails" },
                  { event: "contact.created", desc: "Triggered when a new contact is added" },
                  { event: "campaign.completed", desc: "Triggered when a campaign finishes" },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 bg-white rounded-lg border border-slate-200">
                    <code className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-bold shrink-0">{item.event}</code>
                    <p className="text-sm text-slate-600">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Webhook Payload Example</h2>
              <p className="text-slate-600 mb-4">MessBee will send a POST request to your webhook URL with the following structure:</p>
              <CodeBlock
                code={JSON.stringify(
                  {
                    event: "message.delivered",
                    timestamp: "2026-02-26T10:30:00Z",
                    data: {
                      message_id: "msg_1a2b3c4d5e6f",
                      to: "+919876543210",
                      status: "delivered",
                      delivered_at: "2026-02-26T10:30:05Z",
                    },
                  },
                  null,
                  2
                )}
                language="json"
                id="webhook-payload"
              />
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
              <h4 className="font-bold text-slate-900 mb-2">Webhook Security</h4>
              <p className="text-sm text-slate-700 mb-2">All webhook requests include a signature header for verification:</p>
              <code className="block p-3 bg-slate-900 text-slate-100 rounded-lg text-xs">
                X-MessBee-Signature: sha256=8f7a9b2c1d3e4f5a6b7c8d9e0f1a2b3c
              </code>
            </div>
          </div>
        );

      case "rate-limits":
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-3">Rate Limits</h1>
              <p className="text-slate-600 text-lg">Understanding API rate limits and best practices.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
                <div className="text-4xl font-bold text-blue-600 mb-2">100</div>
                <div className="text-sm font-bold text-blue-900 uppercase tracking-wide">Requests per minute</div>
                <p className="text-xs text-blue-700 mt-2">For standard API endpoints</p>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl p-6">
                <div className="text-4xl font-bold text-emerald-600 mb-2">10,000</div>
                <div className="text-sm font-bold text-emerald-900 uppercase tracking-wide">Messages per day</div>
                <p className="text-xs text-emerald-700 mt-2">Based on your plan tier</p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Rate Limit Headers</h2>
              <p className="text-slate-600 mb-4">Every API response includes rate limit information in headers:</p>
              <CodeBlock
                code={`X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1645870800`}
                language="text"
                id="rate-limit-headers"
              />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Handling Rate Limit Errors</h2>
              <p className="text-slate-600 mb-4">When you exceed the rate limit, you'll receive a 429 response:</p>
              <ResponseExample
                status={429}
                data={{
                  error: "Rate limit exceeded",
                  message: "Too many requests. Please try again in 60 seconds.",
                  retry_after: 60,
                }}
              />
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
              <h4 className="font-bold text-emerald-900 mb-3">Best Practices</h4>
              <ul className="space-y-2">
                {[
                  "Implement exponential backoff for failed requests",
                  "Cache responses when possible to reduce API calls",
                  "Use batch endpoints for bulk operations",
                  "Monitor rate limit headers in your responses",
                  "Spread requests evenly over time instead of bursting",
                ].map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-emerald-800">
                    <CheckIcon className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-[calc(100vh-70px)] bg-slate-50 font-['Urbanist']">
      {/* Sidebar Navigation */}
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
                    activeSection === section.id
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{section.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        <div className="p-4 border-t border-slate-200 mt-4">
          <a
            href="/admin/developer/api"
            className="block w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-center rounded-lg font-bold text-sm transition-colors"
          >
            Get API Keys
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-8">{renderContent()}</div>
      </main>
    </div>
  );
};

export default ApiDocs;

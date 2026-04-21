import { useNavigate } from "react-router-dom";

import {
  MagnifyingGlassIcon,
  LockClosedIcon,
  ChatBubbleLeftRightIcon,
  ArrowPathRoundedSquareIcon,
  ChevronRightIcon,
  EnvelopeIcon
} from "@heroicons/react/24/solid";

export default function ApiWebhooks() {

  const navigate = useNavigate();

  const sections = [
    {
      title: "Authentication & Security",
      icon: LockClosedIcon,
      color: "bg-blue-100 text-blue-600",
      items: [
        "Generating API Keys",
        "Refreshing Tokens",
        "Security Best Practices",
        "IP Whitelisting Guide"
      ]
    },
    {
      title: "Messaging API",
      icon: ChatBubbleLeftRightIcon,
      color: "bg-green-100 text-green-600",
      items: [
        "Sending your first message",
        "Handling Media Uploads",
        "Template Variables",
        "Bulk Messaging Endpoint"
      ]
    },
    {
      title: "Webhook Events",
      icon: ArrowPathRoundedSquareIcon,
      color: "bg-orange-100 text-orange-500",
      items: [
        "Webhook Setup Guide",
        "Message Status Updates",
        "Signature Verification",
        "Retry Strategy"
      ]
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen">

      <div className="max-w-7xl mx-auto px-10 pt-10 pb-16">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm font-semibold mb-6">

          <span
            onClick={() => navigate("/admin/help/support")}
            className="text-gray-500 hover:text-gray-900 cursor-pointer"
          >
            HELP CENTER
          </span>

          <span className="text-gray-400">›</span>

          <span className="text-gray-900">
            API & WEBHOOKS
          </span>

        </div>


        {/* Header */}
        <div className="flex justify-between items-start mb-10">

          <div>

            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              API & Webhooks
            </h1>

            <p className="text-gray-700 text-lg max-w-xl">
              Technical guides for integrating MessBee with your systems,
              managing authentication, and handling real-time data.
            </p>

          </div>

          {/* API STATUS */}
          <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-5 py-3 bg-white">

            <span className="w-2.5 h-2.5 bg-green-500 rounded-full"></span>

            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold">
                API STATUS
              </p>
              <p className="font-semibold text-gray-900">
                All systems normal
              </p>
            </div>

          </div>

        </div>


        {/* Search */}
        <div className="max-w-md mb-12">

          <div className="flex items-center bg-white border border-gray-200 rounded-xl px-4 py-3">

            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 mr-3"/>

            <input
              placeholder="Search API articles..."
              className="outline-none text-sm w-full"
            />

          </div>

        </div>


        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-28">

          {sections.map((section) => {

            const Icon = section.icon;

            return (
              <div
                key={section.title}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition"
              >

                {/* Card header */}
                <div className="p-7 flex items-center gap-4">

                  <div className={`p-3 rounded-xl ${section.color}`}>
                    <Icon className="w-6 h-6"/>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900">
                    {section.title}
                  </h3>

                </div>


                {/* Card links */}
                <div className="border-t">

                  {section.items.map((item) => (

                    <div
                      key={item}
                      className="flex justify-between items-center px-7 py-4 text-[15px] text-gray-700 hover:bg-gray-50 cursor-pointer"
                    >

                      <span className="font-medium">
                        {item}
                      </span>

                      <ChevronRightIcon className="w-4 h-4 text-gray-400"/>

                    </div>

                  ))}

                </div>

              </div>
            );
          })}

        </div>


        {/* Still Need Help */}
        <div className="bg-[#0F172A] rounded-2xl px-12 py-12 text-center text-white mb-4">

          <h3 className="text-2xl font-semibold mb-2">
            Still need help?
          </h3>

          <p className="text-gray-300 mb-6 max-w-xl mx-auto">
            Can't find the answer you're looking for? Our dedicated support team
            is available 24/7 to help you with any technical or billing issues.
          </p>

          <div className="flex justify-center gap-4">

            <button className="bg-green-600 text-black font-semibold px-6 py-3 rounded-lg flex items-center gap-2">

              <ChatBubbleLeftRightIcon className="w-5"/>

              Chat with us

            </button>

            <button className="bg-gray-700 px-6 py-3 rounded-lg flex items-center gap-2">

              <EnvelopeIcon className="w-5"/>

              Email Support

            </button>

          </div>

        </div>
      </div>
    </div>
  );
}
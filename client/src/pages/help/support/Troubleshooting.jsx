import { useNavigate } from "react-router-dom";

import {
  MagnifyingGlassIcon,
  PaperAirplaneIcon,
  CodeBracketIcon,
  UserCircleIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  ArrowTrendingUpIcon
} from "@heroicons/react/24/solid";

export default function Troubleshooting() {

  const navigate = useNavigate();

  const sections = [
    {
      title: "Messaging & Delivery",
      icon: PaperAirplaneIcon,
      color: "text-green-600",
      items: [
        "Why are my messages failing?",
        "Understanding error codes",
        "Delay in delivery",
        "Rejected message templates"
      ]
    },
    {
      title: "API & Webhooks",
      icon: CodeBracketIcon,
      color: "text-green-600",
      items: [
        "Handling 400 Bad Request",
        "Webhook timeout issues",
        "Invalid token errors",
        "IP Whitelisting setup"
      ]
    },
    {
      title: "Account & Connection",
      icon: UserCircleIcon,
      color: "text-green-600",
      items: [
        "Number disconnected",
        "Business verification failed",
        "Password recovery",
        "Two-factor authentication (2FA) issues"
      ]
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen font-['Urbanist']">

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-5 pb-12">

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs font-semibold mb-3">

          <span
            onClick={() => navigate("/admin/help/support")}
            className="text-gray-400 hover:text-gray-700 cursor-pointer"
          >
            Help Center
          </span>

          <span className="text-gray-300">›</span>

          <span className="text-gray-700">
            Troubleshooting
          </span>

        </div>

        {/* Header */}
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1.5">
          Troubleshooting
        </h1>

        <p className="text-gray-600 text-xs sm:text-sm max-w-xl mb-5">
          Quick fixes and in-depth solutions for common technical,
          messaging, and account-related issues.
        </p>


        {/* Search */}
        <div className="max-w-md mb-6">

          <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-2">

            <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 mr-2"/>

            <input
              placeholder="Search troubleshooting guides..."
              className="outline-none text-xs w-full"
            />

          </div>

        </div>


        {/* Layout */}
        <div className="grid lg:grid-cols-3 gap-8">

          {/* LEFT CONTENT */}
          <div className="lg:col-span-2 space-y-8">

            {sections.map((section) => {

              const Icon = section.icon;

              return (
                <div
                  key={section.title}
                  className="bg-white border border-gray-200 rounded-2xl overflow-hidden"
                >

                  {/* Header */}
                  <div className="p-6 flex items-center gap-3">

                    <Icon className={`w-6 ${section.color}`}/>

                    <h3 className="text-lg font-bold text-gray-900">
                      {section.title}
                    </h3>

                  </div>


                  {/* Items */}
                  <div className="border-t">

                    {section.items.map((item) => (

                      <div
                        key={item}
                        className="flex justify-between items-center px-6 py-3 text-[15px] text-gray-700 hover:bg-gray-50 cursor-pointer"
                      >

                        <span>
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


          {/* RIGHT SIDEBAR */}
          <div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6">

              <div className="flex items-center justify-between mb-4">

                <h3 className="font-bold text-gray-900">
                  Real-time API Status
                </h3>

                <span className="w-3 h-3 bg-green-500 rounded-full"></span>

              </div>


              <div className="space-y-3 text-sm">

                <div className="flex justify-between">

                  <span className="text-gray-600">
                    Messaging API
                  </span>

                  <span className="text-green-600 font-medium">
                    Operational
                  </span>

                </div>

                <div className="flex justify-between">

                  <span className="text-gray-600">
                    Webhook Deliveries
                  </span>

                  <span className="text-green-600 font-medium">
                    Operational
                  </span>

                </div>

                <div className="flex justify-between">

                  <span className="text-gray-600">
                    Dashboard
                  </span>

                  <span className="text-green-600 font-medium">
                    Operational
                  </span>

                </div>

              </div>


              <div className="mt-8 border-t pt-4 flex font-bold items-center gap-2 text-sm text-gray-700 cursor-pointer">

                <ArrowTrendingUpIcon className="w-4"/>

                Detailed Health Dashboard

              </div>

            </div>

          </div>

        </div>


        {/* Still Need Help */}
        <div className="bg-[#0F172A] rounded-2xl px-12 py-12 text-center text-white mt-16 mb-4">

          <h3 className="text-2xl font-semibold mb-2">
            Still need help?
          </h3>

          <p className="text-gray-300 mb-6 max-w-xl mx-auto">
            Can't find the answer you're looking for? Our dedicated support
            team is available 24/7 to help you with any technical or billing issues.
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
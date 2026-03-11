import { useNavigate } from "react-router-dom";

import {
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  DocumentCheckIcon,
  UserIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon
} from "@heroicons/react/24/solid";

export default function WhatsappCompliance() {

  const navigate = useNavigate();

  const sections = [
    {
      title: "Business Verification",
      icon: ShieldCheckIcon,
      color: "bg-blue-100 text-blue-600",
      items: [
        "Meta Business Manager verification",
        "Required documents for India",
        "Linking your phone number"
      ]
    },
    {
      title: "Approval Guidelines",
      icon: DocumentCheckIcon,
      color: "bg-orange-100 text-orange-500",
      items: [
        "Template rejection reasons",
        "Commerce policy explained",
        "Prohibited business categories"
      ]
    },
    {
      title: "User Opt-in & Privacy",
      icon: UserIcon,
      color: "bg-green-100 text-green-600",
      items: [
        "Managing customer opt-ins",
        "Implementing STOP commands",
        "Data handling best practices"
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
            Help Center
          </span>

          <span className="text-gray-400">›</span>

          <span className="text-gray-900">
            WhatsApp Compliance
          </span>

        </div>


        {/* Header */}
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          WhatsApp Compliance
        </h1>

        <p className="text-gray-700 text-lg max-w-2xl mb-8">
          Everything you need to know about Meta's business policies,
          account verification, and template approval guidelines to
          keep your messaging healthy.
        </p>


        {/* Search */}
        <div className="max-w-lg mb-10">

          <div className="flex items-center bg-white border border-gray-200 rounded-xl px-4 py-3">

            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 mr-3"/>

            <input
              placeholder="Search compliance articles..."
              className="outline-none text-sm w-full"
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
                  <div className="p-6 flex items-center gap-4">

                    <div className={`p-3 rounded-xl ${section.color}`}>
                      <Icon className="w-6 h-6"/>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900">
                      {section.title}
                    </h3>

                  </div>


                  {/* Items */}
                  <div className="border-t">

                    {section.items.map((item) => (

                      <div
                        key={item}
                        className="flex justify-between items-center px-6 py-4 text-[15px] text-gray-700 hover:bg-gray-50 cursor-pointer"
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


          {/* RIGHT SIDEBAR */}
          <div className="space-y-6">

            {/* Compliance Score */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">

              <p className="text-xs text-gray-400 uppercase mb-2">
                Compliance Score
              </p>

              <div className="flex items-center justify-between mb-2">

                <h2 className="text-3xl font-bold text-gray-900">
                  98%
                </h2>

                <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                  Healthy
                </span>

              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-gray-200 rounded-full mb-4">

                <div className="h-2 bg-green-500 rounded-full w-[98%]"></div>

              </div>


              {/* Status Items */}
              <div className="space-y-4 text-sm">

                <div className="flex items-center gap-3">

                  <CheckCircleIcon className="w-5 text-green-500"/>

                  <div>
                    <p className="font-medium text-gray-900">
                      Verification
                    </p>
                    <p className="text-gray-500">
                      Approved by Meta
                    </p>
                  </div>

                </div>


                <div className="flex items-center gap-3">

                  <CheckCircleIcon className="w-5 text-green-500"/>

                  <div>
                    <p className="font-medium text-gray-900">
                      Templates
                    </p>
                    <p className="text-gray-500">
                      100% Approval Rate
                    </p>
                  </div>

                </div>


                <div className="flex items-center gap-3">

                  <InformationCircleIcon className="w-5 text-gray-400"/>

                  <div>
                    <p className="font-medium text-gray-900">
                      Next Review
                    </p>
                    <p className="text-gray-500">
                      Scheduled for Oct 24
                    </p>
                  </div>

                </div>

              </div>


              <button className="mt-5 w-full border border-gray-200 py-3 rounded-lg font-medium hover:bg-gray-50">
                Run Compliance Audit
              </button>

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
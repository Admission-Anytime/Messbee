import { useNavigate } from "react-router-dom";

import {
  MagnifyingGlassIcon,
  CreditCardIcon,
  DocumentTextIcon,
  BanknotesIcon,
  ChevronRightIcon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon
} from "@heroicons/react/24/solid";

export default function BillingPlans() {

  const navigate = useNavigate();

  const sections = [
    {
      title: "Subscription Management",
      icon: CreditCardIcon,
      color: "bg-blue-100 text-blue-600",
      items: [
        "Upgrading your plan",
        "Changing billing frequency",
        "Cancellation policy",
        "Managing team seats"
      ]
    },
    {
      title: "Invoices & Taxes",
      icon: DocumentTextIcon,
      color: "bg-orange-100 text-orange-500",
      items: [
        "Downloading your invoices",
        "Updating GST/Tax information",
        "Understanding charges",
        "Payment method recovery"
      ]
    },
    {
      title: "WCC Credits",
      icon: BanknotesIcon,
      color: "bg-green-100 text-green-600",
      items: [
        "Topping up your balance",
        "How conversation credits work",
        "Auto-recharge settings",
        "Credit expiration policy"
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
            Billing &amp; Plans
          </span>

        </div>


        {/* Header */}
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1.5">
          Billing &amp; Plans
        </h1>

        <p className="text-gray-600 text-xs sm:text-sm max-w-xl mb-5">
          Everything you need to know about managing your MessBee subscription,
          WhatsApp credits, and tax invoices.
        </p>


        {/* Search */}
        <div className="max-w-md mb-6">

          <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-2">

            <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 mr-2"/>

            <input
              placeholder="Search billing articles..."
              className="outline-none text-xs w-full"
            />

          </div>

        </div>


        {/* Main Layout */}
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

            {/* CURRENT STATUS */}
            <div className="bg-[#0F172A] text-white rounded-2xl p-6">

              <p className="text-xs text-gray-400 uppercase mb-2">
                Current Status
              </p>

              <p className="text-sm text-gray-400">
                Active Plan
              </p>

              <div className="flex items-center gap-2 mb-4">

                <h3 className="text-xl font-bold">
                  Silver
                </h3>

                <span className="text-xs bg-green-600 px-2 py-1 rounded">
                  Monthly
                </span>

              </div>

              <p className="text-sm text-gray-400">
                Remaining WCC Credits
              </p>

              <p className="text-2xl font-bold text-green-400 mb-4">
                4,280 USD
              </p>

              <button className="w-full bg-green-600 text-black font-semibold py-3 rounded-lg">
                Add Credits
              </button>

            </div>


            {/* Popular Articles */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">

              <h3 className="font-bold text-gray-900 mb-4">
                Popular Articles
              </h3>

              <div className="space-y-3 text-sm">

                <p className="cursor-pointer hover:text-green-600">
                  WhatsApp Pricing Updates 2024
                </p>

                <p className="cursor-pointer hover:text-green-600">
                  Free tier conversations guide
                </p>

                <p className="cursor-pointer hover:text-green-600">
                  Multi-currency billing support
                </p>

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
            Our support team is ready to assist you with complex billing
            queries or subscription adjustments.
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
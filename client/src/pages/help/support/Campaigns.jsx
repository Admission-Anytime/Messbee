import { useNavigate } from "react-router-dom";

import {
  MagnifyingGlassIcon,
  RocketLaunchIcon,
  UsersIcon,
  ClockIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon
} from "@heroicons/react/24/solid";

export default function Campaigns() {

  const navigate = useNavigate();

  const sections = [
    {
      title: "Getting Started",
      icon: RocketLaunchIcon,
      items: [
        "Your first campaign",
        "Campaign types explained",
        "Template selection"
      ]
    },
    {
      title: "Audience & Targeting",
      icon: UsersIcon,
      items: [
        "Importing recipients",
        "Using CRM labels",
        "Segmentation best practices"
      ]
    },
    {
      title: "Scheduling & Optimization",
      icon: ClockIcon,
      items: [
        "Setting a schedule",
        "Rate limits & throttling",
        "Peak engagement times"
      ]
    },
    {
      title: "Reporting & Analytics",
      icon: ChartBarIcon,
      items: [
        "Understanding read rates",
        "Exporting delivery logs",
        "Tracking conversions"
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
            Campaigns
          </span>

        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Campaigns
        </h1>

        <p className="text-gray-700 text-lg max-w-2xl mb-8">
          Learn how to create, schedule, and analyze high-impact WhatsApp
          broadcast campaigns to engage your audience effectively.
        </p>

        {/* Search */}
        <div className="max-w-lg mb-10">

          <div className="flex items-center bg-white border border-gray-200 rounded-xl px-4 py-3">

            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 mr-3"/>

            <input
              placeholder="Search campaign articles..."
              className="outline-none text-sm w-full"
            />

          </div>

        </div>


        {/* Layout */}
        <div className="grid lg:grid-cols-3 gap-8">

          {/* LEFT SECTION */}
          <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">

            {sections.map((section) => {

              const Icon = section.icon;

              return (
                <div
                  key={section.title}
                  className="bg-white border border-gray-200 rounded-2xl p-6"
                >

                  <div className="flex items-center gap-4 mb-4">

                    <div className="bg-green-100 text-green-600 p-3 rounded-lg">
                      <Icon className="w-5 h-5"/>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900">
                      {section.title}
                    </h3>

                  </div>


                  <div className="space-y-3 leading-8 text-sm text-gray-700">

                    {section.items.map((item) => (
                      <p
                        key={item}
                        className="cursor-pointer hover:text-green-600 transition-colors"
                      >
                        {item}
                      </p>
                    ))}

                  </div>


                  <p className="mt-4 text-sm text-green-600 font-medium cursor-pointer">
                    View all articles →
                  </p>

                </div>
              );
            })}

          </div>


          {/* RIGHT SIDEBAR */}
          <div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6">

              <h3 className="font-bold text-gray-900 mb-4">
                Campaign Health
              </h3>

              <p className="text-sm text-gray-600 mb-4">
                Improve your delivery rates and maintain high quality
                scores with these essential tips.
              </p>


              <div className="space-y-3 leading-6 text-sm">

                <div className="flex gap-2 items-start">
                  <CheckCircleIcon className="w-5 text-green-500"/>
                  <p>
                    Maintain an opt-out rate below 1% to avoid Meta bans.
                  </p>
                </div>

                <div className="flex gap-2 items-start">
                  <CheckCircleIcon className="w-5 text-green-500"/>
                  <p>
                    Use personalization tags to increase engagement by up to 40%.
                  </p>
                </div>

                <div className="flex gap-2 items-start">
                  <CheckCircleIcon className="w-5 text-green-500"/>
                  <p>
                    A/B test your message templates for better CTA conversion.
                  </p>
                </div>

              </div>


              <button className="mt-6 w-full border border-gray-200 py-3 rounded-lg font-medium hover:bg-gray-50">
                Check Quality Score
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
            team is available 24/7 to help you with any campaign issues.
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
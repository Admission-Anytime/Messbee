import {
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  PhotoIcon
} from "@heroicons/react/24/solid";

export default function GetStarted() {

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-8 pt-6 pb-12 flex gap-12">

        {/* LEFT ARTICLE */}
        <div className="flex-1 max-w-[720px]">

          {/* Breadcrumb */}
          <p className="text-sm text-gray-500 mb-3">
            Help Center › Getting Started › Connecting Numbers
          </p>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            How to connect your first phone number?
          </h1>

          {/* Meta */}
          <div className="flex items-center gap-6 text-sm text-gray-500 mb-8">
            <span>5-minute read</span>
            <span>Last updated: Oct 12, 2024</span>
          </div>

          {/* Intro */}
          <p className="text-gray-600 mb-8">
            Before you can start sending messages through the MessBee WhatsApp API,
            you need to connect a phone number via the Meta Cloud API. This process
            is handled through our secure Embedded Signup flow.
          </p>

          {/* Prerequisites */}
          <h2 id="prerequisites" className="text-xl font-semibold text-gray-900 mb-3">
            Prerequisites
          </h2>

          <p className="text-gray-600 mb-4">
            To ensure a smooth connection process, please verify you have the following ready:
          </p>

          <ul className="list-disc ml-6 text-gray-600 space-y-2 mb-8">
            <li>A Meta Business Suite account with Administrator access.</li>
            <li>A valid phone number that is not currently registered with WhatsApp.</li>
            <li>Ability to receive SMS or voice verification.</li>
          </ul>

          {/* Pro Tip */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-10 flex gap-3">

            <CheckCircleIcon className="w-6 h-6 text-green-600 mt-1" />

            <p className="text-green-700 text-sm">
              <strong>Pro Tip</strong><br />
              Use a fresh phone number. If you use a number already on WhatsApp,
              you must delete the existing account before beginning this process.
            </p>

          </div>

          {/* Step Guide */}
          <h2 id="connection" className="text-xl font-semibold text-gray-900 mb-6">
            Step-by-Step Connection Guide
          </h2>

          {/* Step 1 */}
          <div className="flex gap-4 mb-6">

            <div className="w-7 h-7 flex items-center justify-center bg-black text-white rounded-full text-sm font-bold">
              1
            </div>

            <div>
              <p className="font-semibold text-gray-900">
                Access the Dashboard
              </p>

              <p className="text-gray-600">
                Log in to your MessBee dashboard and navigate to the
                <span className="font-semibold"> Numbers </span>
                tab in the sidebar menu.
              </p>
            </div>

          </div>

          {/* Step 2 */}
          <div className="flex gap-4 mb-8">

            <div className="w-7 h-7 flex items-center justify-center bg-black text-white rounded-full text-sm font-bold">
              2
            </div>

            <div>
              <p className="font-semibold text-gray-900">
                Start the Connection
              </p>

              <p className="text-gray-600">
                Click the <b>"Add New Number"</b> button. A secure popup window
                will open directing you to the Meta Embedded Signup flow.
              </p>
            </div>

          </div>

          {/* DASHBOARD SCREENSHOT */}
          <div className="mt-12 mb-12">

            <div className="border border-gray-200 rounded-2xl overflow-hidden bg-gray-100">

              {/* Top Browser Bar */}
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 border-b border-gray-200">

                {/* Dots */}
                <span className="w-2.5 h-2.5 bg-gray-300 rounded-full"></span>
                <span className="w-2.5 h-2.5 bg-gray-300 rounded-full"></span>
                <span className="w-2.5 h-2.5 bg-gray-300 rounded-full"></span>

                {/* Title */}
                <span className="ml-3 text-xs text-gray-400 font-medium tracking-wide">
                  MESSBEE DASHBOARD - ADD NUMBER
                </span>

              </div>


              {/* Screenshot Area */}
              <div className="h-[360px] flex flex-col items-center justify-center text-gray-400">

                <PhotoIcon className="w-8 h-8 mb-3 text-gray-400" />

                <p className="text-sm text-gray-500">
                  Dashboard interface screenshot
                </p>

              </div>

            </div>

          </div>

          {/* Verification */}
          <h3 id="verification" className="font-semibold text-gray-900 mb-3">
            Verifying your Number
          </h3>

          <p className="text-gray-600 mb-12">
            Once you've selected your Business Account and WABA, Meta will ask
            for your phone number. Select <b>"SMS"</b> or <b>"Voice Call"</b> to
            receive your 6-digit verification code. Enter this code to finalize
            the connection.
          </p>

          {/* Helpful Section */}
          <div className="text-center border-t pt-8">

            <p className="font-semibold text-gray-800 mb-4">
              Was this article helpful?
            </p>

            <div className="flex justify-center gap-4">

              <button className="flex items-center gap-2 border border-gray-200 px-6 py-2 rounded-lg hover:bg-gray-100">

                <HandThumbUpIcon className="w-4 h-4 text-black" />

                Yes

              </button>

              <button className="flex items-center gap-2 border border-gray-200 px-6 py-2 rounded-lg hover:bg-gray-100">

                <HandThumbDownIcon className="w-4 h-4 text-black" />

                No

              </button>

            </div>

          </div>

        </div>


        {/* RIGHT SIDEBAR */}
        <div className="w-[260px] shrink-0">

          <div className="space-y-8">

            {/* On this page */}
            <div>

              <p className="text-xs font-semibold text-gray-400 mb-3 uppercase">
                On this page
              </p>

              <ul className="space-y-2 text-sm">

                <li>
                  <a href="#prerequisites" className="text-green-600 font-medium">
                    Prerequisites
                  </a>
                </li>

                <li>
                  <a href="#connection" className="text-gray-600 hover:text-gray-800">
                    Connection Guide
                  </a>
                </li>

                <li>
                  <a href="#verification" className="text-gray-600 hover:text-gray-800">
                    Verifying Number
                  </a>
                </li>

              </ul>

            </div>


            {/* Related Articles */}
            <div>

              <p className="text-xs font-semibold text-gray-400 mb-3 uppercase">
                Related Articles
              </p>

              <div className="space-y-4 text-sm">

                <div>
                  <p className="font-medium text-gray-800">
                    WhatsApp Business Compliance
                  </p>
                  <p className="text-gray-500 text-xs">
                    3 min read
                  </p>
                </div>

                <div>
                  <p className="font-medium text-gray-800">
                    Profile Configuration Guide
                  </p>
                  <p className="text-gray-500 text-xs">
                    4 min read
                  </p>
                </div>

                <div>
                  <p className="font-medium text-gray-800">
                    Choosing the right Plan
                  </p>
                  <p className="text-gray-500 text-xs">
                    2 min read
                  </p>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>


      {/* STILL NEED HELP SECTION */}

      <div className="max-w-7xl mx-auto px-8 pb-12">

        <div className="bg-[#0F172A] rounded-2xl p-10 text-center text-white">

          <h3 className="text-2xl font-semibold mb-3">
            Still need help?
          </h3>

          <p className="text-gray-300 mb-6">
            Can't find the answer you're looking for? Our dedicated support team
            is available 24/7 to help you with any technical or billing issues.
          </p>

          <div className="flex justify-center gap-4">

            <button className="bg-green-600 text-black font-semibold px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-green-700">

              <ChatBubbleLeftRightIcon className="w-5" />

              Chat with us

            </button>

            <button className="bg-gray-700 px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-gray-600">

              <EnvelopeIcon className="w-5" />

              Email Support

            </button>

          </div>

        </div>

      </div>


      {/* FOOTER */}

      <div className="mt-auto pt-6 pb-4 flex flex-col-reverse md:flex-row justify-between items-center text-xs text-slate-400 font-medium border-t border-slate-100 gap-4 px-8">

        <p>© 2024 whatsapp API Platform. All rights reserved @ MessBee.</p>

        <div className="flex gap-6">

          <a href="#" className="hover:text-slate-600 transition-colors">
            Privacy Policy
          </a>

          <a href="#" className="hover:text-slate-600 transition-colors">
            Terms of Service
          </a>

          <a href="#" className="hover:text-slate-600 transition-colors">
            API Status
          </a>

        </div>

      </div>

    </div>
  );
}
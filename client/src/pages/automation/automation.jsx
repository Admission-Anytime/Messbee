
import  { useState } from "react";
// import MainSidebar from "../../components/mainsidebar/MainSidebar";
import { MessageSquare, Umbrella, Bot, RotateCcw } from 'lucide-react';

const Automation = () => {
  const [welcomeEnabled, setWelcomeEnabled] = useState(false);
  const [awayEnabled, setAwayEnabled] = useState(false);
  const [fallbackEnabled, setFallbackEnabled] = useState(false);
  const [chatbotEnabled, setChatbotEnabled] = useState(false);

  return (
    <div className="flex w-full min-h-screen bg-gray-50">
      {/* <MainSidebar /> */}
      
      <div className="flex-1 w-full overflow-auto">
        {/* Header Section */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
          <div className="max-w-7xl">
            <h1 className="text-2xl font-bold text-gray-900">Automation</h1>
            <p className="text-sm text-gray-600 mt-1">
              Set up automations that manage your conversation and streamline your workflows
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 max-w-7xl">
          {/* Greet People Section */}
          <div className="mb-10">
            <h2 className="text-xl font-semibold mb-5 text-gray-900">
              Greet People
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Welcome Message Card */}
              <div className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg border border-gray-200 hover:border-blue-400 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform duration-300">
                      <MessageSquare size={20} />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900">Welcome message</h3>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={welcomeEnabled}
                      onChange={(e) => setWelcomeEnabled(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>
                <p className="text-gray-600 text-sm mb-5 leading-relaxed">
                  Welcome new customer automatically
                </p>
                <button className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200">
                  Set Message
                </button>
              </div>

              {/* Away Message Card */}
              <div className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg border border-gray-200 hover:border-blue-400 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform duration-300">
                      <Umbrella size={20} />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900">Away message</h3>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={awayEnabled}
                      onChange={(e) => setAwayEnabled(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>
                <p className="text-gray-600 text-sm mb-5 leading-relaxed">
                  Reply automatically when you are away
                </p>
                <button className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200">
                  Set Message
                </button>
              </div>
            </div>
          </div>

          {/* Advance Automation Section */}
          <div>
            <h2 className="text-xl font-semibold mb-2 text-gray-900">
              Advance Automation
            </h2>
            <p className="text-gray-600 text-sm mb-5">
              Automate repetitive processes with advance chat bot builder
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Chatbot Builder Card */}
              <div className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg border border-gray-200 hover:border-blue-400 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <label className="flex items-center mb-4 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    checked={chatbotEnabled}
                    onChange={(e) => setChatbotEnabled(e.target.checked)}
                  />
                </label>
                
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform duration-300">
                    <Bot size={20} />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">Chatbot builder</h3>
                </div>
                <p className="text-gray-600 text-sm mb-5 leading-relaxed">
                  Build with drag and drop chatbot builder to automate advance trigger based on keywords, template message and more
                </p>
                <div className="flex gap-3 flex-wrap">
                  <button className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200">
                    View Chatbots
                  </button>
                  <button className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white  shadow-sm hover:shadow-md transition-all duration-200">
                    Create Automation
                  </button>
                </div>
              </div>

              {/* Fallback Message Card */}
              <div className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg border border-gray-200 hover:border-blue-400 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform duration-300">
                      <RotateCcw size={20} />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900">Fallback message</h3>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={fallbackEnabled}
                      onChange={(e) => setFallbackEnabled(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>
                <p className="text-gray-600 text-sm mb-5 leading-relaxed">
                  Send fallback message when no keywords or trigger for automation matches
                </p>
                <button className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200">
                  Set Message
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default Automation;





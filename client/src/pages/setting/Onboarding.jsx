import React, { useState, useEffect } from "react";
import { CheckCircle2, Circle, ArrowRight, Smartphone, MessageSquare, Users, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "../../context/axios";

export default function Onboarding() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [steps, setSteps] = useState([
    {
      id: "whatsapp",
      title: "Connect WhatsApp API",
      description: "Link your WhatsApp Business account to start sending and receiving messages.",
      icon: <Smartphone className="w-6 h-6 text-blue-500" />,
      completed: false,
      actionText: "Configure Now",
      path: "/admin/setting/wapi"
    },
    {
      id: "welcome",
      title: "Setup Welcome Message",
      description: "Create an automated welcome message for new customers who reach out.",
      icon: <MessageSquare className="w-6 h-6 text-amber-500" />,
      completed: false,
      actionText: "Create Message",
      path: "/admin/automation/welcome-message"
    },
    {
      id: "team",
      title: "Invite Team Members",
      description: "Add agents and managers to collaborate on responding to customer chats.",
      icon: <Users className="w-6 h-6 text-green-500" />,
      completed: false,
      actionText: "Manage Team",
      path: "/admin/setting/manage-teams"
    },
    {
      id: "templates",
      title: "Create Message Templates",
      description: "Submit templates to Meta for approval to send outbound notifications.",
      icon: <BookOpen className="w-6 h-6 text-purple-500" />,
      completed: false,
      actionText: "View Templates",
      path: "/admin/setting/templates"
    }
  ]);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setLoading(true);
        // We will do a lightweight check on various endpoints to determine completion
        
        // 1. Check WhatsApp Config
        const waRes = await axios.get("/settings/whatsapp_config");
        const hasWaConfig = !!waRes.data?.value?.businessAccountId;

        // 2. Check Welcome Message (Tenant Settings)
        const tenantRes = await axios.get("/tenant-settings");
        const hasWelcome = tenantRes.data?.welcomeMessage?.enabled || false;

        // 3. Check Team Members
        const teamRes = await axios.get("/users");
        // Ensure data is array and has more than just the current user
        const hasTeam = Array.isArray(teamRes.data?.data) && teamRes.data.data.length > 1;

        // 4. Check Templates
        const templatesRes = await axios.get("/whatsapp/templates");
        const hasTemplates = Array.isArray(templatesRes.data?.data) && templatesRes.data.data.length > 0;

        setSteps(prev => prev.map(step => {
          if (step.id === "whatsapp") return { ...step, completed: hasWaConfig };
          if (step.id === "welcome") return { ...step, completed: hasWelcome };
          if (step.id === "team") return { ...step, completed: hasTeam };
          if (step.id === "templates") return { ...step, completed: hasTemplates };
          return step;
        }));
      } catch (error) {
        console.error("Error fetching onboarding progress", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, []);

  const completedCount = steps.filter(s => s.completed).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="max-w-4xl mx-auto p-6 animate-fade-in">
      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      
      {/* Header Card */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl mb-8 relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Welcome to Messbee! 🐝</h1>
          <p className="text-blue-100 max-w-lg mb-8">
            Let's get your workspace completely set up. Follow these quick steps to unlock the full power of your WhatsApp automation.
          </p>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-lg">Setup Progress</span>
              <span className="font-bold text-lg">{progressPercent}%</span>
            </div>
            <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-400 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-sm text-blue-100 mt-3 font-medium">
              {completedCount === steps.length 
                ? "🎉 All caught up! You are ready to go." 
                : `You have completed ${completedCount} out of ${steps.length} essential steps.`}
            </p>
          </div>
        </div>

        {/* Decorative background shapes */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-32 -mb-10 w-48 h-48 bg-blue-400 opacity-20 rounded-full blur-2xl"></div>
      </div>

      {/* Checklist */}
      <div className="space-y-4">
        {loading ? (
          // Skeleton loading state
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4 animate-pulse">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-100 rounded w-2/3"></div>
              </div>
            </div>
          ))
        ) : (
          steps.map((step, index) => (
            <div 
              key={step.id} 
              className={`group bg-white rounded-2xl p-6 border transition-all duration-300 ${
                step.completed 
                  ? "border-green-200 bg-green-50/30" 
                  : "border-gray-100 hover:border-blue-200 hover:shadow-md"
              }`}
            >
              <div className="flex items-start gap-5">
                {/* Icon Circle */}
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors ${
                  step.completed ? "bg-green-100" : "bg-gray-50 group-hover:bg-blue-50"
                }`}>
                  {step.completed ? (
                    <CheckCircle2 className="w-7 h-7 text-green-500" />
                  ) : (
                    step.icon
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className={`text-lg font-bold mb-1 ${step.completed ? "text-gray-900" : "text-gray-900"}`}>
                    {step.title}
                  </h3>
                  <p className="text-gray-500 text-sm mb-4 leading-relaxed">
                    {step.description}
                  </p>
                  
                  {/* Action Button */}
                  {!step.completed && (
                    <button 
                      onClick={() => navigate(step.path)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg text-sm font-semibold transition-colors"
                    >
                      {step.actionText}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                  {step.completed && (
                    <span className="inline-flex items-center gap-1.5 text-sm font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                      <CheckCircle2 className="w-4 h-4" /> Completed
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
    </div>
  );
}

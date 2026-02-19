import { Suspense, lazy } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ConfigProvider } from "antd";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loading from "./components/Loading";

// ❌ COMMENTED OUT AUTH GUARD FOR NOW
// import ProtectedRoute from "../routes/protectedRoute";

// --- LAYOUT ---
import Layout from "./components/LAYOUT/Layout";

// --- AUTH PAGES ---
const Login = lazy(() => import("./pages/Auth/Login"));
const Registration = lazy(() => import("./pages/Auth/Registration"));

// --- MAIN PAGES ---
import Dashboard from "./pages/dashboard-paid";
import NotificationPage from './pages/Notification/NotificationPage';
import Chat from "./pages/chat/chat";
import Campaign from "./pages/campaign/campaign";
import CreateCampaign from "./pages/campaign/CreateCampaign";
import Automation from "./pages/automation/automation";
import Analytic from "./pages/analytic/analytic";

// --- PLAN & PRICING PAGES ---
import UpgradePlan from "./pages/PlanPricing/UpgradePlan";
import AddonsWCC from "./pages/PlanPricing/AddonsWCC";
import ActivePlan from "./pages/PlanPricing/ActivePlan";
import PaymentHistory from "./pages/PlanPricing/PaymentHistory";
import PaymentMethods from "./pages/PlanPricing/PaymentMethods";

// --- CONTACTS ---
import Contact from "./pages/contats/contact"; 
import StatusPage from "./pages/contats/Status/StatusPage"; 

// --- SETTINGS ---
import Wapi from "./pages/setting/Wapi";
import Media from "./pages/setting/Media";
import Templates from "./pages/setting/Templates";
import TemplatesGallery from "./pages/setting/TamplatesGallery";
import Label from "./pages/setting/Label";
import CustomField from "./pages/setting/CustomField";
import QuickReply from "./pages/setting/QuickReply";
import DevApi from "./pages/setting/DevApi";

// --- PROFILE ---
import UserProfile from "./pages/profile/UserProfile";
import BusinessProfile from "./pages/profile/BusinessProfile";
import ActivePlans from "./pages/profile/ActivePlans"; 

// --- 404 COMPONENT ---
const NotFound = () => {
  const location = useLocation();
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-gray-800">404</h2>
        <p className="text-gray-600 mt-2">Page not found: <code>{location.pathname}</code></p>
      </div>
    </div>
  );
};

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          fontFamily: "Urbanist, Poppins, sans-serif",
          colorPrimary: "#ba2525",
        },
      }}
    >
      <ToastContainer 
        position="top-right"
        autoClose={4000}
        hideProgressBar={true}
        newestOnTop={true}
        closeOnClick={false}
        theme="light"
        toastClassName="!bg-transparent !shadow-none !p-0 !min-h-0 !mb-4"
        bodyClassName="!m-0 !p-0"
      />
      
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* --- PUBLIC ROUTES --- */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Registration />} />

          {/* ✅ REMOVED ProtectedRoute: Anyone can view these pages now without logging in */}
          <Route element={<Layout />}>
            
            {/* 1. Dashboard */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/admin/dashboard" element={<Navigate to="/" replace />} />
            
            {/* 2. Notifications */}
            <Route path="/admin/notifications" element={<NotificationPage />} />

            {/* 3. Chat */}
            <Route path="/admin/chat" element={<Chat />} />

            {/* 4. Contacts & CRM */}
            <Route path="/admin/contacts" element={<Contact />} /> 
            <Route path="/admin/contacts/list" element={<Contact />} /> 
            <Route path="/admin/contacts/labels" element={<Label />} />
            <Route path="/admin/contacts/fields" element={<CustomField />} />
            <Route path="/admin/contacts/quick-reply" element={<QuickReply />} />
            <Route path="/admin/contacts/quick-replies" element={<QuickReply />} />
            <Route path="/admin/contacts/status" element={<StatusPage />} />
            <Route path="/admin/contacts/crm" element={<div className="p-10 text-xl font-bold text-slate-700">CRM Pipeline</div>} />

            {/* 5. Templates */}
            <Route path="/admin/templates/list" element={<Templates />} />
            <Route path="/admin/campaigns/templates" element={<Templates />} />
            <Route path="/admin/templates/gallery" element={<TemplatesGallery />} />

            {/* 6. Campaigns */}
            <Route path="/admin/campaign" element={<Campaign />} />
            <Route path="/admin/campaigns" element={<Campaign />} />
            <Route path="/admin/campaign/create" element={<CreateCampaign />} />
            <Route path="/admin/campaigns/bulk" element={<div className="p-10 text-xl font-bold text-slate-700">Bulk Send</div>} />

            {/* 7. Commerce */}
            <Route path="/admin/commerce/payments" element={<div className="p-10 text-xl font-bold text-slate-700">Payment List</div>} />
            <Route path="/admin/commerce/products" element={<div className="p-10 text-xl font-bold text-slate-700">Product List</div>} />

            {/* 8. Automation */}
            <Route path="/admin/automation" element={<Automation />} />

            {/* 9. Analytics */}            
            <Route path="/admin/analytic" element={<Analytic />} />
            <Route path="/admin/analytic/conversation" element={<div className="p-10 text-xl font-bold text-slate-700">Conversation Analytics</div>} />
            <Route path="/admin/analytic/messages" element={<div className="p-10 text-xl font-bold text-slate-700">Message Analytics</div>} />
            <Route path="/admin/analytic/template" element={<div className="p-10 text-xl font-bold text-slate-700">Template Analytics</div>} />
            <Route path="/admin/reports" element={<div className="p-10 text-xl font-bold text-slate-700">Reports</div>} />
            <Route path="/admin/alerts" element={<div className="p-10 text-xl font-bold text-slate-700">Alerts</div>} />
            <Route path="/admin/business" element={<div className="p-10 text-xl font-bold text-slate-700">Business Management</div>} />

            {/* 10. Integrations */}
            <Route path="/admin/api" element={<DevApi />} />
            <Route path="/admin/developer/api" element={<DevApi />} /> 
            <Route path="/admin/integration/api" element={<DevApi />} />
            <Route path="/admin/integration/apps" element={<div className="p-10 text-xl font-bold text-slate-700">App Connect</div>} />

            {/* 11. Settings */}
            <Route path="/admin/settings/whatsapp" element={<Wapi />} />
            <Route path="/admin/settings/media" element={<Media />} />

            {/* 12. Plan & Pricing */}
            <Route path="/admin/plan/upgrade" element={<UpgradePlan />} />
            <Route path="/admin/plan/addons" element={<AddonsWCC />} />
            <Route path="/admin/plan/active" element={<ActivePlan />} />
            <Route path="/admin/plan/history" element={<PaymentHistory />} />
            <Route path="/admin/plan/methods" element={<PaymentMethods />} />

            {/* 13. Profile & Account */}
            <Route path="/admin/account/admin" element={<div className="p-10 text-xl font-bold text-slate-700">Admin Users</div>} />
            <Route path="/admin/account/settings" element={<div className="p-10 text-xl font-bold text-slate-700">Settings</div>} />
            <Route path="/admin/account/profile" element={<UserProfile />} />
            <Route path="/admin/account/plan" element={<ActivePlans />} />
            <Route path="/admin/profile/info" element={<UserProfile />} /> 
            <Route path="/admin/profile/business" element={<BusinessProfile />} />

            {/* 14. Help */}
            <Route path="/admin/help/docs" element={<div className="p-10 text-xl font-bold text-slate-700">Documentation</div>} />
            <Route path="/admin/help/support" element={<div className="p-10 text-xl font-bold text-slate-700">Support</div>} />
            <Route path="/admin/help/faqs" element={<div className="p-10 text-xl font-bold text-slate-700">FAQs</div>} />

          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ConfigProvider>
  );
}

export default App;
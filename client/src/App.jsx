import { Suspense, lazy } from "react";
import { Routes, Route, Navigate, useLocation, Outlet } from "react-router-dom";
import { ConfigProvider } from "antd";
import Loading from "./components/Loading";
import ProtectedRoute from "../routes/protectedRoute";

// --- 1. LAYOUT & SIDEBAR ---
import MainSidebar from "./components/mainsidebar/MainSidebar"; 

// --- 2. AUTH PAGES (Keep Lazy to speed up initial site load) ---
const Login = lazy(() => import("./pages/Auth/Login"));
const Registration = lazy(() => import("./pages/Auth/Registration"));

// --- 3. MAIN PAGES (STANDARD IMPORTS - No Loading Flicker) ---
// We import these directly so they are ready instantly.
import Dashboard from "./pages/dashboard-paid";
import Chat from "./pages/chat/chat";
import Contact from "./pages/contats/contact";
import Campaign from "./pages/campaign/campaign";
import CreateCampaign from "./pages/campaign/CreateCampaign";
import Automation from "./pages/automation/automation";
import Analytic from "./pages/analytic/analytic";

// --- 4. SETTINGS & SUB-PAGES (STANDARD IMPORTS) ---
import Wapi from "./pages/setting/Wapi";
import Media from "./pages/setting/Media";
import Templates from "./pages/setting/Templates";
import TemplatesGallery from "./pages/setting/TamplatesGallery";
import Label from "./pages/setting/Label";
import CustomField from "./pages/setting/CustomField";
import Status from "./pages/setting/Status";
import QuickReply from "./pages/setting/QuickReply";
import DevApi from "./pages/setting/DevApi";

// --- 5. PROFILE & PLAN (STANDARD IMPORTS) ---
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

// --- LAYOUT WRAPPER ---
const AppLayout = () => {
  return (
    <div className="flex w-full min-h-screen bg-[#faf9f7] font-['Urbanist']">
      <MainSidebar />
      <div className="flex-1 overflow-auto h-screen relative">
        <Outlet />
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
      {/* Suspense only for Auth pages now */}
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* --- PUBLIC ROUTES --- */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Registration />} />

          {/* --- PROTECTED ROUTES --- */}
          <Route element={<ProtectedRoute Component={AppLayout} />}>
            
            {/* 1. Dashboard */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/admin/dashboard" element={<Navigate to="/" replace />} />

            {/* 2. Chat */}
            <Route path="/admin/chat" element={<Chat />} />

            {/* 3. Contacts & CRM */}
            <Route path="/admin/contact" element={<Contact />} /> 
            <Route path="/admin/contacts/list" element={<Contact />} /> 
            <Route path="/admin/contacts/labels" element={<Label />} />
            <Route path="/admin/contacts/fields" element={<CustomField />} />
            <Route path="/admin/contacts/quick-reply" element={<QuickReply />} />
            <Route path="/admin/contacts/quick-replies" element={<QuickReply />} />
            <Route path="/admin/contacts/status" element={<Status />} />
            <Route path="/admin/contacts/crm" element={<div className="p-10 font-bold text-2xl text-slate-700">CRM Pipeline Page</div>} />

            {/* 4. Campaigns */}
            <Route path="/admin/campaign" element={<Campaign />} />
            <Route path="/admin/campaigns" element={<Campaign />} />
            <Route path="/admin/campaign/create" element={<CreateCampaign />} />
            <Route path="/admin/campaigns/templates" element={<Templates />} />
            <Route path="/admin/templates/list" element={<Templates />} />
            <Route path="/admin/templates/gallery" element={<TemplatesGallery />} />
            <Route path="/admin/campaigns/bulk" element={<div className="p-10 font-bold text-2xl text-slate-700">Bulk Send Page</div>} />

            {/* 5. Automation */}
            <Route path="/admin/automation" element={<Automation />} />

            {/* 6. Analytics & Reports */}            
            <Route path="/admin/analytic" element={<Analytic />} />
            <Route path="/admin/reports" element={<div className="p-10 font-bold text-2xl text-slate-700">Reports & Analytics Page</div>} />
            <Route path="/admin/alerts" element={<div className="p-10 font-bold text-2xl text-slate-700">System Alerts Page</div>} />
            <Route path="/admin/business" element={<div className="p-10 font-bold text-2xl text-slate-700">Business Management Page</div>} />

            {/* 7. Integrations & API */}
            <Route path="/admin/api" element={<DevApi />} />
            <Route path="/admin/developer/api" element={<DevApi />} /> 
            <Route path="/admin/integration/api" element={<DevApi />} />
            <Route path="/admin/integration/apps" element={<div className="p-10 font-bold text-2xl text-slate-700">App Connect Page</div>} />

            {/* 8. Settings */}
            <Route path="/admin/settings/whatsapp" element={<Wapi />} />
            <Route path="/admin/settings/media" element={<Media />} />

            {/* 9. Account & Plans */}
            <Route path="/admin/plan/overview" element={<div className="p-10 font-bold text-2xl text-slate-700">Current Subscription Page</div>} />
            <Route path="/admin/plan/billing" element={<ActivePlans />} />
            <Route path="/admin/account/admin" element={<div className="p-10 font-bold text-2xl text-slate-700">Admin Users Page</div>} />
            <Route path="/admin/account/settings" element={<div className="p-10 font-bold text-2xl text-slate-700">Account Settings Page</div>} />
            <Route path="/admin/account/profile" element={<UserProfile />} />
            <Route path="/admin/account/plan" element={<ActivePlans />} />

            {/* 10. Help */}
            <Route path="/admin/help/docs" element={<div className="p-10 font-bold text-2xl text-slate-700">Documentation Page</div>} />
            <Route path="/admin/help/support" element={<div className="p-10 font-bold text-2xl text-slate-700">Contact Support Page</div>} />
            <Route path="/admin/help/faqs" element={<div className="p-10 font-bold text-2xl text-slate-700">FAQs Page</div>} />

            {/* Legacy Profile Routes */}
            <Route path="/admin/profile/info" element={<UserProfile />} /> 
            <Route path="/admin/profile/business" element={<BusinessProfile />} />

          </Route>

          {/* --- 404 Catch All --- */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ConfigProvider>
  );
}

export default App;
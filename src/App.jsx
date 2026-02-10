import { Suspense, lazy } from "react";
import { Routes, Route, Navigate, useLocation, Outlet } from "react-router-dom";
import { ConfigProvider } from "antd";
import Loading from "./components/Loading";
import ProtectedRoute from "../routes/protectedRoute";


// --- 1. LAYOUT & SIDEBAR ---
import MainSidebar from "./components/mainsidebar/MainSidebar"; 

// --- 2. AUTH PAGES ---
const Login = lazy(() => import("./pages/Auth/Login"));
const Registration = lazy(() => import("./pages/Auth/Registration"));

// --- 3. MAIN PAGES ---
const Dashboard = lazy(() => import("./pages/dashboard-paid"));
const Chat = lazy(() => import("./pages/chat/chat"));
const Contact = lazy(() => import("./pages/contats/contact"));
const Campaign = lazy(() => import("./pages/campaign/campaign"));
const CreateCampaign = lazy(() => import("./pages/campaign/CreateCampaign"));
const Automation = lazy(() => import("./pages/automation/automation"));
const Analytic = lazy(() => import("./pages/analytic/analytic"));

// --- 4. SETTINGS & SUB-PAGES ---
const Wapi = lazy(() => import("./pages/setting/Wapi"));
const Media = lazy(() => import("./pages/setting/Media"));
const Templates = lazy(() => import("./pages/setting/Templates"));
const TemplatesGallery = lazy(() => import("./pages/setting/TamplatesGallery"));
const Label = lazy(() => import("./pages/setting/Label"));
const CustomField = lazy(() => import("./pages/setting/CustomField"));
const Status = lazy(() => import("./pages/setting/Status"));
const QuickReply = lazy(() => import("./pages/setting/QuickReply"));
const DevApi = lazy(() => import("./pages/setting/DevApi"));

// --- 5. PROFILE & PLAN ---
const UserProfile = lazy(() => import("./pages/profile/UserProfile"));
const BusinessProfile = lazy(() => import("./pages/profile/BusinessProfile"));
const UpgradePlans = lazy(() => import("./pages/profile/UpgradePlans"));
const ActivePlans = lazy(() => import("./pages/profile/ActivePlans")); 

// --- 6. HELP SECTION (NEW) ---
const Help = lazy(() => import("./pages/help/help")); 
const Introduction = lazy(() => import("./pages/help/introduction"));
const Support = lazy(() => import("./pages/help/Support")); 
const Faq = lazy(() => import("./pages/help/Faq"));        

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
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* --- PUBLIC ROUTES --- */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Registration />} />

          {/* --- PROTECTED ROUTES (Wrapped in AppLayout) --- */}
          <Route element={<ProtectedRoute Component={AppLayout} />}>
            
            {/* 1. Dashboard */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/admin/dashboard" element={<Navigate to="/" replace />} />

            {/* 2. Notifications */}
            <Route path="/admin/notifications" element={<div>Notifications Page</div>} />

            {/* 3. Chat */}
            <Route path="/admin/chat" element={<Chat />} />

            
            {/* 4. Contacts & CRM */}
            <Route path="/admin/contact" element={<Contact />} /> 
              {/* Sidebar Link: "All Contacts" */}
              <Route path="/admin/contacts/list" element={<Contact />} /> 
              {/* Sidebar Link: "Labels" */}
              <Route path="/admin/contacts/labels" element={<Label />} />
              <Route path="/admin/contacts/fields" element={<CustomField />} />
              {/* Sidebar Link: "Quick Replies" */}
              <Route path="/admin/contacts/quick-reply" element={<QuickReply />} />
              {/* Sidebar Link: "Contact Status" */}
            <Route path="/admin/contacts/status" element={<Status />} />


            {/* 5. Templates */}
            <Route path="/admin/templates/list" element={<Templates />} />
            <Route path="/admin/templates/create" element={<div>Create Template Page</div>} />
            <Route path="/admin/templates/gallery" element={<TemplatesGallery />} />

            {/* 6. Campaign */}
            <Route path="/admin/campaign" element={<Campaign />} />
            <Route path="/admin/campaigns" element={<Campaign />} /> {/* Added for safety */}
            <Route path="/admin/campaign/create" element={<CreateCampaign />} />

            {/* 7. Commerce */}
            <Route path="/admin/commerce/products" element={<div>Product List</div>} />
            <Route path="/admin/commerce/orders" element={<div>Orders & Payments</div>} />

            {/* 8. Automation */}
            <Route path="/admin/automation" element={<Automation />} />

            {/* 9. Analytics */}            
            {/* Main Page */}
            <Route path="/admin/analytic" element={<Analytic />} />
              {/* Conversation / Conversations */}
              <Route path="/admin/analytics/conversation" element={<Analytic />} />
              <Route path="/admin/analytics/conversations" element={<Analytic />} />
              {/* Messages / Message Reports */}
            <Route path="/admin/analytics/messages" element={<Analytic />} />
            
            {/* Campaign / Campaign Stats */}
            <Route path="/admin/analytics/campaign" element={<Analytic />} />
            <Route path="/admin/analytics/campaigns" element={<Analytic />} />
            <Route path="/admin/analytics/campaign-stats" element={<Analytic />} />
            
            {/* Templates */}
            <Route path="/admin/analytics/template" element={<Analytic />} />
            
           {/* 10. Developer API*/}
            <Route path="/admin/api" element={<DevApi />} />
            <Route path="/admin/developer/api" element={<DevApi />} /> 
            <Route path="/admin/developer-api" element={<DevApi />} />

            {/* App Integration */}
            <Route path="/admin/developer/integrations" element={<div className="p-10 font-bold text-2xl text-slate-700">App Integrations Page</div>} />
            <Route path="/admin/integrations" element={<div className="p-10 font-bold text-2xl text-slate-700">App Integrations Page</div>} />
            <Route path="/admin/app-integration" element={<div className="p-10 font-bold text-2xl text-slate-700">App Integrations Page</div>} />


            {/* 11. Settings */}
            
            {/* WhatsApp Config - Catching multiple variations */}
            <Route path="/admin/settings/whatsapp" element={<Wapi />} />
            <Route path="/admin/settings/whatsapp-config" element={<Wapi />} />
            <Route path="/admin/settings/wapi" element={<Wapi />} />
            <Route path="/admin/settings/whatsapp-number" element={<Wapi />} />

            {/* Team Management - Catching multiple variations */}
            <Route path="/admin/settings/team" element={<div className="p-10 font-bold text-2xl text-slate-700">Team Management Page</div>} />
            <Route path="/admin/settings/teams" element={<div className="p-10 font-bold text-2xl text-slate-700">Team Management Page</div>} />
            <Route path="/admin/settings/team-management" element={<div className="p-10 font-bold text-2xl text-slate-700">Team Management Page</div>} />

            {/* Media Gallery (Keeping this as it likely works or uses the same pattern) */}
            <Route path="/admin/settings/media" element={<Media />} />
            <Route path="/admin/settings/media-gallery" element={<Media />} />


            {/* 12. HELP SECTION */}
            <Route path="/admin/help/docs" element={<div className="p-10 font-bold text-2xl text-slate-700">Documentation Page</div>} />
            <Route path="/admin/help/support" element={<div className="p-10 font-bold text-2xl text-slate-700">Contact Support Page</div>} />
            <Route path="/admin/help/faqs" element={<div className="p-10 font-bold text-2xl text-slate-700">FAQs Page</div>} />

            {/* Handle the main help link too */}
            <Route path="/admin/help" element={<Navigate to="/admin/help/docs" replace />} />

            {/* 13. Plan & Pricing */}
            <Route path="/admin/plan/overview" element={<div className="p-10 font-bold text-2xl text-slate-700">Current Subscription Page</div>} />
            {/* Keep this one if it's working */}
            <Route path="/admin/plan/billing" element={<ActivePlans />} />
            {/* Optional: Redirect base /admin/plan to overview */}
            <Route path="/admin/plan" element={<Navigate to="/admin/plan/overview" replace />} />

            {/* 14. Profile */}
            
            {/*admin/profile/info*/}
            <Route path="/admin/profile" element={<Navigate to="/admin/profile/info" replace />} />
            
            {/* Existing Profile Routes */}
            <Route path="/admin/profile/info" element={<UserProfile />} /> 
            <Route path="/admin/profile/business" element={<BusinessProfile />} />
            
            {/* Catch-all for legacy routes */}
            <Route path="/admin/profile/user/:id" element={<UserProfile />} />

            {/* --- MISSING CUSTOMER ROUTES --- */}
            <Route path="/admin/contacts/crm" element={<div className="p-10 font-bold text-2xl text-slate-700">CRM Pipeline Page</div>} />
            {/* Fix: Sidebar uses 'quick-replies' (plural), App uses 'quick-reply' */}
            <Route path="/admin/contacts/quick-replies" element={<QuickReply />} />


            {/* --- MISSING CAMPAIGN ROUTES --- */}
            {/* Fix: Sidebar uses '/admin/campaigns/templates' */}
            <Route path="/admin/campaigns/templates" element={<Templates />} />
            <Route path="/admin/campaigns/bulk" element={<div className="p-10 font-bold text-2xl text-slate-700">Bulk Send Page</div>} />


            {/* --- MISSING MAIN MENU ROUTES --- */}
            <Route path="/admin/business" element={<div className="p-10 font-bold text-2xl text-slate-700">Business Management Page</div>} />
            <Route path="/admin/reports" element={<div className="p-10 font-bold text-2xl text-slate-700">Reports & Analytics Page</div>} />
            <Route path="/admin/alerts" element={<div className="p-10 font-bold text-2xl text-slate-700">System Alerts Page</div>} />


            {/* --- MISSING INTEGRATION ROUTES --- */}
            {/* Mapping Sidebar paths to existing components or new placeholders */}
            <Route path="/admin/integration/api" element={<DevApi />} />
            <Route path="/admin/integration/apps" element={<div className="p-10 font-bold text-2xl text-slate-700">App Connect Page</div>} />


            {/* --- MISSING ACCOUNT ROUTES --- */}
            <Route path="/admin/account/admin" element={<div className="p-10 font-bold text-2xl text-slate-700">Admin Users Page</div>} />
            <Route path="/admin/account/settings" element={<div className="p-10 font-bold text-2xl text-slate-700">Account Settings Page</div>} />
            
            {/* Mapping Sidebar 'My Account' to your existing UserProfile */}
            <Route path="/admin/account/profile" element={<UserProfile />} />
            
            {/* Mapping Sidebar 'My Plan' to your existing Plan page */}
            <Route path="/admin/account/plan" element={<ActivePlans />} />


          </Route>

          {/* --- 404 Catch All --- */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ConfigProvider>
  );
}

export default App;
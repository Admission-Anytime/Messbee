import { Suspense, lazy, useState, memo } from "react";
import { Routes, Route, Navigate, useLocation, Outlet } from "react-router-dom";
import { ConfigProvider } from "antd";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MainHeading from "./components/header/MainHeading";
import MainSidebar from "./components/mainsidebar/MainSidebar";

// --- INLINE LOADING ---
const PageLoader = () => (
  <div className="flex items-center justify-center h-full w-full">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ba2525]"></div>
  </div>
);

// --- LAZY LOADED MAIN PAGES ---
const Dashboard = lazy(() => import("./pages/dashboard-paid"));
const NotificationPage = lazy(
  () => import("./pages/Notification/NotificationPage"),
);
const Chat = lazy(() => import("./pages/chat/chat"));
const Campaign = lazy(() => import("./pages/campaign/campaign"));
const CreateCampaign = lazy(() => import("./pages/campaign/CreateCampaign"));
const Automation = lazy(() => import("./pages/automation/automation"));
const Analytic = lazy(() => import("./pages/analytic/analytic"));

// --- LAZY LOADED PLAN & PRICING PAGES ---
const UpgradePlan = lazy(() => import("./pages/PlanPricing/UpgradePlan"));
const AddonsWCC = lazy(() => import("./pages/PlanPricing/AddonsWCC"));
const ActivePlan = lazy(() => import("./pages/PlanPricing/ActivePlan"));
const PaymentHistory = lazy(() => import("./pages/PlanPricing/PaymentHistory"));
const PaymentMethods = lazy(() => import("./pages/PlanPricing/PaymentMethods"));

// --- LAZY LOADED CONTACTS ---
const Contact = lazy(() => import("./pages/contats/contact"));
const StatusPage = lazy(() => import("./pages/contats/Status/StatusPage"));
const ImportContacts = lazy(() => import("./pages/contats/importContact"));
const MapFields = lazy(() => import("./pages/contats/mapfields"));
const ReviewSummary = lazy(() => import("./pages/contats/reviewSummary"));

// --- LAZY LOADED SETTINGS ---
const Wapi = lazy(() => import("./pages/setting/Wapi"));
const Media = lazy(() => import("./pages/setting/Media"));
const Templates = lazy(() => import("./pages/setting/Templates"));
const TemplatesGallery = lazy(() => import("./pages/setting/TamplatesGallery"));
const CreateTemplate = lazy(() => import("./pages/setting/CreateTemplate"));
const Label = lazy(() => import("./pages/setting/Label"));
const CustomField = lazy(() => import("./pages/setting/CustomField"));
const QuickReply = lazy(() => import("./pages/setting/QuickReply"));
const DevApi = lazy(() => import("./pages/setting/DevApi"));

// --- LAZY LOADED PROFILE ---
const UserProfile = lazy(() => import("./pages/profile/UserProfile"));
const BusinessProfile = lazy(() => import("./pages/profile/BusinessProfile"));
const ActivePlans = lazy(() => import("./pages/profile/ActivePlans"));

// --- 404 COMPONENT ---
const NotFound = memo(() => {
  const location = useLocation();
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-gray-800">404</h2>
        <p className="text-gray-600 mt-2">
          Page not found: <code>{location.pathname}</code>
        </p>
      </div>
    </div>
  );
});
NotFound.displayName = "NotFound";

// --- PLACEHOLDER COMPONENTS (Memoized) ---
const Placeholder = memo(({ title }) => (
  <div className="p-10 text-xl font-bold text-slate-700">{title}</div>
));
Placeholder.displayName = "Placeholder";

// --- LAYOUT WRAPPER ---
const AppLayout = memo(() => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#faf9f7] font-['Urbanist'] overflow-hidden">
      {/* HEADER */}
      <div className="h-[70px] shrink-0 z-50 bg-white shadow-sm relative w-full">
        <MainHeading onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      </div>

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden relative h-[calc(100vh-85px)]">
        <MainSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <div className="flex-1 overflow-y-auto bg-[#f8fafc] relative w-full">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </div>
      </div>
    </div>
  );
});
AppLayout.displayName = "AppLayout";

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
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
        toastClassName="custom-toast"
        bodyClassName="custom-toast-body"
        style={{ zIndex: 9999 }}
      />

      <Routes>
        <Route element={<AppLayout />}>
          {/* 1. Dashboard */}
          <Route path="/" element={<Dashboard />} />
          <Route
            path="/admin/dashboard"
            element={<Navigate to="/" replace />}
          />
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
          <Route
            path="/admin/contacts/quick-replies"
            element={<QuickReply />}
          />
          <Route path="/admin/contacts/status" element={<StatusPage />} />
          <Route
            path="/admin/contacts/crm"
            element={<Placeholder title="CRM Pipeline" />}
          />
          {/* ── Import Contacts Route ── */}
          <Route
            path="/admin/contacts/import"
            element={<ImportContacts />}
          />{" "}
          {/* ← ADDED */}
          <Route path="/admin/contacts/map" element={<MapFields />} />{" "}
          {/* ← ADDED */}
          <Route
            path="/admin/contacts/review"
            element={<ReviewSummary />}
          />{" "}
          {/* ← ADDED */}
          {/* 5. Templates */}
          <Route path="/admin/templates/list" element={<Templates />} />
          <Route path="/admin/campaigns/templates" element={<Templates />} />
          <Route
            path="/admin/templates/gallery"
            element={<TemplatesGallery />}
          />
          <Route
            path="/admin/templates/create"
            element={<CreateTemplate />}
          />
          {/* 6. Campaigns */}
          <Route path="/admin/campaign" element={<Campaign />} />
          <Route path="/admin/campaigns" element={<Campaign />} />
          <Route path="/admin/campaign/create" element={<CreateCampaign />} />
          <Route
            path="/admin/campaigns/bulk"
            element={<Placeholder title="Bulk Send" />}
          />
          {/* 7. Commerce */}
          <Route
            path="/admin/commerce/payments"
            element={<Placeholder title="Payment List" />}
          />
          <Route
            path="/admin/commerce/products"
            element={<Placeholder title="Product List" />}
          />
          {/* 8. Automation */}
          <Route path="/admin/automation" element={<Automation />} />
          {/* 9. Analytics */}
          <Route path="/admin/analytic" element={<Analytic />} />
          <Route
            path="/admin/analytic/conversation"
            element={<Placeholder title="Conversation Analytics" />}
          />
          <Route
            path="/admin/analytic/messages"
            element={<Placeholder title="Message Analytics" />}
          />
          <Route
            path="/admin/analytic/template"
            element={<Placeholder title="Template Analytics" />}
          />
          <Route
            path="/admin/reports"
            element={<Placeholder title="Reports" />}
          />
          <Route
            path="/admin/alerts"
            element={<Placeholder title="Alerts" />}
          />
          <Route
            path="/admin/business"
            element={<Placeholder title="Business Management" />}
          />
          {/* 10. Integrations */}
          <Route path="/admin/api" element={<DevApi />} />
          <Route path="/admin/developer/api" element={<DevApi />} />
          <Route path="/admin/integration/api" element={<DevApi />} />
          <Route
            path="/admin/integration/apps"
            element={<Placeholder title="App Connect" />}
          />
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
          <Route
            path="/admin/account/admin"
            element={<Placeholder title="Admin Users" />}
          />
          <Route
            path="/admin/account/settings"
            element={<Placeholder title="Settings" />}
          />
          <Route path="/admin/account/profile" element={<UserProfile />} />
          <Route path="/admin/account/plan" element={<ActivePlans />} />
          <Route path="/admin/profile/info" element={<UserProfile />} />
          <Route path="/admin/profile/business" element={<BusinessProfile />} />
          {/* 14. Help */}
          <Route
            path="/admin/help/docs"
            element={<Placeholder title="Documentation" />}
          />
          <Route
            path="/admin/help/support"
            element={<Placeholder title="Support" />}
          />
          <Route
            path="/admin/help/faqs"
            element={<Placeholder title="FAQs" />}
          />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </ConfigProvider>
  );
}

export default App;

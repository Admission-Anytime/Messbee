import PropTypes from "prop-types";
import { Suspense, lazy, useState, memo, useEffect } from "react";
import { Routes, Route, Navigate, useLocation, Outlet } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// --- IMPORTS FOR NEW UI ---
import Loading from "./components/Loading";
import ErrorBoundary from "./components/ui/ErrorBoundary";

import MainHeading from "./components/header/MainHeading";
import MainSidebar from "./components/mainsidebar/MainSidebar";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import WhatsAppConfig from "./pages/setting/Wapi";

// --- UPDATED LOADING UI ---
const PageLoader = () => <Loading />;

// --- LAZY LOADED MAIN PAGES (with prefetch hints) ---
const Dashboard = lazy(() => import(/* webpackPrefetch: true */ "./pages/dashboard-paid"));
const NotificationPage = lazy(() => import("./pages/Notification/NotificationPage"));
const Chat = lazy(() => import(/* webpackPrefetch: true */ "./pages/chat/chat"));
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
const SubscriptionManagement = lazy(() => import("./pages/PlanPricing/SubscriptionManagement"));
const FinancialStatement = lazy(() => import("./pages/PlanPricing/FinancialStatement"));
const BillingAddress = lazy(() => import("./pages/PlanPricing/BillingAddress"));
const TaxInformation = lazy(() => import("./pages/PlanPricing/TaxInformation"));
const ManageSubscription = lazy(() => import("./pages/PlanPricing/ManageSubscription"));
const InvoiceView = lazy(() => import("./pages/PlanPricing/InvoiceView"));

// --- LAZY LOADED CONTACTS ---
const Contact = lazy(() => import(/* webpackPrefetch: true */ "./pages/contats/contact"));
const StatusPage = lazy(() => import("./pages/contats/Status/StatusPage"));
const ImportContacts = lazy(() => import("./pages/contats/importContact"));
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
const ManageTeams = lazy(() => import("./pages/setting/ManageTeams"));
const DevApi = lazy(() => import("./pages/setting/DevApi"));
const AppIntegration = lazy(() => import("./pages/setting/AppIntegration"));

// --- LAZY LOADED COMMERCE PAGES ---
const PaymentList = lazy(() => import("./pages/commerce/PaymentList"));
const ProductList = lazy(() => import("./pages/commerce/ProductList"));
const Inventory = lazy(() => import("./pages/commerce/Inventory"));

// --- LAZY LOADED PROFILE ---
const UserProfile = lazy(() => import("./pages/profile/UserProfile"));
const BusinessProfile = lazy(() => import("./pages/profile/BusinessProfile"));
const ActivePlans = lazy(() => import("./pages/profile/ActivePlans"));

// --- LAZY LOADED AUTH PAGES ---
const Login = lazy(() => import("./pages/Auth/Login"));
const Registration = lazy(() => import("./pages/Auth/Registration"));
const ForgotPassword = lazy(() => import("./pages/Auth/ForgotPassword"));
const VerifyOTP = lazy(() => import("./pages/Auth/VerifyOTP"));
const ResetPassword = lazy(() => import("./pages/Auth/ResetPassword"));
const Onboarding = lazy(() => import("./pages/Auth/Onboarding"));

// --- LAZY LOADED HELP PAGES ---
const HelpLayout = lazy(() => import("./pages/help/help"));
const Introduction = lazy(() => import("./pages/help/introduction"));
const Faq = lazy(() => import("./pages/help/Faq"));
const ApiDocs = lazy(() => import("./pages/help/ApiDocs"));
const Support = lazy(() => import("./pages/help/Support"));

// Support Sub-pages (Removed Whatsapp)
const GetStarted = lazy(() => import("./pages/help/support/GetStarted"));
const ApiWebhooks = lazy(() => import("./pages/help/support/ApiWebhooks"));
const BillingPlans = lazy(() => import("./pages/help/support/BillingPlans"));
const CampaignsHelp = lazy(() => import("./pages/help/support/Campaigns"));
const Troubleshooting = lazy(() => import("./pages/help/support/Troubleshooting"));


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

// --- PLACEHOLDER COMPONENTS ---
const Placeholder = memo(({ title }) => (
  <div className="p-10 text-xl font-bold text-slate-700">{title}</div>
));
Placeholder.displayName = "Placeholder";
Placeholder.propTypes = {
  title: PropTypes.string.isRequired,
};

// --- LAYOUT WRAPPER ---
// --- LAYOUT WRAPPER ---
const AppLayout = memo(() => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  // Define which paths should show the Navbar
  // "/" is your Dashboard according to your Routes configuration
  const isDashboard = location.pathname === "/" || location.pathname === "/admin/dashboard";

  return (
    <div className="flex h-screen w-screen bg-[#faf9f7] font-['Urbanist'] overflow-hidden">
      
      {/* Sidebar remains visible on all protected pages */}
      <MainSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        
        {/* Conditional Rendering: Navbar only shows if isDashboard is true */}
        {isDashboard && (
          <div className="h-[70px] shrink-0 z-50 bg-white border-b border-gray-100 shadow-sm relative w-full">
            <MainHeading onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
          </div>
        )}

        {/* Main Content Area */}
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

// Material-UI theme configuration
const theme = createTheme({
  palette: {
    primary: {
      main: "#ba2525",
    },
  },
  typography: {
    fontFamily: "Urbanist, Poppins, sans-serif",
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <ToastContainer
        position="top-right"      // ✅ Changed from top-center to top-left
        autoClose={3000}
        hideProgressBar={true} 
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
        toastClassName="custom-toast"
        bodyClassName="custom-toast-body"
        style={{ zIndex: 9999, top: '24px', right: '24px' }} // ✅ Added left spacing
      />

      <Routes>
        {/* PUBLIC ROUTES - Redirect to dashboard if already logged in */}
        <Route path="/login" element={<PublicRoute><Suspense fallback={<PageLoader />}><Login /></Suspense></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Suspense fallback={<PageLoader />}><Registration /></Suspense></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><Suspense fallback={<PageLoader />}><ForgotPassword /></Suspense></PublicRoute>} />
        <Route path="/verify-otp" element={<PublicRoute><Suspense fallback={<PageLoader />}><VerifyOTP /></Suspense></PublicRoute>} />
        <Route path="/reset-password" element={<PublicRoute><Suspense fallback={<PageLoader />}><ResetPassword /></Suspense></PublicRoute>} />
        <Route path="/onboarding" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><Onboarding /></Suspense></ProtectedRoute>} />

        {/* PROTECTED ROUTES - Require Authentication */}
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
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
          <Route
            path="/admin/contacts/review"
            element={<ReviewSummary />}
          />{" "}
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
          <Route path="/admin/commerce/payments" element={<PaymentList />} />
          <Route path="/admin/commerce/products" element={<ProductList />} />
          <Route path="/admin/commerce/inventory" element={<Inventory />} />
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
            element={<AppIntegration />}
          />
          {/* 11. Settings */}
          <Route path="/admin/settings/whatsapp" element={<Wapi />} />
          <Route path="/admin/settings/media" element={<Media />} />
          <Route path="/admin/settings/teams" element={<ManageTeams />} />
          {/* 12. Plan & Pricing */}
          <Route path="/admin/plan/upgrade" element={<UpgradePlan />} />
          <Route path="/admin/plan/addons-wcc" element={<AddonsWCC />} />
          <Route path="/admin/plan/active" element={<ActivePlan />} />
          <Route path="/admin/plan/history" element={<PaymentHistory />} />
          <Route path="/admin/plan/methods" element={<PaymentMethods />} />
          <Route path="/admin/plan/statement" element={<SubscriptionManagement />} />
          <Route path="/admin/plan/financial" element={<FinancialStatement />} />
          <Route path="/admin/plan/billing-address" element={<BillingAddress />} />
          <Route path="/admin/plan/tax-information" element={<TaxInformation />} />
          <Route path="/admin/plan/overview" element={<ManageSubscription />} />
          <Route path="/admin/plan/invoice/:id" element={<InvoiceView />} />
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
          <Route path="/admin/plan/active-plan" element={<ActivePlans />} />
          <Route path="/admin/profile/info" element={<UserProfile />} />
          <Route path="/admin/profile/business" element={<BusinessProfile />} />

          {/* 14. Help & Support Wrapper Route */}
          <Route path="/admin/help" element={<HelpLayout />}>
            {/* Default page when hitting /admin/help */}
            <Route index element={<Navigate to="introduction" replace />} />
            
            {/* Main Tabs */}
            <Route path="introduction" element={<Introduction />} />
            <Route path="faq" element={<Faq />} />
            <Route path="api-docs" element={<ApiDocs />} />
            
            {/* Support Hub and sub-pages */}
            <Route path="support">
              <Route index element={<Support />} />
              <Route path="get-started" element={<GetStarted />} />
              <Route path="api-webhooks" element={<ApiWebhooks />} />
              <Route path="billing-plans" element={<BillingPlans />} />
              <Route path="campaigns" element={<CampaignsHelp />} />
              <Route path="troubleshooting" element={<Troubleshooting />} />
              <Route path="whatsapp-compliance" element={<WhatsAppConfig />} />
            </Route>
          </Route>

        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
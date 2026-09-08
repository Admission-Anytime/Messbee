import PropTypes from "prop-types";
import { Suspense, lazy, useState, memo, useEffect, useContext } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate, Outlet } from "react-router-dom";
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
import LazyOnboardingModal from "./components/LazyOnboardingModal";
import ConnectWhatsAppModal from "./components/Modol/ConnectWhatsAppModal";
import PlanGuard from "./components/common/PlanGuard";
import { userContext } from "./context/Context";


// --- UPDATED LOADING UI ---
const PageLoader = () => <Loading />;

// Lightweight spinner used as the Suspense fallback inside the app layout
// so navigating between pages doesn't show a jarring full-screen loader
const PageSpinner = () => (
  <div className="flex items-center justify-center w-full h-full min-h-[40vh]">
    <div className="h-8 w-8 rounded-full border-[3px] border-gray-200 border-t-emerald-500 animate-spin" />
  </div>
);

// --- LAZY LOADED MAIN PAGES (with prefetch hints) ---
const Dashboard = lazy(() => import(/* webpackPrefetch: true */ "./pages/dashboard-paid"));
const NotificationPage = lazy(() => import("./pages/Notification/NotificationPage"));
const Chat = lazy(() => import(/* webpackPrefetch: true */ "./pages/chat/chat"));
const Campaign = lazy(() => import("./pages/campaign/campaign"));
const CreateCampaign = lazy(() => import("./pages/campaign/CreateCampaign"));
const CampaignLaunchSuccess = lazy(() => import("./pages/campaign/CampaignLaunchSuccess"));
const Automation = lazy(() => import("./pages/automation/automation"));
const AutomationBuilder = lazy(() => import("./pages/automation/AutomationBuilder"));
const Analytic = lazy(() => import("./pages/analytic/analytic"));
const ConversationAnalytics = lazy(() => import("./pages/analytic/ConversationAnalytics"));
const MessagesAnalytics = lazy(() => import("./pages/analytic/MessagesAnalytics"));
const TemplateAnalytics = lazy(() => import("./pages/analytic/TemplateAnalytics"));
const CampaignAnalytics = lazy(() => import("./pages/analytic/CampaignAnalytics"));

// --- LAZY LOADED PLAN & PRICING PAGES ---
const UpgradePlan = lazy(() => import("./pages/PlanPricing/UpgradePlan"));
const ContactSales = lazy(() => import("./pages/PlanPricing/ContactSales"));
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
const MapFields      = lazy(() => import("./pages/contats/mapFields"));
const ReviewSummary  = lazy(() => import("./pages/contats/reviewSummary"));

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
const SettingsOnboarding = lazy(() => import("./pages/setting/Onboarding"));

// --- LAZY LOADED COMMERCE PAGES ---
const PaymentList = lazy(() => import("./pages/commerce/PaymentList"));
const ProductList = lazy(() => import("./pages/commerce/ProductList"));
const Inventory = lazy(() => import("./pages/commerce/Inventory"));

// --- LAZY LOADED INVENTORY & BILLING PAGES ---
const CategoryManagement = lazy(() => import("./pages/inventory_billing/CategoryManagement"));
const ProductManagement = lazy(() => import("./pages/inventory_billing/ProductManagement"));
const SupplierManagement = lazy(() => import("./pages/inventory_billing/SupplierManagement"));
const CustomerManagement = lazy(() => import("./pages/inventory_billing/CustomerManagement"));
const PurchaseModule = lazy(() => import("./pages/inventory_billing/PurchaseModule"));
const SalesModule = lazy(() => import("./pages/inventory_billing/SalesModule"));
const InventoryDashboard = lazy(() => import("./pages/inventory_billing/InventoryDashboard"));
const ReportsDashboard = lazy(() => import("./pages/inventory_billing/ReportsDashboard"));
const BillingSettings = lazy(() => import("./pages/inventory_billing/BillingSettings"));

// --- LAZY LOADED PROFILE ---
const UserProfile = lazy(() => import("./pages/profile/UserProfile"));
const BusinessProfile = lazy(() => import("./pages/profile/BusinessProfile"));
const ActivePlans = lazy(() => import("./pages/profile/ActivePlans"));
const ChangePassword = lazy(() => import("./pages/profile/ChangePassword"));

// --- LAZY LOADED AUTH PAGES ---
const Login = lazy(() => import("./pages/Auth/Login"));
const Registration = lazy(() => import("./pages/Auth/Registration"));
const ForgotPassword = lazy(() => import("./pages/Auth/ForgotPassword"));
const VerifyOTP = lazy(() => import("./pages/Auth/VerifyOTP"));
const ResetPassword = lazy(() => import("./pages/Auth/ResetPassword"));
const Onboarding = lazy(() => import("./pages/Auth/Onboarding"));
const VerificationForm = lazy(() => import("./pages/VerificationForm"));

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
const AppLayout = memo(() => {
  const location = useLocation();
  
  // Collapse sidebar by default on specific pages
  const isPricingPage = location.pathname === "/admin/plan/upgrade" || location.pathname === "/admin/plan/contact-sales" || location.pathname === "/admin/contact-sales";
  const isChangePasswordPage = location.pathname === "/admin/profile/change-password";
  const [isSidebarOpen, setIsSidebarOpen] = useState(!(isPricingPage || isChangePasswordPage));

  // Collapse sidebar when navigating to those pages
  useEffect(() => {
    if (isPricingPage || isChangePasswordPage) {
      setIsSidebarOpen(false);
    }
  }, [isPricingPage, isChangePasswordPage]);

  const isDashboard = location.pathname === "/" || location.pathname === "/admin/dashboard";
  const { user, updateUser, refreshUser } = useContext(userContext);
  const navigate = useNavigate();

  const isPlanExpired = Boolean(
    user?.subscriptionEndDate && new Date(user.subscriptionEndDate) < new Date()
  );

  const isPlanAllowedRoute = location.pathname === "/admin/plan/upgrade" || location.pathname.startsWith("/admin/help") || location.pathname === "/admin/plan/contact-sales" || location.pathname === "/admin/contact-sales";

  // When plan is expired, redirect to /admin/plan/upgrade so only upgrade plan is accessible
  useEffect(() => {
    if (isPlanExpired && !isPlanAllowedRoute) {
      navigate("/admin/plan/upgrade", { replace: true });
    }
  }, [isPlanExpired, location.pathname, isPlanAllowedRoute, navigate]);

  const showExpiryLock = isPlanExpired && !isPlanAllowedRoute;

  const isWhatsAppConnected = Boolean(user?.tenantWhatsAppConnected);
  const showWhatsAppLock = !isWhatsAppConnected && !isChangePasswordPage && !isPricingPage && !isPlanExpired;

  return (
    <div className="flex h-screen w-screen bg-[#faf9f7] font-['Urbanist'] overflow-hidden relative">
      <LazyOnboardingModal />
      {/* Force WhatsApp connection modal if not connected */}
      {showWhatsAppLock && (
        <ConnectWhatsAppModal
          isOpen={true}
          isMandatory={true}
          onClose={() => {}}
          user={user}
        />
      )}
      
      {/* 1. Sidebar now stretches full height as the first child of the flex-row */}
      {!isChangePasswordPage && !showWhatsAppLock && (
        <div className={showWhatsAppLock ? "pointer-events-none opacity-50" : ""} inert={showWhatsAppLock ? "" : undefined}>
          <MainSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        </div>
      )}

      {/* 2. Main content container (Navbar + Page Content) */}
      <div className={`flex flex-col flex-1 min-w-0 overflow-hidden ${showWhatsAppLock ? "pointer-events-none opacity-50" : ""}`} inert={showWhatsAppLock ? "" : undefined}>
        
        {/* 3. Conditional Rendering: Navbar only shows on Dashboard */}
        {isDashboard && !showWhatsAppLock && !showExpiryLock && (
          <div className="h-[70px] shrink-0 z-50 bg-white border-b border-gray-100 shadow-sm relative w-full">
            <MainHeading onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
          </div>
        )}

        {/* 4. Page Content area */}
        <div className="flex-1 overflow-y-auto bg-[#f8fafc] relative w-full">
          {showWhatsAppLock ? (
            <div className="h-full w-full flex items-center justify-center bg-gray-100/50">
              {/* Dashboard is completely blocked from rendering in the DOM to prevent bypass */}
            </div>
          ) : showExpiryLock ? (
            <div className="min-h-[80vh] flex items-center justify-center p-6 font-['Urbanist']">
              <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center border border-amber-200 shadow-xl shadow-amber-900/5 space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 mb-2">
                    {user?.subscriptionPlan && user.subscriptionPlan.toLowerCase() !== "free"
                      ? `${user.subscriptionPlan.charAt(0).toUpperCase() + user.subscriptionPlan.slice(1)} Plan Expired`
                      : "Free Trial Expired"}
                  </h2>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Your {user?.subscriptionPlan && user.subscriptionPlan.toLowerCase() !== "free"
                      ? `${user.subscriptionPlan.charAt(0).toUpperCase() + user.subscriptionPlan.slice(1)} subscription plan`
                      : "30-day Free trial"} has expired. To continue using your WhatsApp automations, campaigns, inbox, and tools, please renew or upgrade your plan.
                  </p>
                </div>
                <div className="pt-2 flex flex-col gap-2.5">
                  <button
                    onClick={() => navigate("/admin/plan/upgrade")}
                    className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-[#10B981] hover:bg-[#059669] shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                  >
                    View Upgrade Plans →
                  </button>

                </div>
              </div>
            </div>
          ) : (
            <ErrorBoundary>
              <Suspense fallback={<PageSpinner />}>
                <Outlet />
              </Suspense>
            </ErrorBoundary>
          )}
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
      <CssBaseline />
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
        {/* PUBLIC ROUTES - Redirect to dashboard if already logged in */}
        <Route path="/login" element={<PublicRoute><Suspense fallback={<PageLoader />}><Login /></Suspense></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Suspense fallback={<PageLoader />}><Registration /></Suspense></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><Suspense fallback={<PageLoader />}><ForgotPassword /></Suspense></PublicRoute>} />
        <Route path="/verify-otp" element={<PublicRoute><Suspense fallback={<PageLoader />}><VerifyOTP /></Suspense></PublicRoute>} />
        <Route path="/reset-password" element={<PublicRoute><Suspense fallback={<PageLoader />}><ResetPassword /></Suspense></PublicRoute>} />
        <Route path="/onboarding" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><Onboarding /></Suspense></ProtectedRoute>} />
        <Route path="/form" element={<Suspense fallback={<PageLoader />}><VerificationForm /></Suspense>} />

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
          {/* ── Import Contacts Flow: Step 1 → Step 2 → Step 3 ── */}
          <Route path="/admin/contacts/import"     element={<ImportContacts />} />
          <Route path="/admin/contacts/map-fields" element={<MapFields />} />
          <Route path="/admin/contacts/review"     element={<ReviewSummary />} />
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
          <Route path="/admin/campaign/:id" element={<Campaign />} />
          <Route path="/admin/campaigns/:id" element={<Campaign />} />
          <Route path="/admin/campaign/create" element={<CreateCampaign />} />
          <Route path="/admin/campaign-success" element={<CampaignLaunchSuccess />} />
          <Route
            path="/admin/campaigns/bulk"
            element={<Placeholder title="Bulk Send" />}
          />
          {/* 7. Commerce (Requires Growth plan and above) */}
          <Route
            path="/admin/commerce/payments"
            element={
              <PlanGuard feature="commerce" title="Commerce & Payments">
                <PaymentList />
              </PlanGuard>
            }
          />
          <Route
            path="/admin/commerce/products"
            element={
              <PlanGuard feature="commerce" title="Commerce & Products">
                <ProductList />
              </PlanGuard>
            }
          />
          <Route
            path="/admin/commerce/inventory"
            element={
              <PlanGuard feature="commerce" title="Commerce & Inventory">
                <Inventory />
              </PlanGuard>
            }
          />
          {/* 8. Automation */}
          <Route path="/admin/automation" element={<Automation />} />
          <Route path="/admin/automation/:id" element={<AutomationBuilder />} />
          {/* 9. Analytics */}
          <Route
            path="/admin/analytic/campaign"
            element={<CampaignAnalytics />}
          />
          <Route
            path="/admin/analytic"
            element={<Analytic />}
          />
          <Route
            path="/admin/analytic/conversation"
            element={<ConversationAnalytics />}
          />
          <Route
            path="/admin/analytic/messages"
            element={<MessagesAnalytics />}
          />
          <Route
            path="/admin/analytic/template"
            element={
              <PlanGuard feature="templateAnalytics" title="Template Analytics">
                <TemplateAnalytics />
              </PlanGuard>
            }
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
          {/* 10. Integrations (API requires Growth+, Apps requires Basic+) */}
          <Route
            path="/admin/api"
            element={
              <PlanGuard feature="developerApi" title="Developer API">
                <DevApi />
              </PlanGuard>
            }
          />
          <Route
            path="/admin/developer/api"
            element={
              <PlanGuard feature="developerApi" title="Developer API">
                <DevApi />
              </PlanGuard>
            }
          />
          <Route
            path="/admin/integration/api"
            element={
              <PlanGuard feature="developerApi" title="Developer API">
                <DevApi />
              </PlanGuard>
            }
          />
          <Route
            path="/admin/integration/apps"
            element={
              <PlanGuard feature="appsIntegration" title="App Integrations">
                <AppIntegration />
              </PlanGuard>
            }
          />
          {/* 11. Settings */}
          <Route path="/admin/settings/onboarding" element={<SettingsOnboarding />} />
          <Route path="/admin/settings/whatsapp" element={<Wapi />} />
          <Route path="/admin/settings/media" element={<Media />} />
          <Route path="/admin/settings/teams" element={<ManageTeams />} />
          
          {/* INVENTORY & BILLING ROUTES */}
          <Route path="/admin/inventory/categories" element={<CategoryManagement />} />
          <Route path="/admin/inventory/products" element={<ProductManagement />} />
          <Route path="/admin/inventory/logs" element={<InventoryDashboard />} />
          <Route path="/admin/purchase/suppliers" element={<SupplierManagement />} />
          <Route path="/admin/purchase/bills" element={<PurchaseModule />} />
          <Route path="/admin/sales/customers" element={<CustomerManagement />} />
          <Route path="/admin/sales/invoices" element={<SalesModule />} />
          <Route path="/admin/billing/reports/:tab?" element={<ReportsDashboard />} />
          <Route path="/admin/billing/settings" element={<BillingSettings />} />

          {/* 12. Plan & Pricing */}
          <Route path="/admin/plan/upgrade" element={<UpgradePlan />} />
          <Route path="/admin/plan/contact-sales" element={<ContactSales />} />
          <Route path="/admin/contact-sales" element={<ContactSales />} />
          <Route path="/admin/plan/addons" element={<AddonsWCC />} />
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
          <Route path="/admin/account/plan" element={<ActivePlans />} />
          <Route path="/admin/profile/info" element={<UserProfile />} />
          <Route path="/admin/profile/business" element={<BusinessProfile />} />
          <Route path="/admin/profile/change-password" element={<ChangePassword />} />

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
              <Route
                path="api-webhooks"
                element={
                  <PlanGuard feature="webhook" title="Webhooks">
                    <ApiWebhooks />
                  </PlanGuard>
                }
              />
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
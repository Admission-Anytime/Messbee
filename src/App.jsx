import { Suspense, lazy } from "react";
import Loading from "./components/Loading";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ConfigProvider } from "antd";
import ProtectedRoute from "../routes/protectedRoute";

const Introduction = lazy(() => import("./pages/help/introduction"));
const Login = lazy(() => import("./pages/Auth/Login"));
const Registration = lazy(() => import("./pages/Auth/Registration"));
const Dashboard = lazy(() => import("./pages/dashboard-paid"));
const Profile = lazy(() => import("./pages/profile/profile"));
const UserProfile = lazy(() => import("./pages/profile/UserProfile"));
const BusinessProfile = lazy(() => import("./pages/profile/BusinessProfile"));
const UpgradePlans = lazy(() => import("./pages/profile/UpgradePlans"));
const ActivePlans = lazy(() => import("./pages/profile/ActivePlans"));
const Chat = lazy(() => import("./pages/chat/chat"));
const Conversion = lazy(() => import("./pages/chat/Conversion"));
const Contact = lazy(() => import("./pages/contats/contact"));
const Automation = lazy(() => import("./pages/automation/automation"));
const Campaign = lazy(() => import("./pages/campaign/campaign"));
const CreateCampaign = lazy(() => import("./pages/campaign/CreateCampaign"));
const Analytic = lazy(() => import("./pages/analytic/analytic"));
const Help = lazy(() => import("./pages/help/help"));
const Setting = lazy(() => import("./pages/setting/setting"));
const Wapi = lazy(() => import("./pages/setting/Wapi"));
const Templates = lazy(() => import("./pages/setting/Templates"));
const TemplatesGallery = lazy(() => import("./pages/setting/TamplatesGallery"));
const Media = lazy(() => import("./pages/setting/Media"));
const Label = lazy(() => import("./pages/setting/Label"));
const CustomField = lazy(() => import("./pages/setting/CustomField"));
const Status = lazy(() => import("./pages/setting/Status"));
const QuickReply = lazy(() => import("./pages/setting/QuickReply"));
const DevApi = lazy(() => import("./pages/setting/DevApi"));
// const AppIntegration = lazy(() => import("./pages/setting/AppIntegration"));

const NotFound = () => {
  const location = useLocation();

  return (
    <div>
      <h2>404 - Not Found</h2>
      <p>
        No match for <code>{location.pathname}</code>
      </p>
    </div>
  );
};

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          fontFamily: "Poppins",
          colorPrimary: "#ba2525",
        },
      }}
    >
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* Force login and signup */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Registration />} />
          {/* Main pages */}
          <Route path="/" element={<ProtectedRoute Component={Dashboard} />} />
          <Route
            path="/admin/profile"
            element={<ProtectedRoute Component={Profile} />}
          >
            <Route index element={<Navigate to="user/1" />} />
            <Route path="user/:id" element={<UserProfile />} />
            <Route
              path="business-profile/:id"
              element={<ProtectedRoute Component={BusinessProfile} />}
            />
            <Route
              path="upgrade-plans"
              element={<ProtectedRoute Component={UpgradePlans} />}
            />
            <Route
              path="active-plans"
              element={<ProtectedRoute Component={ActivePlans} />}
            />
          </Route>
          <Route
            path="/admin/chat"
            element={<ProtectedRoute Component={Chat} />}
          >
            <Route
              path="conversions"
              element={<ProtectedRoute Component={Conversion} />}
            />
          </Route>
          <Route
            path="/admin/contact"
            element={<ProtectedRoute Component={Contact} />}
          />
          <Route
            path="/admin/campaign"
            element={<ProtectedRoute Component={Campaign} />}
          />
          <Route
            path="/admin/campaign-create"
            element={<ProtectedRoute Component={CreateCampaign} />}
          />

          <Route
            path="/admin/automation"
            element={<ProtectedRoute Component={Automation} />}
          />
          <Route
            path="/admin/analytic"
            element={<ProtectedRoute Component={Analytic} />}
          />
          <Route
            path="/admin/help"
            element={<ProtectedRoute Component={Help} />}
          >
            <Route
              path="introduction"
              element={<ProtectedRoute Component={Introduction} />}
            />
          </Route>
          <Route
            path="/admin/setting"
            element={<ProtectedRoute Component={Setting} />}
          >
            <Route path="wapi" element={<ProtectedRoute Component={Wapi} />} />
            <Route
              path="templates"
              element={<ProtectedRoute Component={Templates} />}
            />
            <Route
              path="templates-gallery"
              element={<ProtectedRoute Component={TemplatesGallery} />}
            />
            <Route
              path="media"
              element={<ProtectedRoute Component={Media} />}
            />
            <Route
              path="labels"
              element={<ProtectedRoute Component={Label} />}
            />
            <Route
              path="custom-fields"
              element={<ProtectedRoute Component={CustomField} />}
            />
            <Route
              path="status"
              element={<ProtectedRoute Component={Status} />}
            />
            <Route
              path="quick-reply"
              element={<ProtectedRoute Component={QuickReply} />}
            />
            <Route
              path="dev-api/:id"
              element={<ProtectedRoute Component={DevApi} />}
            />
            <Route
              path="app/:id"
              element={<ProtectedRoute Component={App} />}
            />
          </Route>
          <Route path="/*" element={<ProtectedRoute Component={NotFound} />} />
        </Routes>
      </Suspense>
    </ConfigProvider>
  );
}

export default App;

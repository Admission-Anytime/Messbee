import { Suspense, lazy } from "react";
import Loading from "./components/Loading";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ConfigProvider } from "antd";
import ProtectedRoute from "../routes/ProtectedRoute";


import "./index.css";

// =======================
// LAZY PAGES
// =======================

const Introduction = lazy(() => import("./pages/help/introduction"));
const Login = lazy(() => import("./pages/Auth/Login"));
const Registration = lazy(() => import("./pages/Auth/Registration"));
const Dashboard = lazy(() => import("./pages/dashboard-paid"));
const Profile = lazy(() => import("./pages/profile/profile"));
const UserProfile = lazy(() => import("./pages/profile/UserProfile"));
const BusinessProfile = lazy(() =>
  import("./pages/profile/BusinessProfile")
);
const UpgradePlans = lazy(() => import("./pages/profile/UpgradePlans"));
const ActivePlans = lazy(() => import("./pages/profile/ActivePlans"));
const Chat = lazy(() => import("./pages/chat/chat"));
const Conversion = lazy(() => import("./pages/chat/Conversion"));
const Contact = lazy(() => import("./pages/contats/contact"));
const Automation = lazy(() => import("./pages/automation/automation"));
const Campaign = lazy(() => import("./pages/campaign/campaign"));
const CreateCampaign = lazy(() =>
  import("./pages/campaign/CreateCampaign")
);
const Analytic = lazy(() => import("./pages/analytic/analytic"));
const Help = lazy(() => import("./pages/help/help"));
const Setting = lazy(() => import("./pages/setting/setting"));
const Wapi = lazy(() => import("./pages/setting/Wapi"));
const Templates = lazy(() => import("./pages/setting/Templates"));
const TemplatesGallery = lazy(() =>
  import("./pages/setting/TamplatesGallery")
);
const Media = lazy(() => import("./pages/setting/Media"));
const Label = lazy(() => import("./pages/setting/Label"));
const CustomField = lazy(() =>
  import("./pages/setting/CustomField")
);
const Status = lazy(() => import("./pages/setting/Status"));
const QuickReply = lazy(() =>
  import("./pages/setting/QuickReply")
);
const DevApi = lazy(() => import("./pages/setting/DevApi"));

// =======================
// NOT FOUND
// =======================

const NotFound = () => {
  const location = useLocation();

  return (
    <div className="p-10">
      <h2 className="text-xl font-semibold">404 - Not Found</h2>
      <p>
        No match for <code>{location.pathname}</code>
      </p>
    </div>
  );
};

// =======================
// APP
// =======================

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
      <Routes>
        {/* ================= AUTH ================= */}

        <Route
          path="/login"
          element={
            <Suspense fallback={<Loading />}>
              <Login />
            </Suspense>
          }
        />

        <Route
          path="/signup"
          element={
            <Suspense fallback={<Loading />}>
              <Registration />
            </Suspense>
          }
        />

        {/* ================= DASHBOARD ================= */}

        <Route
          path="/"
          element={
            <ProtectedRoute
              Component={() => (
                <Suspense fallback={<Loading />}>
                  <Dashboard />
                </Suspense>
              )}
            />
          }
        />

        {/* ================= PROFILE ================= */}

        <Route
          path="/admin/profile"
          element={
            <ProtectedRoute
              Component={() => (
                <Suspense fallback={<Loading />}>
                  <Profile />
                </Suspense>
              )}
            />
          }
        >
          <Route index element={<Navigate to="user/1" />} />

          <Route
            path="user/:id"
            element={
              <Suspense fallback={<Loading />}>
                <UserProfile />
              </Suspense>
            }
          />

          <Route
            path="business-profile/:id"
            element={
              <Suspense fallback={<Loading />}>
                <BusinessProfile />
              </Suspense>
            }
          />

          <Route
            path="upgrade-plans"
            element={
              <Suspense fallback={<Loading />}>
                <UpgradePlans />
              </Suspense>
            }
          />

          <Route
            path="active-plans"
            element={
              <Suspense fallback={<Loading />}>
                <ActivePlans />
              </Suspense>
            }
          />
        </Route>

        {/* ================= CHAT ================= */}

        <Route
          path="/admin/chat"
          element={
            <ProtectedRoute
              Component={() => (
                <Suspense fallback={<Loading />}>
                  <Chat />
                </Suspense>
              )}
            />
          }
        >
          <Route
            path="conversions"
            element={
              <Suspense fallback={<Loading />}>
                <Conversion />
              </Suspense>
            }
          />
        </Route>

        {/* ================= OTHERS ================= */}

        <Route
          path="/admin/contact"
          element={
            <ProtectedRoute
              Component={() => (
                <Suspense fallback={<Loading />}>
                  <Contact />
                </Suspense>
              )}
            />
          }
        />

        <Route
          path="/admin/campaign"
          element={
            <ProtectedRoute
              Component={() => (
                <Suspense fallback={<Loading />}>
                  <Campaign />
                </Suspense>
              )}
            />
          }
        />

        <Route
          path="/admin/campaign-create"
          element={
            <ProtectedRoute
              Component={() => (
                <Suspense fallback={<Loading />}>
                  <CreateCampaign />
                </Suspense>
              )}
            />
          }
        />

        <Route
          path="/admin/automation"
          element={
            <ProtectedRoute
              Component={() => (
                <Suspense fallback={<Loading />}>
                  <Automation />
                </Suspense>
              )}
            />
          }
        />

        <Route
          path="/admin/analytic"
          element={
            <ProtectedRoute
              Component={() => (
                <Suspense fallback={<Loading />}>
                  <Analytic />
                </Suspense>
              )}
            />
          }
        />

        {/* ================= HELP ================= */}

        <Route
          path="/admin/help"
          element={
            <ProtectedRoute
              Component={() => (
                <Suspense fallback={<Loading />}>
                  <Help />
                </Suspense>
              )}
            />
          }
        >
          <Route
            path="introduction"
            element={
              <Suspense fallback={<Loading />}>
                <Introduction />
              </Suspense>
            }
          />
        </Route>

        {/* ================= SETTINGS ================= */}

        <Route
          path="/admin/setting"
          element={
            <ProtectedRoute
              Component={() => (
                <Suspense fallback={<Loading />}>
                  <Setting />
                </Suspense>
              )}
            />
          }
        >
          <Route
            path="wapi"
            element={
              <Suspense fallback={<Loading />}>
                <Wapi />
              </Suspense>
            }
          />

          <Route
            path="templates"
            element={
              <Suspense fallback={<Loading />}>
                <Templates />
              </Suspense>
            }
          />

          <Route
            path="templates-gallery"
            element={
              <Suspense fallback={<Loading />}>
                <TemplatesGallery />
              </Suspense>
            }
          />

          <Route
            path="media"
            element={
              <Suspense fallback={<Loading />}>
                <Media />
              </Suspense>
            }
          />

          <Route
            path="labels"
            element={
              <Suspense fallback={<Loading />}>
                <Label />
              </Suspense>
            }
          />

          <Route
            path="custom-fields"
            element={
              <Suspense fallback={<Loading />}>
                <CustomField />
              </Suspense>
            }
          />

          <Route
            path="status"
            element={
              <Suspense fallback={<Loading />}>
                <Status />
              </Suspense>
            }
          />

          <Route
            path="quick-reply"
            element={
              <Suspense fallback={<Loading />}>
                <QuickReply />
              </Suspense>
            }
          />

          <Route
            path="dev-api/:id"
            element={
              <Suspense fallback={<Loading />}>
                <DevApi />
              </Suspense>
            }
          />
        </Route>

        {/* ================= 404 ================= */}

        <Route
          path="/*"
          element={
            <Suspense fallback={<Loading />}>
              <NotFound />
            </Suspense>
          }
        />
      </Routes>
    </ConfigProvider>
  );
}

export default App;

import { UserOutlined } from "@ant-design/icons";
import { wrapReactRouterRouting } from "@sentry/react";
import { Layout, Menu, Dropdown, Button, ConfigProvider, Spin, theme } from "antd";
import React, { Suspense, lazy, useContext, useEffect, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Routes as RouterRoutes, Route, Navigate } from "react-router-dom";

import type { StoreApi } from "../store";
import { StoreContext } from "../storeContext";
import utils from "../utils";
import ButtonLink from "./common/ButtonLink";
import Logo from "./common/Logo";
import AuthLayout from "./page-login/AuthLayout";
import PageForgotPassword from "./page-login/PageForgotPassword";
import PageLogin from "./page-login/PageLogin";
import PageRegister from "./page-login/PageRegister";
import PageResetPassword from "./page-login/PageResetPassword";
import PageVerifyEmail from "./page-login/PageVerifyEmail";
import PageLogout from "./page-logout/PageLogout";

import "antd/dist/reset.css";

// Names route transactions after the matched route pattern.
const Routes = wrapReactRouterRouting(RouterRoutes);

const PageAccount = lazy(() => import("./page-account/PageAccount"));
const PageLanding = lazy(() => import("./page-public/PageLanding"));
const PagePrivacy = lazy(() => import("./page-public/PagePrivacy"));
const PageTerms = lazy(() => import("./page-public/PageTerms"));
const PullsPages = lazy(() => import("./resources/pulls/PullsPages"));
const UnreadIssuesPage = lazy(() => import("./resources/unread-issues/UnreadIssuesPage"));
const WeeksDetailPage = lazy(() => import("./resources/weeks/WeeksDetailPage"));

const { Header, Content, Footer } = Layout;

type PrivateRouteProps = {
  isAuthenticated: boolean;
  element: React.ReactElement;
};

const PrivateRoute = ({ isAuthenticated, element }: PrivateRouteProps) => {
  return isAuthenticated ? element : <Navigate to="/login" replace />;
};

export default function App() {
  const store = useContext<StoreApi>(StoreContext);
  const [isAuthenticated, setIsAuthenticated] = useState(store.isAuthenticated);

  // Listen for auth changes (login/logout) to avoid manual refresh flashes
  useEffect(() => {
    const handler = () => setIsAuthenticated(store.isAuthenticated);
    window.addEventListener("auth-changed", handler);
    return () => window.removeEventListener("auth-changed", handler);
  }, [store]);

  const loggedOutOnly = (page: React.ReactElement) =>
    isAuthenticated ? <Navigate to="/unread-issues" replace /> : <AuthLayout>{page}</AuthLayout>;

  const currentWeek = useMemo(() => utils.nearestWed(), []);
  const location = useLocation();

  const selectedKey = useMemo(() => {
    const p = location.pathname;
    if (p.startsWith("/unread-issues")) return "unread-issues";
    if (p.startsWith("/weeks")) return "weeks";
    if (p.startsWith("/pulls")) return "pulls";
    return "";
  }, [location.pathname]);

  const navItems = [
    { key: "unread-issues", label: <NavLink to="/unread-issues">Unread Issues</NavLink> },
    { key: "weeks", label: <NavLink to={`/weeks/${currentWeek}`}>Weeks</NavLink> },
    { key: "pulls", label: <NavLink to="/pulls">Pulls</NavLink> },
  ];

  const userMenu = {
    items: [
      {
        key: "account",
        label: <NavLink to="/account">Account</NavLink>,
      },
      {
        key: "logout",
        label: <NavLink to="/logout">Log out</NavLink>,
      },
    ],
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm,
          components: {
            Menu: {
              // Make the active nav item text green
              itemSelectedColor: "#52c41a",
              // Optional: keep background subtle; omit to use default dark bg
            },
          },
        }}
      >
        <Header style={{ display: "flex", alignItems: "center", gap: 32, paddingInline: 24 }}>
          <Logo />
          {isAuthenticated && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <Menu
                mode="horizontal"
                selectedKeys={selectedKey ? [selectedKey] : []}
                theme="dark"
                items={navItems}
                style={{ borderBottom: "none" }}
              />
            </div>
          )}
          {isAuthenticated ? (
            <Dropdown menu={userMenu} placement="bottomRight" trigger={["click"]}>
              <Button icon={<UserOutlined />}>Account</Button>
            </Dropdown>
          ) : (
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              {location.pathname !== "/login" && (
                <ButtonLink to="/login" type="text" style={{ color: "#fff" }}>
                  Log in
                </ButtonLink>
              )}
              {location.pathname !== "/register" && (
                <ButtonLink to="/register" type="primary">
                  Sign up
                </ButtonLink>
              )}
            </div>
          )}
        </Header>
      </ConfigProvider>

      <Layout>
        <Content
          style={{
            margin: "16px",
            padding: 24,
            background: "#fff",
            minHeight: 280,
          }}
        >
          <Suspense fallback={<Spin size="large" />}>
            <Routes>
              <Route
                path="/"
                element={
                  isAuthenticated ? <Navigate to="/unread-issues" replace /> : <PageLanding />
                }
              />

              <Route
                path="/unread-issues"
                element={
                  <PrivateRoute isAuthenticated={isAuthenticated} element={<UnreadIssuesPage />} />
                }
              />
              <Route path="/pull-lists" element={<Navigate to="/pulls" replace />} />
              <Route
                path="/pulls/*"
                element={
                  <PrivateRoute isAuthenticated={isAuthenticated} element={<PullsPages />} />
                }
              />
              <Route
                path="/weeks/:weekId"
                element={
                  <PrivateRoute isAuthenticated={isAuthenticated} element={<WeeksDetailPage />} />
                }
              />
              <Route
                path="/account"
                element={
                  <PrivateRoute isAuthenticated={isAuthenticated} element={<PageAccount />} />
                }
              />
              <Route path="/privacy" element={<PagePrivacy />} />
              <Route path="/terms" element={<PageTerms />} />
              <Route
                path="/logout"
                element={
                  <PrivateRoute isAuthenticated={isAuthenticated} element={<PageLogout />} />
                }
              />
              <Route path="/login" element={loggedOutOnly(<PageLogin />)} />
              <Route path="/register" element={loggedOutOnly(<PageRegister />)} />
              <Route path="/forgot-password" element={loggedOutOnly(<PageForgotPassword />)} />
              {/* Email links: these work whether or not someone is logged in. */}
              <Route
                path="/reset-password/:uid/:token"
                element={
                  <AuthLayout>
                    <PageResetPassword />
                  </AuthLayout>
                }
              />
              <Route
                path="/verify-email/:key"
                element={
                  <AuthLayout>
                    <PageVerifyEmail />
                  </AuthLayout>
                }
              />
            </Routes>
          </Suspense>
        </Content>
        <Footer style={{ textAlign: "center", paddingTop: 0 }}>
          <NavLink to="/privacy">Privacy</NavLink> · <NavLink to="/terms">Terms</NavLink> · Comic
          data from{" "}
          <a href="https://comicvine.gamespot.com/" target="_blank" rel="noreferrer">
            Comic Vine
          </a>
        </Footer>
      </Layout>
    </Layout>
  );
}

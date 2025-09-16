import { UserOutlined } from "@ant-design/icons";
import { Layout, Menu, Dropdown, Button, ConfigProvider, theme } from "antd";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Routes, Route, Navigate } from "react-router-dom";

import type { StoreApi } from "../store";
import { StoreContext } from "../storeContext";
import utils from "../utils";
import Logo from "./common/Logo";
import PageLogin from "./page-login/PageLogin";
import PageLogout from "./page-logout/PageLogout";
import PagePullLists from "./page-pull-lists/PagePullLists";
import PullsPages from "./resources/pulls/PullsPages";
import UnreadIssuesPage from "./resources/unread-issues/UnreadIssuesPage";
import WeeksDetailPage from "./resources/weeks/WeeksDetailPage";

import "antd/dist/reset.css";

const { Header, Content } = Layout;

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

  const currentWeek = useMemo(() => utils.nearestWed(), []);
  const location = useLocation();

  const selectedKey = useMemo(() => {
    const p = location.pathname;
    if (p.startsWith("/unread-issues")) return "unread-issues";
    if (p.startsWith("/pull-lists")) return "pull-lists";
    if (p.startsWith("/weeks")) return "weeks";
    if (p.startsWith("/pulls")) return "pulls";
    return "";
  }, [location.pathname]);

  const navItems = [
    { key: "unread-issues", label: <NavLink to="/unread-issues">Unread Issues</NavLink> },
    { key: "pull-lists", label: <NavLink to="/pull-lists">Pull Lists</NavLink> },
    { key: "weeks", label: <NavLink to={`/weeks/${currentWeek}`}>Weeks</NavLink> },
    { key: "pulls", label: <NavLink to="/pulls">Pulls</NavLink> },
  ];

  const userMenu = {
    items: [
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
          {isAuthenticated && (
            <Dropdown menu={userMenu} placement="bottomRight" trigger={["click"]}>
              <Button icon={<UserOutlined />}>Account</Button>
            </Dropdown>
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
          <Routes>
            <Route
              path="/"
              element={
                isAuthenticated ? (
                  <Navigate to="/unread-issues" replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            <Route
              path="/unread-issues"
              element={
                <PrivateRoute isAuthenticated={isAuthenticated} element={<UnreadIssuesPage />} />
              }
            />
            <Route
              path="/pull-lists"
              element={
                <PrivateRoute isAuthenticated={isAuthenticated} element={<PagePullLists />} />
              }
            />
            <Route
              path="/pulls/*"
              element={<PrivateRoute isAuthenticated={isAuthenticated} element={<PullsPages />} />}
            />
            <Route
              path="/weeks/:weekId"
              element={
                <PrivateRoute isAuthenticated={isAuthenticated} element={<WeeksDetailPage />} />
              }
            />
            <Route
              path="/logout"
              element={<PrivateRoute isAuthenticated={isAuthenticated} element={<PageLogout />} />}
            />
            <Route
              path="/login"
              element={
                isAuthenticated ? (
                  <Navigate to="/unread-issues" replace />
                ) : (
                  <div style={{ display: "flex", justifyContent: "center", paddingTop: 64 }}>
                    <div style={{ maxWidth: 400, width: "100%" }}>
                      <PageLogin />
                    </div>
                  </div>
                )
              }
            />
            {/* <Route
              path="/register"
              element={
                isAuthenticated ? (
                  <Navigate to="/unread-issues" replace />
                ) : (
                  <div style={{ display: "flex", justifyContent: "center", paddingTop: 64 }}>
                    <div style={{ maxWidth: 400, width: "100%" }}>
                      <PageRegister />
                    </div>
                  </div>
                )
              }
            /> */}
            <Route path="/register" element={<Navigate to="/login" replace />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}

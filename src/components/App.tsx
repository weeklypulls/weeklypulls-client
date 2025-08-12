import { Layout, Menu } from "antd";
import React, { useContext } from "react";
import { BrowserRouter as Router, NavLink } from "react-router-dom";
import { Routes, Route, Navigate } from "react-router-dom";

import type { StoreApi } from "../store";
import { StoreContext } from "../storeContext";
// Removed legacy ComicsListPage
// import ComicsListPage from './resources/series/ComicsListPage';
import utils from "../utils";
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
  const isAuthenticated = store.isAuthenticated;

  const renderNavLink = (to: string, label: string) => (
    <Menu.Item key={to}>
      <NavLink to={to}>
        <span>{label}</span>
      </NavLink>
    </Menu.Item>
  );

  return (
    <Router>
      <Layout style={{ minHeight: "100vh" }}>
        <Header>
          <div className="logo" />
          <Menu mode="horizontal" selectedKeys={[]} theme="dark">
            {renderNavLink("/unread-issues", "Unread Issues")}
            {renderNavLink("/pull-lists", "Pull Lists")}
            {renderNavLink(`/weeks/${utils.nearestWed()}`, "Weeks")}
            {renderNavLink("/pulls", "Pulls")}
            {renderNavLink("/logout", "Logout")}
          </Menu>
        </Header>

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
              <Route path="/" element={<Navigate to="/unread-issues" replace />} />

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
                path="/logout"
                element={
                  <PrivateRoute isAuthenticated={isAuthenticated} element={<PageLogout />} />
                }
              />
              <Route path="/login" element={<PageLogin />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </Router>
  );
}

import { Layout, Menu } from "antd";
import { observer } from "mobx-react";
import React, { useContext } from "react";
import { BrowserRouter as Router, NavLink } from "react-router-dom";
import { Routes, Route, Navigate } from "react-router-dom";

import Store from "../store";
import { StoreContext } from "../storeContext";
// Removed legacy ComicsListPage
// import ComicsListPage from './resources/series/ComicsListPage';
import utils from "../utils";
import PageLogin from "./page-login/PageLogin";
import PageLogout from "./page-logout/PageLogout";
import PagePullLists from "./page-pull-lists/PagePullLists";
import PageResources from "./page-resources/PageResources";
import PullsPages from "./resources/pulls/PullsPages";
import UnreadIssuesPage from "./resources/unread-issues/UnreadIssuesPage";
import WeeksDetailPage from "./resources/weeks/WeeksDetailPage";

import "antd/dist/antd.css";

const { Header, Content, Footer } = Layout;

type PrivateRouteProps = {
  isAuthenticated: boolean;
  element: React.ReactElement;
};

const PrivateRoute = ({ isAuthenticated, element }: PrivateRouteProps) => {
  return isAuthenticated ? element : <Navigate to="/login" replace />;
};

export default observer(function App() {
  const store = useContext<Store>(StoreContext);
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
          <Menu mode="horizontal" selectedKeys={[]} style={{ lineHeight: "64px" }} theme="dark">
            {/* Removed legacy Comics nav */}
            {renderNavLink("/unread-issues", "Unread Issues")}
            {renderNavLink("/pull-lists", "Pull Lists")}
            {renderNavLink(`/weeks/${utils.nearestWed()}`, "Weeks")}
            {renderNavLink("/pulls", "Pulls")}
            {renderNavLink("/resources", "Resources")}
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
              {/* Redirect root to Unread Issues now that Comics page is removed */}
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
                path="/resources"
                element={
                  <PrivateRoute isAuthenticated={isAuthenticated} element={<PageResources />} />
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

            <Footer style={{ textAlign: "center" }}>Read more comics</Footer>
          </Content>
        </Layout>
      </Layout>
    </Router>
  );
});

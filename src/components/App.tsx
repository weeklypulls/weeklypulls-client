import { Layout, Menu } from "antd";
import { observer } from "mobx-react";
import React, { useContext } from "react";
import {
  BrowserRouter as Router,
  NavLink,
  Redirect,
  Route,
  RouteComponentProps,
  RouteProps,
} from "react-router-dom";

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

const PrivateRoute = ({
  component,
  isAuthenticated,
  ...rest
}: RouteProps & { isAuthenticated: boolean }) => {
  if (!component) {
    throw Error("component is undefined");
  }

  const PageComponent = component; // JSX Elements have to be uppercase.
  const render = (props: RouteComponentProps<any>): React.ReactNode => {
    if (isAuthenticated) {
      return <PageComponent {...props} />;
    }
    return <Redirect to={{ pathname: "/login" }} />;
  };

  return <Route {...rest} render={render} />;
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

  const renderLoginPage = (props: RouteComponentProps) => <PageLogin {...props} />;

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
            {/* Redirect root to Unread Issues now that Comics page is removed */}
            <Route path="/" exact render={() => <Redirect to="/unread-issues" />} />
            <PrivateRoute
              isAuthenticated={isAuthenticated}
              path="/unread-issues"
              component={UnreadIssuesPage}
            />
            <PrivateRoute
              isAuthenticated={isAuthenticated}
              path="/pull-lists"
              component={PagePullLists}
            />
            <PrivateRoute isAuthenticated={isAuthenticated} path="/pulls" component={PullsPages} />
            <PrivateRoute
              isAuthenticated={isAuthenticated}
              path="/weeks/:weekId"
              component={WeeksDetailPage}
            />
            <PrivateRoute
              isAuthenticated={isAuthenticated}
              path="/resources"
              component={PageResources}
            />
            <PrivateRoute isAuthenticated={isAuthenticated} path="/logout" component={PageLogout} />
            <Route path="/login" render={renderLoginPage} />
          </Content>

          <Footer style={{ textAlign: "center" }}>Read more comics</Footer>
        </Layout>
      </Layout>
    </Router>
  );
});

import React, { Component } from 'react';
import { observer, Provider } from 'mobx-react';
import autoBindMethods from 'class-autobind-decorator';

import { Layout, Menu } from 'antd';
import {
  BrowserRouter as Router,
  NavLink,
  Redirect,
  Route,
  RouteComponentProps,
  RouteProps,
} from 'react-router-dom';

import Store from '../store';

import ComicsListPage from './resources/series/ComicsListPage';
import PageLogin from './page-login/PageLogin';
import PullsListPage from './resources/pulls/PullsPages';
import WeekPage from './resources/weeks/WeeksDetailPage';
import PageLogout from './page-logout/PageLogout';
import PageResources from './page-resources/PageResources';

import 'antd/dist/antd.css';
import PagePullLists from './page-pull-lists/PagePullLists';

const { Header, Content, Footer } = Layout;

const PrivateRoute = ({ component, isAuthenticated, ...rest }: RouteProps & { isAuthenticated: boolean }) => {
  if (!component) {
    throw Error('component is undefined');
  }

  const PageComponent = component; // JSX Elements have to be uppercase.
  const render = (props: RouteComponentProps<any>): React.ReactNode => {
    if (isAuthenticated) {
      return <PageComponent {...props} />;
    }
    return <Redirect to={{ pathname: '/login' }} />;
  };

  return (<Route {...rest} render={render} />);
};

interface IProps {
  store: Store;
}

@autoBindMethods
@observer
class App extends Component<IProps> {
  public renderLoginPage (props: RouteComponentProps) { return <PageLogin {...props} {...this.props} />; }

  private renderNavLink (to: string, label: string) {
    return (
      <Menu.Item key={to}>
        <NavLink to={to}>
          <span>{label}</span>
        </NavLink>
      </Menu.Item>
    );
  }

  public render () {
    const { store } = this.props
      , { getOptions, isAuthenticated } = store;

    return (
      <Provider store={store} getOptions={getOptions}>
        <Router>
          <Layout style={{ minHeight: '100vh' }}>
            <Header>
              <div className='logo' />
              <Menu
                mode='horizontal'
                selectedKeys={[]}
                style={{ lineHeight: '64px' }}
                theme='dark'
              >
                {this.renderNavLink('/', 'Comics')}
                {this.renderNavLink('/pull-lists', 'Pull Lists')}
                {this.renderNavLink('/pulls', 'Pulls')}
                {this.renderNavLink('/resources', 'Resources')}
                {this.renderNavLink('/logout', 'Logout')}
              </Menu>
            </Header>

            <Layout>
              <Content style={{ margin: '16px', padding: 24, background: '#fff', minHeight: 280 }}>
                <PrivateRoute isAuthenticated={isAuthenticated} exact path='/' component={ComicsListPage} />
                <PrivateRoute isAuthenticated={isAuthenticated} path='/pull-lists' component={PagePullLists} />
                <PrivateRoute isAuthenticated={isAuthenticated} path='/pulls' component={PullsListPage} />
                <PrivateRoute isAuthenticated={isAuthenticated} path='/weeks/:weekId' component={WeekPage} />
                <PrivateRoute isAuthenticated={isAuthenticated} path='/resources' component={PageResources} />
                <PrivateRoute isAuthenticated={isAuthenticated} path='/logout' component={PageLogout} />
                <Route path='/login' render={this.renderLoginPage} />
              </Content>

              <Footer style={{ textAlign: 'center' }}>
                Read more comics
              </Footer>
            </Layout>
          </Layout>
        </Router>
      </Provider>
    );
  }
}

export default App;

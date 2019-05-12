import React, { Component } from 'react';
import { observer, Provider } from 'mobx-react';
import autoBindMethods from 'class-autobind-decorator';

import { Layout, Menu, Icon } from 'antd';
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

import 'antd/dist/antd.css';
import PageLogout from './page-logout/PageLogout';

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
                <Menu.Item key='home'>
                  <NavLink to='/'>
                    <Icon type='home' />
                    <span>Comics</span>
                  </NavLink>
                </Menu.Item>
                <Menu.Item key='/pulls'>
                  <NavLink to='/pulls'>
                    <Icon type='plus-circle-o' />
                    <span>Pulls</span>
                  </NavLink>
                </Menu.Item>
                <Menu.Item key='/logout'>
                  <NavLink to='/logout'>
                    <Icon type='user' />
                    <span>Logout</span>
                  </NavLink>
                </Menu.Item>
              </Menu>
            </Header>

            <Layout>
              <Content style={{ margin: '16px', padding: 24, background: '#fff', minHeight: 280 }}>
                <PrivateRoute isAuthenticated={isAuthenticated} exact path='/' component={ComicsListPage} />
                <PrivateRoute isAuthenticated={isAuthenticated} path='/pulls' component={PullsListPage} />
                <PrivateRoute isAuthenticated={isAuthenticated} path='/weeks/:weekId' component={WeekPage} />
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

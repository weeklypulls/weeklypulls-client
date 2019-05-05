import React, { Component } from 'react';
import { observer, Provider } from 'mobx-react';
import autoBindMethods from 'class-autobind-decorator';

import { Layout, Menu, Icon } from 'antd';
import {
  BrowserRouter as Router,
  NavLink,
  Route,
  RouteComponentProps,
} from 'react-router-dom';

import Store from '../store';

import ComicsListPage from './resources/series/ComicsListPage';
import LoginPage from './login/LoginPage';
import PullsListPage from './resources/pulls/PullsPages';
import WeekPage from './resources/weeks/WeeksDetailPage';

import 'antd/dist/antd.css';

const { Header, Content, Footer } = Layout;

interface IProps {
  store: Store;
}

@autoBindMethods
@observer
class App extends Component<IProps> {
  public renderComicsListPage (props: RouteComponentProps) { return <ComicsListPage {...props} {...this.props} />; }
  public renderPullsListPage (props: RouteComponentProps) { return <PullsListPage {...props} {...this.props} />; }
  public renderWeekPage (props: RouteComponentProps) { return <WeekPage {...props} {...this.props} />; }
  public renderLoginPage (props: RouteComponentProps) { return <LoginPage {...props} {...this.props} />; }

  public render () {
    return (
      <Provider store={this.props.store}>
        <Router>
          <Layout style={{ minHeight: '100vh' }}>
            <Header>
              <div className='logo' />
              <Menu
                selectedKeys={[]}
                theme='dark'
                mode='horizontal'
                style={{ lineHeight: '64px' }}
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
                <Menu.Item key='/login'>
                  <NavLink to='/login'>
                    <Icon type='user' />
                    <span>Login</span>
                  </NavLink>
                </Menu.Item>
              </Menu>
            </Header>

            <Layout>
              <Content style={{ margin: '16px', padding: 24, background: '#fff', minHeight: 280 }}>
                <Route exact path='/' render={this.renderComicsListPage} />
                <Route path='/pulls' render={this.renderPullsListPage} />
                <Route path='/login' render={this.renderLoginPage} />
                <Route path='/weeks/:weekId' component={this.renderWeekPage} />
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

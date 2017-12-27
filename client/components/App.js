import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import autoBindMethods from 'class-autobind-decorator';

import { Layout, Menu, Icon } from 'antd';
import {
  BrowserRouter as Router,
  Route,
  NavLink,
} from 'react-router-dom';

import ComicsListPage from './pages/ComicsListPage';
import LoginPage from './pages/LoginPage';
import SeriesListPage from './pages/SeriesListPage';

import 'antd/dist/antd.css';

const { Header, Sider, Content } = Layout;

@autoBindMethods
@observer
class App extends Component {
  @observable collapsed = false;
  defaultSelectedKeys = []

  constructor (props) {
    super(props);
    const key = window.location.pathname.substr(1,).split('/')[0];
    this.defaultSelectedKeys.push(`/${key}`);
  }

  toggle () {
    this.collapsed = !this.collapsed;
  }

  renderComicsListPage (props) { return <ComicsListPage {...props} {...this.props} />; }
  renderSeriesListPage (props) { return <SeriesListPage {...props} {...this.props} />; }
  renderLoginPage (props) { return <LoginPage {...props} {...this.props} />; }

  render () {
    return (
      <Router history={this.history}>
        <Layout style={{ minHeight: '100vh' }}>
          <Sider
            breakpoint='lg'
            trigger={null}
            collapsible
            collapsed={this.collapsed}
          >
            <div className='logo' />
            <Menu theme='dark' mode='inline' defaultSelectedKeys={this.defaultSelectedKeys}>
              <Menu.Item key='home'>
                <NavLink to='/'>
                  <Icon type='home' />
                  <span>Comics</span>
                </NavLink>
              </Menu.Item>
              <Menu.Item key='/series'>
                <NavLink to='/series'>
                  <Icon type='plus-circle-o' />
                  <span>Series</span>
                </NavLink>
              </Menu.Item>
              <Menu.Item key='/login'>
                <NavLink to='/login'>
                  <Icon type='user' />
                  <span>Login</span>
                </NavLink>
              </Menu.Item>
            </Menu>
          </Sider>

          <Layout>
            <Header style={{ background: '#fff', padding: 0 }}>
              <Icon
                className='trigger'
                type={this.collapsed ? 'menu-unfold' : 'menu-fold'}
                onClick={this.toggle}
              />
            </Header>

            <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', minHeight: 280 }}>
              <Route exact path='/' render={this.renderComicsListPage} />
              <Route path='/series' render={this.renderSeriesListPage} />
              <Route path='/login' render={this.renderLoginPage} />
            </Content>
          </Layout>
        </Layout>
      </Router>
    );
  }
}

export default App;

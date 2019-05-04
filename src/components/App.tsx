import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer, Provider } from 'mobx-react';
import autoBindMethods from 'class-autobind-decorator';

import { Layout, Menu, Icon } from 'antd';
import {
  BrowserRouter as Router,
  Route,
  NavLink,
} from 'react-router-dom';

import ComicsListPage from './resources/series/ComicsListPage';
import LoginPage from './login/LoginPage';
import PullsListPage from './resources/pulls/PullsPages';
import WeekPage from './resources/weeks/WeeksDetailPage';

import 'antd/dist/antd.css';

const { Header, Content, Footer } = Layout;

@autoBindMethods
@observer
class App extends Component<any> {
  public history: any;

  renderComicsListPage (props) { return <ComicsListPage {...props} {...this.props} />; }
  renderPullsListPage (props) { return <PullsListPage {...props} {...this.props} />; }
  renderWeekPage (props) { return <WeekPage {...props} {...this.props} />; }
  renderLoginPage (props) { return <LoginPage {...props} {...this.props} />; }

  render () {
    return (
      <Provider store={this.props.store}>
        <Router history={this.history}>
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

  static propTypes = {
    store: PropTypes.object.isRequired,
  }
}

export default App;
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { observable } from 'mobx';

import autoBindMethods from 'class-autobind-decorator';
import { Layout, Menu, Icon } from 'antd';
import createBrowserHistory from 'history/createBrowserHistory'
import {
  BrowserRouter as Router,
  Route,
  NavLink,
  Link
} from 'react-router-dom'

import Weeks from './Weeks';

import 'antd/dist/antd.css';

const { Header, Sider, Content } = Layout;

@autoBindMethods
class App extends Component {
  @observable collapsed = false;
  defaultSelectedKeys = []

  constructor (props) {
    super(props);
    const key = '/' + window.location.pathname.substr(1,).split('/')[0];
    this.defaultSelectedKeys.push(key);
  }

  toggle () {
    this.collapsed = !this.collapsed;
  }

  render () {
    return (
      <Router history={this.history}>
        <Layout>
          <Sider
            breakpoint='lg'
            trigger={null}
            collapsible
            collapsed={this.collapsed}
          >
            <div className='logo' />
            <Menu theme='dark' mode='inline' defaultSelectedKeys={this.defaultSelectedKeys}>
              <Menu.Item key='home'>
                <NavLink to="/">
                  <Icon type='home' />
                  <span>Comics</span>
                </NavLink>
              </Menu.Item>
              <Menu.Item key='/series'>
                <NavLink to="/series">
                  <Icon type='plus-circle-o' />
                  <span>Series</span>
                </NavLink>
              </Menu.Item>
              <Menu.Item key='/login'>
                <NavLink to="/login">
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
                <Route exact path="/" render={(props) => <ComicsListPage {...props} {...this.props} />}/>
                <Route path="/series" render={(props) => <SeriesListPage {...props} {...this.props} />}/>
                <Route path="/login" render={(props) => <LoginPage {...props} {...this.props} />}/>
              </Content>
            </Layout>
        </Layout>
      </Router>
    );
  }
}

@autoBindMethods
class LoginPage extends Component {
  render () {
    return (
      <div>
        <h2>About</h2>
      </div>
    );
  }
}

@autoBindMethods
class SeriesListPage extends Component {
  render () {
    const { match } = this.props;
    return (
      <div>
        <h2>Series</h2>
        <ul>
          <li>
            <Link to={`${match.url}/rendering`}>
              Rendering with React
            </Link>
          </li>
          <li>
            <Link to={`${match.url}/components`}>
              Components
            </Link>
          </li>
          <li>
            <Link to={`${match.url}/props-v-state`}>
              Props v. State
            </Link>
          </li>
        </ul>

        <Route path={`${match.url}/:topicId`} component={Topic}/>
        <Route exact path={match.url} render={() => {
          return <h3>Please select a series.</h3>;
        }}/>
      </div>
    );
  }
}

@autoBindMethods
class Topic extends Component {
  render () {
    const { match } = this.props;
    return (
      <div>
        <h3>{match.params.topicId}</h3>
      </div>
    );
  }
}

@autoBindMethods
@observer
class ComicsListPage extends Component {
  render () {
    const { store } = this.props;

    return (
      <div className='weeks'>
        <h1>Weeks</h1>
        <Weeks
          store={store}
          series={store.series.values()}
        />
      </div>
    );
  }

  static propTypes = {
    store: PropTypes.object,
  }
}

export default App;

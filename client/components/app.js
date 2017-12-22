import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { observable } from 'mobx';

import autobind from 'autobind-decorator';
import _ from 'lodash';
import { Layout, Menu, Icon } from 'antd';

import Series from './series';
import Weeks from './weeks';

import 'antd/dist/antd.css';

const { Header, Sider, Content } = Layout;

@autobind
@observer
class App extends Component {
  @observable collapsed = false;

  toggle () {
    this.collapsed = !this.collapsed;
  }

  renderWeeks () {
    const {
      store,
    } = this.props;

    return (
      <div className='weeks'>
        <h1>Weeks</h1>
        <Weeks
          store={store}
          mark={store.mark}
          series={store.series.values()}
        />
      </div>
    );
  }

  renderSeries () {
    const {
      store,
    } = this.props;

    return (
      <div className='series'>
        <h1>Series</h1>
        {_.sortBy(store.series.values(), 'api.title').map(series => (
          <Series
            key={series.id}
            mark={store.mark}
            series={series}
            store={store}
          />
        ))}
      </div>
    );
  }

  render () {
    const {
      store,
    } = this.props;

    // {this.renderSeries()}
    return (
      <Layout>
        <Sider
          breakpoint='lg'
          trigger={null}
          collapsible
          collapsed={this.collapsed}
        >
          <div className='logo' />
          <Menu theme='dark' mode='inline' defaultSelectedKeys={['1']}>
            <Menu.Item key='1'>
              <Icon type='user' />
              <span>nav 1</span>
            </Menu.Item>
            <Menu.Item key='2'>
              <Icon type='video-camera' />
              <span>nav 2</span>
            </Menu.Item>
            <Menu.Item key='3'>
              <Icon type='upload' />
              <span>nav 3</span>
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
            <div className={store.isLoading.get('app') ? 'loading' : ''}>
              {this.renderWeeks()}
            </div>
          </Content>
        </Layout>
      </Layout>
    );
  }

  static propTypes = {
    store: PropTypes.object,
  }
}

export default App;

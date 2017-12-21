import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import autobind from 'autobind-decorator';

@autobind
@observer
class Trigger extends Component {
  @observable styles = {};

  componentDidMount () {
    const childStyles = this.refs.triggerContainer.children[0].style;
    this.styles = {
      width: childStyles.width,
      height: childStyles.height,
      margin: childStyles.margin,
    };
  }

  render () {
    return (
      <div
        onMouseOver={this.setVisibilityTrue}
        onMouseOut={this.setVisibilityFalse}
        onTouchStart={this.setVisibilityTrue}
        onTouchEnd={this.setVisibilityFalse}
        ref='triggerContainer'
        style={this.styles}
      >
        {this.props.children.props.children}
      </div>
    );
  }

  setVisibilityTrue () {
    this.props.children.props.setVisibility(true);
  }

  setVisibilityFalse () {
    this.props.children.props.setVisibility(false);
  }

  static propTypes = {
    children: PropTypes.object,
    setVisibility: PropTypes.func,
  }
}

export default Trigger;

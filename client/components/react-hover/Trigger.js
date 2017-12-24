import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import autobind from 'autobind-decorator';

@autobind
@observer
class Trigger extends Component {
  @observable styles = {};

  componentDidMount () {
    const childStyles = this.refTriggerContainer.children[0].style;
    this.styles = {
      height: childStyles.height,
      margin: childStyles.margin,
      width: childStyles.width,
      zIndex: '1',
    };
  }

  setRefTriggerContainer (component) {
    this.refTriggerContainer = component;
  }

  setVisibilityTrue () {
    this.props.children.props.setVisibility(true);
  }

  setVisibilityFalse () {
    this.props.children.props.setVisibility(false);
  }

  render () {
    return (
      <div
        onMouseOut={this.setVisibilityFalse}
        onMouseOver={this.setVisibilityTrue}
        onTouchEnd={this.setVisibilityFalse}
        onTouchStart={this.setVisibilityTrue}
        ref={this.setRefTriggerContainer}
        style={this.styles}
      >
        {this.props.children.props.children}
      </div>
    );
  }

  static propTypes = {
    children: PropTypes.object,
    setVisibility: PropTypes.func,
  }
}

export default Trigger;

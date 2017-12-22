import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class Hover extends Component {
  static propTypes = {
    children: PropTypes.object,
    visibility: PropTypes.bool,
  };

  render () {
    const {
      visibility,
      children,
    } = this.props.children.props
    , styles = {
      display: visibility ? 'block' : 'none',
      position: 'absolute',
    }
    ;

    return (
      <div style={styles}>
        {visibility && children}
      </div>
    );
  }
}

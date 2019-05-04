import React, { Component, CSSProperties } from 'react';
import PropTypes from 'prop-types';

export default class Hover extends Component<any> {
  static propTypes = {
    children: PropTypes.object,
    visibility: PropTypes.bool,
  };

  render () {
    const {
        visibility,
        children,
      } = (this.props.children as any).props
      , styles: CSSProperties = {
        display: visibility ? 'block' : 'none',
        position: 'absolute',
        zIndex: 1000,
      }
      ;

    return (
      <div style={styles}>
        {visibility && children}
      </div>
    );
  }
}

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import autoBindMethods from 'class-autobind-decorator';

import Hover from './Hover';
import Trigger from './Trigger';

@autoBindMethods
@observer
class ReactHover extends Component<any> {
  public static Trigger: any;
  public static Hover: any;

  @observable visibility = false;

  renderItem (item, index) {
    if (item.type === Trigger) {
      return (
        <Trigger key={index}>
          {item}
        </Trigger>
      );
    }
    else if (item.type === Hover) {
      return (
        <Hover key={index}>
          {item}
        </Hover>
      );
    }
  }

  render () {
    const childrenWithProps = [];

    for (const child of (this.props.children as any[])) {
      if (child.type) {
        if (child.type === Trigger) {
          childrenWithProps.push(React.cloneElement(child, {
            setVisibility: this.setVisibility,
          }));
        }
        else if (child.type === Hover) {
          childrenWithProps.push(React.cloneElement(child, {
            visibility: this.visibility,
          }));
        }
      }
    }

    return (
      <div style={{ display: 'inline-block', position: 'relative' }}>
        {childrenWithProps.map((item, index) => this.renderItem(item, index))}
      </div>
    );
  }

  setVisibility (flag) {
    this.visibility = flag;
  }

  static propTypes = {
    children: PropTypes.array.isRequired,
    options: PropTypes.object.isRequired,
    className: PropTypes.string,
  }
}

ReactHover.Trigger = Trigger;
ReactHover.Hover = Hover;

export default ReactHover;

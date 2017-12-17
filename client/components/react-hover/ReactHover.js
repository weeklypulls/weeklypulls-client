import React, { Component } from 'react'
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import Hover from './lib/Hover'
import Trigger from './lib/Trigger'
import PropTypes from 'prop-types'
import autobind from 'autobind-decorator';

@autobind
@observer
class ReactHover extends Component {
  @observable visibility = false;

  renderItem (item, index) {
    if (item.type.name === 'Trigger') {
      return (
        <Trigger key={index}>
          {item}
        </Trigger>
      );
    }
    else if (item.type.name === 'Hover') {
      return (
        <Hover key={index}>
          {item}
        </Hover>
      );
    }
  }

  render () {
    const childrenWithProps = [];

    for (const child of this.props.children) {
      if (child.type) {
        if (child.type.name === 'Trigger') {
          childrenWithProps.push(React.cloneElement(child, {
            setVisibility: this.setVisibility,
          }));
        }
        else if (child.type.name === 'Hover') {
          childrenWithProps.push(React.cloneElement(child, {
            visibility: this.visibility,
          }));
        }
      }
    }

    return (
      <div>
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

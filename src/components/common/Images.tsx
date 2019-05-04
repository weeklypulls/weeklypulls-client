import React, { Component } from 'react';
import autoBindMethods from 'class-autobind-decorator';
import { observer, propTypes } from 'mobx-react';
import { Icon } from 'antd';
import ReactHover from './react-hover/ReactHover';


@autoBindMethods
@observer
class Images extends Component<any> {
  render () {
    const { images } = this.props;

    return images.map(image => (
      <ReactHover
        key={image}
        options={{
          followCursor: false,
          shiftX: 20,
          shiftY: 0,
        }}>
        <ReactHover.Trigger>
          <a className='action-button' href={image} target='_blank'>
            <Icon type='picture' />
          </a>
        </ReactHover.Trigger>
        <ReactHover.Hover>
          <img className='cover' src={image} />
        </ReactHover.Hover>
      </ReactHover>
    ));
  }

  static propTypes = {
    images: propTypes.arrayOrObservableArray.isRequired,
  }
}

export default Images;

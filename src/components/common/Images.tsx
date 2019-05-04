import React, { Component } from 'react';
import autoBindMethods from 'class-autobind-decorator';
import { observer, propTypes } from 'mobx-react';
import { Icon, Popover } from 'antd';


@autoBindMethods
@observer
class Images extends Component<any> {
  render () {
    const { images } = this.props;

    return images.map(image => (
      <Popover
        content={<img className='cover' alt='Cover' src={image} />}
        key={image}
        placement='bottom'
      >
        <a
          title={image}
          className='action-button'
          href={image}
          rel='noopener noreferrer'
          style={{ marginLeft: '2px' }}
          target='_blank'
        >
          <Icon type='picture' />
        </a>
      </Popover>
    ));
  }

  static propTypes = {
    images: propTypes.arrayOrObservableArray.isRequired,
  }
}

export default Images;

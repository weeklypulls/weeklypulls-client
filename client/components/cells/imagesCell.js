import React from 'react';
import { Icon } from 'antd';

import ReactHover from '../react-hover';


export default function imagesCell (text, record) {
  return record.images.map(image => (
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

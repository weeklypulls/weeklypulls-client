import React from 'react';

import BoolButton from '../BoolButton';
import consts from '../../consts';

const { ACTIONS } = consts;


export default function readCell (text, record) {
  return (
    <BoolButton
      actions={[ACTIONS.READ, ACTIONS.UNREAD]}
      comic={record}
      icons={['check-square-o', 'close']}
      langs={['Mark read', 'Mark unread']}
      store={record.store}
      value={record.read}
    />
  );
}

import React from 'react';

import BoolButton from '../BoolButton';
import consts from '../../consts';

const { ACTIONS } = consts;


export default function readCell (text, record) {
  return (
    <BoolButton
      actions={[ACTIONS.UNREAD, ACTIONS.READ]}
      comic={record}
      icons={['check-square-o', 'close']}
      langs={['Mark unread', 'Mark read']}
      store={record.store}
      value={record.read}
    />
  );
}

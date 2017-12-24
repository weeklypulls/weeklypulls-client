import React from 'react';

import BoolButton from '../BoolButton';
import consts from '../../consts';

const {
  ACTIONS,
} = consts;

export default function skippedCell (text, record) {
  return (
    <BoolButton
      actions={[ACTIONS.SKIP, ACTIONS.UNSKIP]}
      comic={record}
      icons={['double-right', 'close']}
      langs={['Skip', 'Unskip']}
      store={record.store}
      value={record.skipped}
    />
  );
}

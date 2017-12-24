import React, { Component } from 'react';
import PropTypes from 'prop-types';
import autoBindMethods from 'class-autobind-decorator';;
import { observer } from 'mobx-react';
import { Icon } from 'antd';


@autoBindMethods
@observer
class BoolButton extends Component {
  mark () {
    const {
        actions,
        comic: { id, series_id },
        store,
        value,
      } = this.props
      , action = actions[value ? 1 : 0];

    store.mark(series_id, id, action);
  }

  render () {
    const { value, langs, icons } = this.props
      , icon = icons[value ? 1 : 0]
      , lang = langs[value ? 1 : 0];

    return (
      <a className='action-button' onClick={this.mark}>
        <Icon type={icon} alt={lang} />
      </a>
    );
  }

  static propTypes = {
    actions: PropTypes.array.isRequired,
    comic: PropTypes.object.isRequired,
    icons: PropTypes.array.isRequired,
    langs: PropTypes.array.isRequired,
    store: PropTypes.object.isRequired,
    value: PropTypes.bool.isRequired,
  }
}

export default BoolButton;

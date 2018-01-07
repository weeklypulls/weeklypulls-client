import React, { Component } from 'react';
import PropTypes from 'prop-types';
import autoBindMethods from 'class-autobind-decorator';
import { observer } from 'mobx-react';
import { observable } from 'mobx';

import utils from '../../utils';
import SeriesFormModal from '../forms/SeriesFormModal';

const { ModalManager } = utils;

@autoBindMethods
@observer
class PullButton extends Component {
  pullModal = new ModalManager();
  @observable isSubmitting = false;

  render () {
    const { record } = this.props
      , { store, series_id } = record
      , pull = store.pulls.getBy('series_id', series_id);

    if (pull) {
      return store.pullLists.get(pull.pull_list_id).title;
    }

    return (
      <span>
        {this.pullModal.isShowing &&
          <SeriesFormModal data={{ series_id, api: record }} store={store} onClose={this.pullModal.close} />}

        <a onClick={this.pullModal.open}>Pull</a>
      </span>
    );
  }

  static propTypes = {
    text: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    record: PropTypes.object.isRequired,
  }
}

export default function pullListCell (text, record) {
  return <PullButton text={text} record={record} />;
}

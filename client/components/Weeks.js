import React, { Component } from 'react';
import PropTypes from 'prop-types';
import autobind from 'autobind-decorator';
import { toJS } from 'mobx';
import { observer, propTypes } from 'mobx-react';
import _ from 'lodash';

import utils from '../utils';

import Week from './Week';


@autobind
@observer
class Weeks extends Component {
  render () {
    const {
      store,
    } = this.props;

    const comics = this.props.series.reduce((flat, toFlatten) => {
      return flat.concat(toJS(toFlatten.comics));
    }, []);

    const weeks = Array.from(new Set(comics.map(comic => comic.on_sale)));
    weeks.sort();

    const firstUnreadWeek = store.firstUnreadWeek(this.props.series)
      , firstUnreadWeekIndex = _.findIndex(weeks, week => (week === firstUnreadWeek))
      , weeksUnread = weeks.slice(firstUnreadWeekIndex, weeks.length)
      , weeksPublished = weeksUnread.filter(week => !utils.future(week))
      ;

    return (
      <div className='weeks'>
        {weeksPublished.map(week => (
          <Week
            comics={comics.filter(comic => (comic.on_sale === week))}
            key={week}
            mark={this.props.store.mark}
            store={store}
            week={week}
          />)
        )}
      </div>
    );
  }

  static propTypes = {
    series: propTypes.arrayOrObservableArray,
    store: PropTypes.object,
  }
}

export default Weeks;

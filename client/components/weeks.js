import React, { Component } from 'react';
import PropTypes from 'prop-types';
import autobind from 'autobind-decorator';
import { observable, toJS } from 'mobx';
import { observer, propTypes } from 'mobx-react';
import _ from 'lodash';

import utils from '../utils';
import Comic from './comic';


@autobind
@observer
class Week extends Component {
  @observable minimized = null;

  constructor (props) {
    super(props);
  }

  defaultMinimized () {
    const futureWeek = utils.future(this.props.week)
      , allRead = !this.props.comics.some(comics => !(comics.read || comics.skipped));

    return futureWeek || allRead;
  }

  getMinimized () {
    if (this.minimized === null) {
      return this.defaultMinimized();
    }
    return this.minimized;
  }

  toggleMinimized () {
    if (this.minimized === null) {
      this.minimized = !this.defaultMinimized();
    }
    else {
      this.minimized = !this.minimized;
    }
  }

  loadWeek () {
    this.props.store.loadWeek(this.props.week);
  }

  get extraComics () {
    const {
      comics,
      store,
      week,
    } = this.props;

    const comicIds = comics.map(comic => comic.id);
    return store.extraComics(week).filter(comic => !comicIds.includes(comic.id));
  }

  render () {
    const {
      comics,
      store,
      week,
    } = this.props
    , weekLoading = store.isLoading.get(`week.${week}`);

    return (
      <div className='week'>
        <h5>{week} <a onClick={this.toggleMinimized}>[{this.minimized ? '+' : '-'}]</a></h5>

        {!this.getMinimized() && (<div>
          {_.sortBy(comics, 'title').map(comic => (
            <Comic
              comic={comic}
              key={`week${week}_comic${comic.id}`}
              pulled
              store={store}
            />
          ))}
          {_.sortBy(this.extraComics, 'title').map(comic => (
            <Comic
              comic={comic}
              key={`week${week}_comic${comic.id}`}
              pulled={false}
              store={store}
            />
          ))}
          {!this.extraComics.length &&
            <a onClick={this.loadWeek} disabled={weekLoading}>
              {weekLoading ? 'Loading...' : 'Load All'}
            </a>}
        </div>)}
      </div>
    );
  }

  static propTypes = {
    comics: propTypes.arrayOrObservableArray,
    mark: PropTypes.func,
    store: PropTypes.object,
    week: PropTypes.string,
  }
}

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
      , weeksUnread = weeks.slice(firstUnreadWeekIndex, weeks.length);

    return (
      <div className='weeks'>
        {weeksUnread.map(week => (
          <Week
            comics={comics.filter(comic => (comic.on_sale === week))}
            key={week}
            mark={this.props.mark}
            store={store}
            week={week}
          />)
        )}
      </div>
    );
  }

  static propTypes = {
    mark: PropTypes.func,
    series: propTypes.arrayOrObservableArray,
    store: PropTypes.object,
  }
}

export default Weeks;

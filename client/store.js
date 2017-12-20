import axios from 'axios';
import autobind from 'autobind-decorator';
import { observable, action } from 'mobx';
import _ from 'lodash';

import consts from './consts';

const {
  ACTIONS,
} = consts;


@autobind
class Store {
  @observable isLoading = new Map();
  @observable pulls = new Map();
  @observable series = new Map();
  @observable weeks = new Map();

  constructor () {
    this.getAllSeries();
  }

  _firstUnreadWeek (serie) {
    const pull = this.pulls.get(serie.series_id)
      , comics = serie.comics
      , comicsUnread = comics.filter(comic => !(pull.read.includes(comic.id) || pull.skipped.includes(comic.id)))
      , weeks = comicsUnread.map(comic => comic.on_sale)
      , firstWeek = weeks.sort()[0]
      ;

    return firstWeek;
  }

  firstUnreadWeek (series) {
    const allStartWeeks = series.map(serie => this._firstUnreadWeek(serie))
      , lastStartWeek = allStartWeeks.filter(s => s).sort()[0];

    return lastStartWeek
  }

  extraComics (week) {
    if (!this.weeks.has(week)) {
      this.weeks.set(week, []);
    }
    return this.weeks.get(week);
  }

  @action
  async getAllSeries () {
    console.log('getAllSeries');
    this.isLoading.set('app', true);
    const response = await axios.get('https://weeklypulls-data.herokuapp.com/series/')
      , pulls = response.data;

    for (let pull of pulls) {
      this.pulls.set(pull.series_id, pull);
      await this.getSeries(pull.series_id);
    }
    this.isLoading.set('app', false);
  }

  @action
  async getSeries (series_id) {
    try {
      const response = await axios.get(`https://weeklypulls-marvel.herokuapp.com/series/${series_id}/`);
      this.series.set(response.data.series_id, response.data);
    }
    catch (e) {
      console.error(e);
    }
  }

  @action
  async pull (series_id) {
    this.isLoading.set('app', true);
    const response = await axios.post('https://weeklypulls-data.herokuapp.com/series/', { series_id });
    this.pulls.set(response.data.series_id, response.data);
    this.getSeries(response.data.series_id)
    this.isLoading.set('app', false);
  }

  @action
  async loadWeek (week) {
    this.isLoading.set(`week.${week}`, true);
    const response = await axios.get(`https://weeklypulls-marvel.herokuapp.com/weeks/${week}/`);
    this.weeks.set(week, response.data.comics);
    this.isLoading.set(`week.${week}`, false);
  }

  @action
  async mark (seriesId, issueId, action) {
    this.isLoading.set(`series.${seriesId}`, true);
    const pull = this.pulls.values().find(series => (series.series_id === seriesId))
      , data = {}
      , read = new Set(pull.read)
      , skipped = new Set(pull.skipped)
      ;

    switch (action) {
      case ACTIONS.READ:
        read.add(issueId);
        data['read'] = Array.from(read);
        break;

      case ACTIONS.UNREAD:
        read.delete(issueId);
        data['read'] = Array.from(read);
        break;

      case ACTIONS.SKIP:
        skipped.add(issueId);
        data['skipped'] = Array.from(skipped);
        break;

      case ACTIONS.UNSKIP:
        skipped.delete(issueId);
        data['skipped'] = Array.from(skipped);
        break;

      default:
        // eslint-disable-next-line no-alert
        alert(`Missed action ${action}`);
    }

    const response = await axios.patch(`https://weeklypulls-data.herokuapp.com/series/${pull.id}/`, data);
    this.pulls.set(response.data.series_id, response.data);
    this.isLoading.set(`series.${seriesId}`, false);
  }

  async fillInRead (seriesId) {
    this.isLoading.set(`series.${seriesId}`, true);
    const pull = this.pulls.get(seriesId)
      , series = this.series.get(seriesId)
      , comicsOrdered = _.orderBy(series.comics, 'on_sale')
      , lastRead = _.findLastIndex(comicsOrdered, comic => pull.read.contains(comic.id))
      , comicsToMarkUnread = comicsOrdered.slice(0, lastRead + 1)
      , issueIds = comicsToMarkUnread.map(comic => comic.id)
      , data = { read: issueIds }
      ;

    const response = await axios.patch(`http://localhost:8000/series/${series.id}/`, data);
    this.series.set(response.data.id, response.data);
    this.isLoading.set(`series.${seriesId}`, false);
  }
}

export default Store;

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
  @observable series = new Map();
  @observable weeks = new Map();

  constructor () {
    this.getAllSeries();
  }

  extraComics (week) {
    if (!this.weeks.has(week)) {
      this.weeks.set(week, []);
    }
    return this.weeks.get(week);
  }

  @action
  async getAllSeries () {
    this.isLoading.set('app', true);
    const response = await axios.get('https://weeklypulls-data.herokuapp.com/series/');
    await Promise.all(response.data.map(series => this.getSeries(series.series_id)));
    this.isLoading.set('app', false);
  }

  @action
  async getSeries (series_id) {
    const response = await axios.get(`https://weeklypulls-marvel.herokuapp.com/series/${series_id}/`);
    this.series.set(response.data.id, response.data);
  }

  @action
  async pull (series_id) {
    this.isLoading.set('app', true);
    const response = await axios.post('https://weeklypulls-data.herokuapp.com/series/', { series_id });
    this.series.set(response.data.id, response.data);
    this.isLoading.set('app', false);
  }

  @action
  async loadWeek (week) {
    this.isLoading.set(`week.${week}`, true);
    const response = await axios.get(`http://localhost:8000/comics/week/${week}/`);
    this.weeks.set(week, response.data.comics);
    this.isLoading.set(`week.${week}`, false);
  }

  @action
  async mark (seriesId, issueId, action) {
    this.isLoading.set(`series.${seriesId}`, true);
    const series = this.series.values().find(series => (series.series_id === seriesId))
      , data = {}
      , read = new Set(series.read)
      , skipped = new Set(series.skipped)
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

    const response = await axios.patch(`http://localhost:8000/series/${series.id}/`, data);
    this.series.set(response.data.id, response.data);
    this.isLoading.set(`series.${seriesId}`, false);
  }

  async fillInRead (seriesId) {
    this.isLoading.set(`series.${seriesId}`, true);
    const series = this.series.values().find(series => (series.series_id === seriesId))
      , comicsOrdered = _.orderBy(series.api.comics, 'on_sale')
      , lastRead = _.findLastIndex(comicsOrdered, { 'read': true })
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

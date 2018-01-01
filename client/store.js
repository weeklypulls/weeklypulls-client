import { action, observable } from 'mobx';
import autoBindMethods from 'class-autobind-decorator';
import store from 'store';

import consts from './consts';
import Client from './client';
import Resource from './resource';

const {
  ACTIONS,
} = consts;


@autoBindMethods
class Store {
  @observable _filters = null;

  constructor () {
    this.client = new Client();

    this.pulls = new Resource(this.client.user, 'pulls');
    this.pullLists = new Resource(this.client.user, 'pull-lists');

    this.series = new Resource(this.client.marvel, 'series', 'series_id');
    this.weeks = new Resource(this.client.marvel, 'weeks');

    this.pullLists.list();
  }

  setFilters (filters) {
    this._filters = filters;
    store.set('filters', filters);
  }

  get filters () {
    if (this._filters) {
      return this._filters;
    }

    const cache = store.get('filters');
    if (cache) {
      this._filters = cache;
      return this._filters;
    }

    this._filters = {};
    return this._filters;
  }

  get pullsWithApi () {
    return this.pulls.all.map(pull => ({
      ...pull,
      api: this.series.get(pull.series_id),
    }));
  }

  pullWithApi (id) {
    const pull = this.pulls.get(id);
    return {
      ...pull,
      api: this.series.get(pull.series_id),
    };
  }

  _firstUnreadWeek (serie) {
    const pull = this.pulls.getBy('series_id', serie.series_id)
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
    return lastStartWeek;
  }

  @action
  async getAllSeries () {
    const pulls = await this.pulls.list();
    for (const pull of pulls) {
      await this.series.fetch(pull.series_id);
    }
  }

  // @action
  // async pull (series_id) {
  //   const pull = await this.pulls.post({ series_id });
  //   return pull;
  // }

  @action
  async mark (seriesId, issueId, action) {
    const pull = this.pulls.getBy('series_id', seriesId)
      , data = {}
      , actions = {
        [ACTIONS.READ]: ['add', 'read'],
        [ACTIONS.UNREAD]: ['delete', 'read'],
        [ACTIONS.SKIP]: ['add', 'skipped'],
        [ACTIONS.UNSKIP]: ['delete', 'skipped'],
      }
      ;

    const [verb, noun] = actions[action]
      , set = new Set(pull[noun]);
    set[verb](issueId);
    data[noun] = Array.from(set);

    await this.pulls.patch(pull.id, data);
  }

  // async fillInRead (seriesId) {
  //   this.isLoading.set(`series.${seriesId}`, true);
  //   const pull = this.pulls.get(seriesId)
  //     , series = this.series.get(seriesId)
  //     , comicsOrdered = _.orderBy(series.comics, 'on_sale')
  //     , lastRead = _.findLastIndex(comicsOrdered, comic => pull.read.contains(comic.id))
  //     , comicsToMarkUnread = comicsOrdered.slice(0, lastRead + 1)
  //     , issueIds = comicsToMarkUnread.map(comic => comic.id)
  //     , data = { read: issueIds }
  //     ;
  //
  //   const response = await this.client.user.patch(`series/${series.id}/`, data);
  //   this.series.set(response.data.id, response.data);
  //   this.isLoading.set(`series.${seriesId}`, false);
  // }
}

export default Store;

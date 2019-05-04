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
  private client: Client;

  private pullLists: Resource;
  private pulls: Resource;
  private series: Resource;
  private weeks: Resource;

  constructor () {
    this.client = new Client();

    this.pulls = new Resource(this.client.user, 'pulls', { minutes: 20 });
    this.pullLists = new Resource(this.client.user, 'pull-lists', { weeks: 1 });

    this.series = new Resource(this.client.marvel, 'series', { weeks: 2 }, 'series_id');
    this.weeks = new Resource(this.client.marvel, 'weeks', { minutes: 20 }, 'week_of');

    this.pullLists.listIfCold();
  }

  get isLoading () {
    const resources = ['pulls', 'pullLists', 'series', 'weeks'];
    return resources.map(r => this[r].isLoading).some(x => x);
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

  pullsWithSeries () {
    return this.pulls.all.map(pull => ({
      pull,
      series: this.series.get(pull.series_id),
      pullList: this.pullLists.get(pull.pull_list_id),
      key: pull.id,
    }));
  }

  pullWithSeries (id) {
    const pull = this.pulls.get(id);
    return {
      pull,
      series: this.series.get(pull.series_id),
      pullList: this.pullLists.get(pull.pull_list_id),
      key: pull.id,
    };
  }

  _firstUnreadWeek (series) {
    const pull = this.pulls.getBy('series_id', series.series_id)
      , comics = series.comics
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
    const pulls = await this.pulls.listIfCold();
    for (const pull of pulls as any[]) {
      await this.series.fetchIfCold(pull.series_id);
    }
  }

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

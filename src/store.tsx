import { action, observable } from 'mobx';
import autoBindMethods from 'class-autobind-decorator';
import store from 'store';

import consts from './consts';
import Client from './client';
import Resource from './resource';
import { IPullSeriesPair, ISeries } from './interfaces';

const {
  ACTIONS,
} = consts;

export interface IFilters {
  [key: string]: string[];
}

@autoBindMethods
class Store {
  @observable public _filters: IFilters = {};
  public client: Client;

  public pullLists: Resource;
  public pulls: Resource;
  public series: Resource;
  public weeks: Resource;

  public constructor () {
    this.client = new Client();

    this.pulls = new Resource(this.client.user, 'pulls', { minutes: 20 });
    this.pullLists = new Resource(this.client.user, 'pull-lists', { weeks: 1 });

    this.series = new Resource(this.client.marvel, 'series', { weeks: 2 }, 'series_id');
    this.weeks = new Resource(this.client.marvel, 'weeks', { minutes: 20 }, 'week_of');

    this.pullLists.listIfCold();
  }

  public getOptions (optionType: string) {
    if (optionType === 'pullLists') {
      return this.pullLists.all
        .map(pullList => ({ value: pullList.id, name: pullList.title }));
    }

    throw new Error(`Missing optionType in Store.getOptions: ${optionType}`);
  }

  public get isLoading () {
    const resources = [this.pulls, this.pullLists, this.series, this.weeks];
    return resources.map(r => r.isLoading).some(x => x);
  }

  public setFilters (filters: IFilters) {
    this._filters = filters;
    store.set('filters', filters);
  }

  public get filters () {
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

  public pullsWithSeries () {
    return this.pulls.all.map(pull => ({
      key: pull.id,
      pull,
      pullList: this.pullLists.get(pull.pull_list_id),
      series: this.series.get(pull.series_id),
    }));
  }

  public pullWithSeries (id: string): IPullSeriesPair {
    const pull = this.pulls.get(id);
    return {
      key: pull.id,
      pull,
      pullList: this.pullLists.get(pull.pull_list_id),
      series: this.series.get(pull.series_id),
    };
  }

  public _firstUnreadWeek (series: ISeries) {
    const pull = this.pulls.getBy('series_id', series.series_id)
      , comics = series.comics
      , comicsUnread = comics.filter((comic: any) => !(pull.read.includes(comic.id) || pull.skipped.includes(comic.id)))
      , weeks = comicsUnread.map((comic: any) => comic.on_sale)
      , firstWeek = weeks.sort()[0]
      ;

    return firstWeek;
  }

  public firstUnreadWeek (series: ISeries[]) {
    const allStartWeeks = series.map(serie => this._firstUnreadWeek(serie))
      , lastStartWeek = allStartWeeks.filter(s => s).sort()[0];
    return lastStartWeek;
  }

  @action
  public async getAllSeries () {
    const pulls = await this.pulls.listIfCold();
    for (const pull of pulls as any[]) {
      await this.series.fetchIfCold(pull.series_id);
    }
  }

  @action
  public async mark (seriesId: string, issueId: string, actionKey: string) {
    const pull = this.pulls.getBy('series_id', seriesId)
      , noun = {
        [ACTIONS.READ]: 'read',
        [ACTIONS.SKIP]: 'skipped',
        [ACTIONS.UNREAD]: 'read',
        [ACTIONS.UNSKIP]: 'skipped',
      }[actionKey]
      , set = new Set<string>(pull[noun])
      , verb = {
        [ACTIONS.READ]: set.add,
        [ACTIONS.SKIP]: set.add,
        [ACTIONS.UNREAD]: set.delete,
        [ACTIONS.UNSKIP]: set.delete,
      }[actionKey]
      ;

    verb(issueId);

    const data = { [noun]: Array.from(set) };

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

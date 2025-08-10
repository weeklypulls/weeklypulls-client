import { action, observable } from "mobx";
import autoBindMethods from "class-autobind-decorator";
import store from "store";

import consts from "./consts";
import Client from "./client";
import Resource from "./resource";
import {
  IPull,
  IPullList,
  IPullSeriesPair,
  ISeries,
  IWeek,
  IUnreadIssue,
} from "./interfaces";
import { AxiosInstance } from "axios";

const { ACTIONS } = consts;

export interface IFilters {
  [key: string]: string[];
}

@autoBindMethods
class Store {
  @observable public _filters: IFilters = {};
  public client: Client;

  public pullLists: Resource<IPullList>;
  public pulls: Resource<IPull>;
  public series: Resource<ISeries>;
  public weeks: Resource<IWeek>;
  public unreadIssues: Resource<IUnreadIssue>;

  public constructor() {
    this.client = new Client();

    this.pulls = new Resource(this.client.user, "pulls", { minutes: 20 });
    this.pullLists = new Resource(this.client.user, "pull-lists", { weeks: 1 });
    this.unreadIssues = new Resource(
      this.client.user,
      "pulls/unread_issues",
      { minutes: 5 },
      "cv_id"
    );

    this.series = new Resource(
      this.client.user,
      "series",
      { weeks: 2 },
      "series_id"
    );
    this.weeks = new Resource(
      this.client.user,
      "weeks",
      { minutes: 20 },
      "week_of"
    );

    this.pullLists.listIfCold();
  }

  public get resources(): { [key: string]: Resource<unknown> } {
    return {
      pullLists: this.pullLists,
      pulls: this.pulls,
      series: this.series,
      unreadIssues: this.unreadIssues,
      weeks: this.weeks,
    };
  }

  public get isAuthenticated() {
    return this.client.hasToken;
  }

  public async getEndpoint(arg: string) {
    // /marvel:search/series/?search=
    const [client, url] = arg.slice(1).split(":"),
      axiosInstance = (
        this.client as unknown as { [key: string]: AxiosInstance }
      )[client];

    return await axiosInstance.get(url);
  }

  public async login(username: string, password: string) {
    Object.values(this.resources).forEach((resource) => {
      resource.clear();
    });
    await this.client.login(username, password);
  }

  public logout() {
    Object.values(this.resources).forEach((resource) => {
      resource.clear();
    });
    this.client.logout();
  }

  public getOptions(optionType: string) {
    if (optionType === "pullLists") {
      return this.pullLists.all.map((pullList) => ({
        value: pullList.id,
        name: pullList.title,
      }));
    }

    throw new Error(`Missing optionType in Store.getOptions: ${optionType}`);
  }

  public get isLoading() {
    return Object.values(this.resources)
      .map((r) => r.isLoading)
      .some((x) => x);
  }

  public setFilters(filters: IFilters) {
    this._filters = filters;
    store.set("filters", filters);
  }

  public get filters() {
    if (this._filters) {
      return this._filters;
    }

    const cache = store.get("filters");
    if (cache) {
      this._filters = cache;
      return this._filters;
    }

    this._filters = {};
    return this._filters;
  }

  public pullsWithSeries() {
    return this.pulls.all.map((pull) => ({
      key: pull.id,
      pull,
      pullList: this.pullLists.get(pull.pull_list_id),
      series: this.series.get(pull.series_id),
    }));
  }

  public pullWithSeries(id: string): IPullSeriesPair | undefined {
    const pull = this.pulls.get(id);
    if (!pull) {
      return;
    }
    const pullList = this.pullLists.get(pull.pull_list_id);
    if (!pullList) {
      return;
    }
    const series = this.series.get(pull.series_id);
    if (!series) {
      return;
    }

    return { key: pull.id, pull, pullList, series };
  }

  public _firstUnreadWeek(series: ISeries): string | null {
    const pull = this.pulls.getBy("series_id", series.series_id);
    if (!pull) {
      return null;
    }
    const comics = series.comics,
      comicsUnread = comics.filter((comic: any) => !pull.read.includes(comic.id)),
      weeks = comicsUnread.map((comic: any) => comic.on_sale),
      firstWeek = weeks.sort()[0];
    return firstWeek;
  }

  public firstUnreadWeek(series: ISeries[]) {
    const allStartWeeks = series.map((serie) => this._firstUnreadWeek(serie)),
      lastStartWeek = allStartWeeks.filter((s) => s).sort()[0];
    return lastStartWeek;
  }

  @action
  public async getAllSeries() {
    const pulls = await this.pulls.listIfCold();
    for (const pull of pulls as any[]) {
      await this.series.fetchIfCold(pull.series_id);
    }
  }

  @action
  public async mark(seriesId: string, issueId: string, actionKey: string) {
    // Robustly find the pull even if series_id is a number in API payloads
    const pull = (this.pulls.all as any[]).find(
      (p) => String(p.series_id) === String(seriesId)
    );
    if (!pull) {
      return null;
    }
    const noun = {
        [ACTIONS.READ]: "read",
        [ACTIONS.UNREAD]: "read",
      }[actionKey] as string,
      actionKeysPull = pull as unknown as { [key: string]: string[] },
      set = new Set<string>(actionKeysPull[noun] || []),
      verb = {
        [ACTIONS.READ]: set.add.bind(set),
        [ACTIONS.UNREAD]: set.delete.bind(set),
      }[actionKey];
    if (!set) {
      throw new Error(`Invalid set from noun: ${noun}`);
    }
    if (!verb) {
      throw new Error(`Invalid verb from action key: ${actionKey}`);
    }
    verb(issueId);

    const payload = { [noun]: Array.from(set) };
    await this.pulls.patch(pull.id, payload);

    // Update local cache
    (pull as any)[noun] = payload[noun];
    this.pulls.setObject(pull.id, pull);
    this.pulls.save();
    return pull;
  }
}

export default Store;

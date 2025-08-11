import { AxiosInstance } from "axios";

import Client from "./client";
import { ACTIONS } from "./consts";

class Store {
  public client: Client;
  public constructor() {
    this.client = new Client();
  }

  public get isAuthenticated() {
    return this.client.hasToken;
  }

  public async getEndpoint(arg: string) {
    // /marvel:search/series/?search=
    const [client, url] = arg.slice(1).split(":"),
      axiosInstance = (this.client as unknown as { [key: string]: AxiosInstance })[client];

    return await axiosInstance.get(url);
  }

  public async login(username: string, password: string) {
    await this.client.login(username, password);
  }

  public logout() {
    this.client.logout();
  }

  public async mark(seriesId: string, issueId: string, actionKey: string) {
    // Fetch pull by series id
    const pullsResp = await this.client.user.get("pulls/");
    const pulls: any[] = pullsResp.data || [];
    const pull = pulls.find((p) => String(p.series_id) === String(seriesId));
    if (!pull) return null;
    const noun = { [ACTIONS.READ]: "read", [ACTIONS.UNREAD]: "read" }[actionKey] as string;
    const set = new Set<string>(pull[noun] || []);
    const verb = { [ACTIONS.READ]: set.add.bind(set), [ACTIONS.UNREAD]: set.delete.bind(set) }[
      actionKey
    ];
    verb(issueId);
    const payload = { [noun]: Array.from(set) };
    const updated = await this.client.user.patch(`pulls/${pull.id}/`, payload);
    return updated.data;
  }
}

export default Store;

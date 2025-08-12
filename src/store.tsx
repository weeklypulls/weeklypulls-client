import createClient, { ApiClient } from "./client";
import { ACTIONS } from "./consts";
export interface StoreApi {
  client: ApiClient;
  readonly isAuthenticated: boolean;
  login(username: string, password: string): Promise<void>;
  logout(): void;
  mark(seriesId: string, issueId: string, actionKey: string): Promise<any>;
}

export function createStore(): StoreApi {
  const client = createClient();

  const broadcast = () => {
    // Custom event to signal auth state toggles within same tab
    window.dispatchEvent(new Event("auth-changed"));
  };

  async function login(username: string, password: string) {
    await client.login(username, password);
    broadcast();
  }

  function logout() {
    client.logout();
    broadcast();
  }

  async function mark(seriesId: string, issueId: string, actionKey: string) {
    const pullsResp = await client.user.get("pulls/");
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
    const updated = await client.user.patch(`pulls/${pull.id}/`, payload);
    return updated.data;
  }

  return {
    client,
    get isAuthenticated() {
      return client.hasToken;
    },
    login,
    logout,
    mark,
  };
}

export default createStore;

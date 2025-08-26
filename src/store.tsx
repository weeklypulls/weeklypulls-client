import createClient, { ApiClient } from "./client";
import { ACTIONS } from "./consts";
export interface StoreApi {
  client: ApiClient;
  readonly isAuthenticated: boolean;
  login(username: string, password: string): Promise<void>;
  register(data: {
    username: string;
    email: string;
    password1: string;
    password2: string;
  }): Promise<void>;
  logout(): void;
  mark(
    seriesId: string,
    issueId: string,
    actionKey: string
  ): Promise<{ id: string | number; series_id: string | number; read: string[] } | null>;
}

function createStore(): StoreApi {
  const client = createClient();

  const broadcast = () => {
    // Custom event to signal auth state toggles within same tab
    window.dispatchEvent(new Event("auth-changed"));
  };

  async function login(username: string, password: string) {
    await client.login(username, password);
    broadcast();
  }

  async function register(data: {
    username: string;
    email: string;
    password1: string;
    password2: string;
  }) {
    await client.register(data);
    // Auto-login after successful registration
    await client.login(data.username, data.password1);
    broadcast();
  }

  function logout() {
    client.logout();
    broadcast();
  }

  async function mark(seriesId: string, issueId: string, actionKey: string) {
    const pullsResp = await client.user.get("pulls/");
    const pulls: Array<{
      id: string | number;
      series_id: string | number;
      read: Array<string | number>;
    }> = pullsResp.data || [];
    const pull = pulls.find((p) => String(p.series_id) === String(seriesId));
    if (!pull) return null;
    const noun = { [ACTIONS.READ]: "read", [ACTIONS.UNREAD]: "read" }[actionKey] as string;
    const set = new Set<string>((pull as unknown as { [k: string]: string[] })[noun] || []);
    const verb = { [ACTIONS.READ]: set.add.bind(set), [ACTIONS.UNREAD]: set.delete.bind(set) }[
      actionKey
    ];
    verb(issueId);
    const payload = { [noun]: Array.from(set) } as { read: string[] };
    const updated = await client.user.patch(`pulls/${pull.id}/`, payload);
    return updated.data as { id: string | number; series_id: string | number; read: string[] };
  }

  return {
    client,
    get isAuthenticated() {
      return client.hasToken;
    },
    login,
    register,
    logout,
    mark,
  };
}

export default createStore;

import axios from "axios";

const URL_DATA = import.meta.env.VITE_API_URL ?? "https://api.weeklypulls.com/";
const TOKEN_KEY = "api-token";

// Values are JSON-encoded, matching what the old `store` package wrote, so
// tokens saved before the switch still load.
function readToken(): string | undefined {
  const raw = localStorage.getItem(TOKEN_KEY);
  if (raw === null) return undefined;
  try {
    const value: unknown = JSON.parse(raw);
    return typeof value === "string" ? value : undefined;
  } catch {
    return raw;
  }
}
const JSON_HEADERS = {
  Accept: "application/json; charset=utf-8;",
  "Content-Type": "application/json",
};

export interface ApiClient {
  user: ReturnType<typeof axios.create>;
  login(username: string, password: string): Promise<void>;
  register(data: {
    username: string;
    email: string;
    password1: string;
    password2: string;
  }): Promise<void>;
  logout(): void;
  readonly token: string | undefined;
  readonly hasToken: boolean;
}

function createClient(): ApiClient {
  const user = axios.create({
    baseURL: URL_DATA,
    headers: JSON_HEADERS,
  });

  const getToken = readToken;
  // initialize auth header if token exists
  const existing = getToken();
  if (existing) {
    user.defaults.headers.common["Authorization"] = existing;
  }

  async function login(username: string, password: string) {
    const response = await axios.post(`${URL_DATA}api-token-auth/`, { username, password });
    localStorage.setItem(TOKEN_KEY, JSON.stringify(`TOKEN ${response.data.token}`));
    const t = getToken();
    if (t) {
      user.defaults.headers.common["Authorization"] = t;
    }
  }

  async function register(data: {
    username: string;
    email: string;
    password1: string;
    password2: string;
  }) {
    // dj-rest-auth registration endpoint
    await axios.post(`${URL_DATA}auth/registration/`, data, { headers: JSON_HEADERS });
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    delete user.defaults.headers.common["Authorization"];
  }

  return {
    user,
    login,
    register,
    logout,
    get token() {
      return getToken();
    },
    get hasToken() {
      return !!getToken();
    },
  };
}

export default createClient;

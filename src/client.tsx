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

export interface RegisterData {
  username: string;
  email: string;
  password1: string;
  password2: string;
}

export interface AccountDetails {
  pk: number;
  username: string;
  email: string;
  date_joined: string;
}

export interface ApiClient {
  user: ReturnType<typeof axios.create>;
  login(username: string, password: string): Promise<void>;
  register(data: RegisterData): Promise<void>;
  logout(): Promise<void>;
  verifyEmail(key: string): Promise<void>;
  resendVerification(email: string): Promise<void>;
  requestPasswordReset(email: string): Promise<void>;
  confirmPasswordReset(data: {
    uid: string;
    token: string;
    new_password1: string;
    new_password2: string;
  }): Promise<void>;
  getAccount(): Promise<AccountDetails>;
  changePassword(data: {
    old_password: string;
    new_password1: string;
    new_password2: string;
  }): Promise<void>;
  exportAccount(): Promise<Blob>;
  deleteAccount(password: string): Promise<void>;
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

  // Endpoints that don't need a token.
  const anon = axios.create({ baseURL: URL_DATA, headers: JSON_HEADERS });

  async function login(username: string, password: string) {
    // dj-rest-auth's login refuses accounts whose email isn't verified.
    const response = await anon.post<{ key: string }>("auth/login/", { username, password });
    localStorage.setItem(TOKEN_KEY, JSON.stringify(`TOKEN ${response.data.key}`));
    const t = getToken();
    if (t) {
      user.defaults.headers.common["Authorization"] = t;
    }
  }

  // Sends a verification email; the account can't log in until it's used.
  async function register(data: RegisterData) {
    await anon.post("auth/registration/", data);
  }

  async function logout() {
    // Revoke the token on the server too, but log out locally regardless.
    if (getToken()) {
      try {
        await user.post("auth/logout/");
      } catch {
        // Already invalid, or offline.
      }
    }
    localStorage.removeItem(TOKEN_KEY);
    delete user.defaults.headers.common["Authorization"];
  }

  async function verifyEmail(key: string) {
    await anon.post("auth/registration/verify-email/", { key });
  }

  async function resendVerification(email: string) {
    await anon.post("auth/registration/resend-email/", { email });
  }

  async function requestPasswordReset(email: string) {
    await anon.post("auth/password/reset/", { email });
  }

  async function confirmPasswordReset(data: {
    uid: string;
    token: string;
    new_password1: string;
    new_password2: string;
  }) {
    await anon.post("auth/password/reset/confirm/", data);
  }

  async function getAccount() {
    return (await user.get<AccountDetails>("auth/user/")).data;
  }

  async function changePassword(data: {
    old_password: string;
    new_password1: string;
    new_password2: string;
  }) {
    await user.post("auth/password/change/", data);
  }

  async function exportAccount() {
    const response = await user.get("account/export/", { responseType: "blob" });
    return response.data as Blob;
  }

  // Deletes the account on the server, then forgets the (now invalid) token.
  async function deleteAccount(password: string) {
    await user.post("account/delete/", { password });
    localStorage.removeItem(TOKEN_KEY);
    delete user.defaults.headers.common["Authorization"];
  }

  return {
    user,
    login,
    register,
    logout,
    verifyEmail,
    resendVerification,
    requestPasswordReset,
    confirmPasswordReset,
    getAccount,
    changePassword,
    exportAccount,
    deleteAccount,
    get token() {
      return getToken();
    },
    get hasToken() {
      return !!getToken();
    },
  };
}

export default createClient;

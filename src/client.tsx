import axios from "axios";
import store from "store";

const URL_DATA = "https://weeklypulls-data.herokuapp.com/";
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

  const getToken = () => store.get("api-token");
  // initialize auth header if token exists
  const existing = getToken();
  if (existing) {
    user.defaults.headers.common["Authorization"] = existing;
  }

  async function login(username: string, password: string) {
    const response = await axios.post(`${URL_DATA}api-token-auth/`, { username, password });
    store.set("api-token", `TOKEN ${response.data.token}`);
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
    store.remove("api-token");
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

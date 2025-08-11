import axios, { AxiosInstance } from "axios";
import store from "store";

const URL_DATA = "https://weeklypulls-data.herokuapp.com/",
  URL_MARVEL = "https://weeklypulls-marvel.herokuapp.com/",
  JSON_HEADERS = {
    Accept: "application/json; charset=utf-8;",
    "Content-Type": "application/json",
  };
class Client {
  public user: AxiosInstance;
  public marvel: AxiosInstance;

  public constructor() {
    this.user = axios.create({
      baseURL: URL_DATA,
      headers: JSON_HEADERS,
    });
    this.user.defaults.headers.common["Authorization"] = this.token;

    this.marvel = axios.create({
      baseURL: URL_MARVEL,
      headers: JSON_HEADERS,
    });

    // Stub all Marvel API calls to fail
    this.marvel.interceptors.request.use(
      (config) => {
        const method = config.method ? config.method.toUpperCase() : "UNKNOWN";
        console.warn(`Marvel API call stubbed to fail: ${method} ${config.url}`);
        return Promise.reject(
          new Error("Marvel API temporarily unavailable - all calls stubbed to fail")
        );
      },
      (error) => Promise.reject(error)
    );
  }

  public async login(username: string, password: string) {
    const response = await axios.post(`${URL_DATA}api-token-auth/`, { username, password });
    store.set("api-token", `TOKEN ${response.data.token}`);
    axios.defaults.headers.common.Authorization = this.token;
  }

  public logout() {
    store.remove("api-token");
  }

  public get token() {
    return store.get("api-token");
  }

  public get hasToken() {
    return !!this.token;
  }
}

export default Client;

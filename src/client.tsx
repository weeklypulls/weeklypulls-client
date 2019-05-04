import axios from 'axios';
import store from 'store';

const URL_DATA = 'https://weeklypulls-data.herokuapp.com/'
  , URL_MARVEL = 'https://weeklypulls-marvel.herokuapp.com/'
  , JSON_HEADERS = {
    'Accept': 'application/json; charset=utf-8;',
    'Content-Type': 'application/json',
  }
  ;

class Client {
  public user: any;
  public marvel: any;

  constructor () {
    this.user = axios.create({
      baseURL: URL_DATA,
      headers: JSON_HEADERS,
    });
    this.user.defaults.headers.common['Authorization'] = this.token;

    this.marvel = axios.create({
      baseURL: URL_MARVEL,
      headers: JSON_HEADERS,
    });
  }

  async login (username, password) {
    const response = await axios.post(`${URL_DATA}api-token-auth/`, {username, password});
    store.set('api-token', `TOKEN ${response.data.token}`);
    axios.defaults.headers.common.Authorization = this.token;
  }

  logout () {
    store.remove('api-token');
  }

  get token () {
    return store.get('api-token');
  }

  get hasToken () {
    return !!this.token;
  }
}

export default Client;

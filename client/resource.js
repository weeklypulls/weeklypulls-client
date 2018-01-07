import { observable, action } from 'mobx';
import autoBindMethods from 'class-autobind-decorator';
import store from 'store';
import _ from 'lodash';
import { DateTime } from 'luxon';

@autoBindMethods
class Resource {
  client;
  endpoint;
  options;
  idKey;

  @observable objects = new Map();
  @observable isLoading = true;

  @observable fetchedOn = new Map();

  constructor (client, endpoint, maxCache, idKey = 'id') {
    this.client = client;
    this.endpoint = endpoint;
    this.maxCache = maxCache;
    this.idKey = idKey;

    this.load();
  }

  get cacheKey () {
    return `pull-list-resource-${this.endpoint}`;
  }

  cacheTooCold (key) {
    const fetchedOn = this.fetchedOn.get(key);

    if (!fetchedOn) { return true; }

    // console.log('fetchedOn', fetchedOn, this.maxCache);
    if (DateTime.fromISO(fetchedOn).plus(this.maxCache) < DateTime.utc()) {
      return true;
    }

    return false;
  }

  save () {
    store.set(this.cacheKey, {
      objects: this.objects.entries(),
      fetchedOn: this.fetchedOn.entries(),
    });
  }

  load () {
    const cache = store.get(this.cacheKey)
      , objects = _.get(cache, 'objects', [])
      , fetchedOn = _.get(cache, 'fetchedOn', []);

    for (const [key, value] of objects) {
      this.objects.set(key, value);
    }

    for (const [key, value] of fetchedOn) {
      this.fetchedOn.set(key, value);
    }

    this.isLoading = false;
  }

  get all () {
    return this.objects.values();
  }

  @action
  async listIfCold (id) {
    if (this.cacheTooCold('list')) {
      // eslint-disable-next-line no-console
      console.log(`Triggered cache-based refresh of ${this.endpoint} list`);
      return (await this.list());
    }
    return this.all;
  }

  @action
  async list () {
    this.isLoading = true;
    const response = await this.client.get(`${this.endpoint}/`)
      , objects = response.data;

    this.fetchedOn.set('list', DateTime.utc().toISO());
    for (const obj of objects) {
      const objKey = obj[this.idKey];
      this.objects.set(objKey, obj);
      this.fetchedOn.set(objKey, DateTime.utc().toISO());
    }

    this.isLoading = false;
    return this.objects.values();
  }

  getBy (key, value) {
    return this.all.find(obj => obj[key] === value);
  }

  get (id) {
    return this.objects.get(id);
  }

  @action
  async fetchIfCold (id) {
    if (this.cacheTooCold(id)) {
      // eslint-disable-next-line no-console
      console.log(`Triggered cache-based refresh of ${this.endpoint} ${id}`);
      return (await this.fetch(id));
    }
    return this.get(id);
  }

  @action
  async fetch (id) {
    try {
      this.isLoading = true;
      const response = await this.client.get(`${this.endpoint}/${id}/`);
      this.objects.set(id, response.data);
      this.fetchedOn.set(id, DateTime.utc().toISO());
      this.save();
    }
    catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
    finally {
      this.isLoading = false;
    }

    return this.objects.get(id);
  }

  @action
  async patch (id, data) {
    this.isLoading = true;
    const response = await this.client.patch(`${this.endpoint}/${id}/`, data);
    this.objects.set(id, response.data);
    this.save();

    this.isLoading = false;
    return response.data;
  }

  @action
  async post (data) {
    this.isLoading = true;
    const response = await this.client.post(`${this.endpoint}/`, data)
      , id = response.data[this.idKey];

    this.objects.set(id, response.data);
    this.save();

    this.isLoading = false;
    return response.data;
  }
}

export default Resource;

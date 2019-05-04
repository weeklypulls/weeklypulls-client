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
  private maxCache: any;

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

  setObject (id, value) {
    this.objects.set(id, value);
    this.fetchedOn.set(id, DateTime.utc().toISO());
  }

  cacheTooCold (key) {
    const fetchedOn = this.fetchedOn.get(key);

    if (!fetchedOn) { return true; }

    if (DateTime.fromISO(fetchedOn).plus(this.maxCache) < DateTime.utc()) {
      return true;
    }

    return false;
  }

  save () {
    store.set(this.cacheKey, {
      objects: Array.from(this.objects.entries()),
      fetchedOn: Array.from(this.fetchedOn.entries()),
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

  get all (): any[] {
    return Array.from(this.objects.values());
  }

  @action
  async listIfCold () {
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
      this.setObject(obj[this.idKey], obj);
    }

    this.save();
    this.isLoading = false;
    return this.all;
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
      this.setObject(id, response.data);
    }
    catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
    finally {
      this.save();
      this.isLoading = false;
    }

    return this.objects.get(id);
  }

  @action
  async patch (id, data) {
    this.isLoading = true;
    const response = await this.client.patch(`${this.endpoint}/${id}/`, data);
    this.setObject(id, response.data);

    this.save();
    this.isLoading = false;
    return response.data;
  }

  @action
  async post (data) {
    this.isLoading = true;
    const response = await this.client.post(`${this.endpoint}/`, data)
      , id = response.data[this.idKey];

    this.setObject(id, response.data);

    this.save();
    this.isLoading = false;
    return response.data;
  }
}

export default Resource;

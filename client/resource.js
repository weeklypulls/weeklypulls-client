import { observable, action } from 'mobx';
import autoBindMethods from 'class-autobind-decorator';
import store from 'store';

@autoBindMethods
class Resource {
  client;
  endpoint;
  options;
  idKey;

  @observable objects = new Map();
  @observable isLoading = true;

  constructor (client, endpoint, idKey = 'id') {
    this.client = client;
    this.endpoint = endpoint;
    this.idKey = idKey;

    this.load();
  }

  get cacheKey () {
    return `pull-list-resource-${this.endpoint}`;
  }

  save () {
    store.set(this.cacheKey, this.all);
  }

  load () {
    const objects = store.get(this.cacheKey, []);
    for (const obj of objects) {
      this.objects.set(obj[this.idKey], obj);
    }
    this.isLoading = false;
  }

  get all () {
    return this.objects.values();
  }

  @action
  async list () {
    if (this.objects.size > 0) {
      return this.objects.values();
    }

    this.isLoading = true;
    const response = await this.client.get(`${this.endpoint}/`)
      , objects = response.data;

    for (const obj of objects) {
      this.objects.set(obj[this.idKey], obj);
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
  async fetch (id) {
    if (this.objects.has(id)) {
      const obj = this.objects.get(id);
      if (!obj.prefetch) {
        return obj;
      }
    }

    try {
      this.isLoading = true;
      const response = await this.client.get(`${this.endpoint}/${id}/`);
      this.objects.set(id, response.data);
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
      , id = response.data.id;

    this.objects.set(id, response.data);
    this.save();

    this.isLoading = false;
    return response.data;
  }
}

export default Resource;

import { observable, action } from 'mobx';
import autoBindMethods from 'class-autobind-decorator';
import store from 'store';
import _ from 'lodash';
import { DateTime, DurationObject } from 'luxon';
import { AxiosInstance } from 'axios';

@autoBindMethods
class Resource<T> {
  public client: AxiosInstance;
  public endpoint: string;
  public idKey: string;

  @observable public objects = new Map();
  @observable public isLoading = true;

  @observable public fetchedOn = new Map();
  private maxCache: DurationObject;

  public constructor (client: AxiosInstance, endpoint: string, maxCache: DurationObject, idKey = 'id') {
    this.client = client;
    this.endpoint = endpoint;
    this.maxCache = maxCache;
    this.idKey = idKey;

    this.load();
  }

  public get cacheKey () {
    return `pull-list-resource-${this.endpoint}`;
  }

  public setObject (id: string, value: object) {
    this.objects.set(id, value);
    this.fetchedOn.set(id, DateTime.utc().toISO());
  }

  public deleteObject (id: string) {
    this.objects.delete(id);
    this.fetchedOn.delete(id);
  }

  public cacheTooCold (key: string) {
    const fetchedOn = this.fetchedOn.get(key);

    if (!fetchedOn) { return true; }

    if (DateTime.fromISO(fetchedOn).plus(this.maxCache) < DateTime.utc()) {
      return true;
    }

    return false;
  }

  public clear () {
    this.fetchedOn.clear();
    this.objects.clear();
    store.remove(this.cacheKey);
  }

  public save () {
    store.set(this.cacheKey, {
      fetchedOn: Array.from(this.fetchedOn.entries()),
      objects: Array.from(this.objects.entries()),
    });
  }

  public load () {
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

  public get all (): any[] {
    return Array.from(this.objects.values());
  }

  @action
  public async listIfCold () {
    if (this.cacheTooCold('list')) {
      // tslint:disable-next-line no-console
      console.log(`Triggered cache-based refresh of ${this.endpoint} list`);
      return (await this.list());
    }
    return this.all;
  }

  @action
  public async list (): Promise<T[]> {
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

  public getBy (key: string, value: any): T | undefined {
    return this.all.find(obj => obj[key] === value);
  }

  public get (id: string): T | undefined {
    return this.objects.get(id);
  }

  @action
  public async fetchIfCold (id: string): Promise<T> {
    if (this.cacheTooCold(id)) {
      // tslint:disable-next-line no-console
      console.log(`Triggered cache-based refresh of ${this.endpoint} ${id}`);
      return (await this.fetch(id));
    }
    return this.get(id) as T;
  }

  @action
  public async fetch (id: string): Promise<T> {
    try {
      this.isLoading = true;
      const response = await this.client.get(`${this.endpoint}/${id}/`);
      this.setObject(id, response.data);
    }
    catch (e) {
      // tslint:disable-next-line no-console
      console.error(e);
    }
    finally {
      this.save();
      this.isLoading = false;
    }

    return this.objects.get(id);
  }

  @action
  public async patch (id: string, data: object) {
    this.isLoading = true;
    const response = await this.client.patch(`${this.endpoint}/${id}/`, data);
    this.setObject(id, response.data);

    this.save();
    this.isLoading = false;
    return response.data;
  }

  @action
  public async post (data: object) {
    this.isLoading = true;
    const response = await this.client.post(`${this.endpoint}/`, data)
      , id = response.data[this.idKey];

    this.setObject(id, response.data);

    this.save();
    this.isLoading = false;
    return response.data;
  }

  @action
  public async delete (id: string) {
    this.isLoading = true;
    await this.client.delete(`${this.endpoint}/${id}/`);

    this.deleteObject(id);

    this.save();
    this.isLoading = false;
  }
}

export default Resource;

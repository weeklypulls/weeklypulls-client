import { AxiosInstance } from "axios";
import { makeObservable, observable } from "mobx";
import store from "store";

class Resource<T extends { [key: string]: any } = any> {
  public objects = new Map<string, T>();
  public isLoading = true;
  public client: AxiosInstance;
  public endpoint: string;
  public fetchedOn = new Map<string, number>();
  private maxCacheMs: number;
  private idKey: keyof T;

  public constructor(
    client: AxiosInstance,
    endpoint: string,
    cache: { minutes?: number; weeks?: number } = { minutes: 60 },
    idKey: keyof T = "id" as keyof T
  ) {
    makeObservable(this, {
      objects: observable,
      isLoading: observable,
      fetchedOn: observable,
    });
    this.client = client;
    this.endpoint = endpoint;
    this.idKey = idKey;

    this.maxCacheMs = ((cache.minutes || 0) * 60 + (cache.weeks || 0) * 7 * 24 * 60) * 1000;

    this.load();
  }

  public get cacheKey() {
    return `pull-list-resource-${this.endpoint}`;
  }

  public setObject(id: string, value: T) {
    this.objects.set(id, value);
    this.fetchedOn.set(id, Date.now());
  }

  public deleteObject(id: string) {
    this.objects.delete(id);
    this.fetchedOn.delete(id);
  }

  public cacheTooCold(key: string) {
    const fetchedOn = this.fetchedOn.get(key);

    if (!fetchedOn) {
      return true;
    }

    if (fetchedOn + this.maxCacheMs < Date.now()) {
      return true;
    }

    return false;
  }

  public clear() {
    this.fetchedOn.clear();
    this.objects.clear();
    store.remove(this.cacheKey);
  }

  public save() {
    store.set(this.cacheKey, {
      fetchedOn: Array.from(this.fetchedOn.entries()),
      objects: Array.from(this.objects.entries()),
    });
  }

  public load() {
    const cache = store.get(this.cacheKey),
      objects = (cache?.objects ?? []) as Array<[string, T]>,
      fetchedOn = (cache?.fetchedOn ?? []) as Array<[string, number | string]>;

    for (const [key, value] of objects) {
      this.objects.set(key, value as T);
    }

    for (const [key, value] of fetchedOn) {
      const raw = value as any;
      const ts = typeof raw === "number" ? raw : Date.parse(raw);
      if (Number.isFinite(ts)) {
        this.fetchedOn.set(key, ts);
      }
    }

    this.isLoading = false;
  }

  public get all(): T[] {
    return Array.from(this.objects.values());
  }

  public async listIfCold() {
    if (this.cacheTooCold("list")) {
      // tslint:disable-next-line no-console
      console.log(`Triggered cache-based refresh of ${this.endpoint} list`);
      return await this.list();
    }
    return this.all;
  }

  public async list(): Promise<T[]> {
    this.isLoading = true;
    const response = await this.client.get(`${this.endpoint}/`),
      objects = response.data as T[];

    this.fetchedOn.set("list", Date.now());
    for (const obj of objects) {
      this.setObject((obj as any)[this.idKey], obj);
    }

    this.save();
    this.isLoading = false;
    return this.all;
  }

  public getBy(key: string, value: any): T | undefined {
    return this.all.find((obj: any) => obj[key] === value);
  }

  public get(id: string): T | undefined {
    return this.objects.get(id);
  }

  public async fetchIfCold(id: string): Promise<T> {
    if (this.cacheTooCold(id)) {
      // tslint:disable-next-line no-console
      console.log(`Triggered cache-based refresh of ${this.endpoint} ${id}`);
      return await this.fetch(id);
    }
    return this.get(id) as T;
  }

  public async fetch(id: string): Promise<T> {
    try {
      this.isLoading = true;
      const response = await this.client.get(`${this.endpoint}/${id}/`);
      this.setObject(id, response.data as T);
    } catch (e) {
      // tslint:disable-next-line no-console
      console.error(e);
    } finally {
      this.save();
      this.isLoading = false;
    }

    return this.objects.get(id) as T;
  }

  public async patch(id: string, data: Record<string, unknown>) {
    this.isLoading = true;
    const response = await this.client.patch(`${this.endpoint}/${id}/`, data);
    this.setObject(id, response.data as T);

    this.save();
    this.isLoading = false;
    return response.data as T;
  }

  public async post(data: Record<string, unknown>) {
    this.isLoading = true;
    const response = await this.client.post(`${this.endpoint}/`, data),
      id = response.data[this.idKey];

    this.setObject(id, response.data as T);

    this.save();
    this.isLoading = false;
    return response.data as T;
  }

  public async delete(id: string) {
    this.isLoading = true;
    await this.client.delete(`${this.endpoint}/${id}/`);

    this.deleteObject(id);

    this.save();
    this.isLoading = false;
  }
}

export default Resource;

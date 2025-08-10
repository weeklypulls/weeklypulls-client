export interface IComic {
  id: string;
  images: string[];
  on_sale: string;
  series_id: string;
}

export interface ISeries {
  comics: IComic[];
  series_id: string;
  title: string;
}

export interface IPull {
  id: string;
  pull_list_id: string;
  read: string[];
  series_id: string;
  skipped: string[];
}

export interface IWeek {
  comics: IComic[];
}

export interface IPullList {
  id: string;
  title: string;
}

interface IPair {
  key: string;
}

export interface IComicPullPair extends IPair {
  comic: IComic;
  pull: IPull | undefined;
  read: boolean;
  skipped: boolean;
}

export interface IComicPullSeriesPair extends IComicPullPair {
  series: ISeries;
}

export interface IPullSeriesPair extends IPair {
  key: string;
  pull: IPull;
  pullList: IPullList;
  series: ISeries;
}

export interface IUnreadIssue {
  cv_id: number;
  name: string;
  number: string;
  store_date: string;
  cover_date: string;
  volume_id: number;
  volume_name: string;
  volume_start_year: number;
  description: string;
  image_medium_url: string;
  site_url: string;
  // server-provided best image url (annotation)
  image_url?: string;
  // id of the corresponding Pull (if available from API)
  pull_id?: number;
}

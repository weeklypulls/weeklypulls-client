export interface IComic {
  id: string;
  images: string[];
  on_sale: string;
  // Canonical local date when available (YYYY-MM-DD). Some endpoints still use on_sale.
  date?: string;
  series_id: string;
  title: string;
  cover_date?: string;
  site_url?: string;
  description?: string;
  // Optional fields provided by Weeks API when available
  pulled?: boolean;
  pull_id?: string | null;
  read?: boolean;
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
  series_title?: string;
  series_start_year?: number;
}

export interface IWeek {
  week_of: string;
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
}

export interface IComicPullSeriesPair extends IComicPullPair {
  series?: ISeries;
}

export interface IPullSeriesPair extends IPair {
  key: string;
  pull: IPull;
  pullList?: IPullList;
}

export interface IUnreadIssue {
  cv_id: number;
  name: string;
  number: string;
  // Canonical date when provided by API
  date?: string;
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

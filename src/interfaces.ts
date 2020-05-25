
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

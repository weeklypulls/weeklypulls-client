
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

export interface IPullList {
  id: string;
}

interface IPair {
  key: string;
}

export interface IComicPullPair extends IPair {
  comic: IComic;
  pull: IPull;
  read: boolean;
  skipped: boolean;
}

export interface IComicPullSeriesPair extends IComicPullPair {
  series: ISeries;
}

export interface IPullSeriesPair extends IPair {
  pull: IPull;
  pullList: IPullList;
  series: ISeries;
}

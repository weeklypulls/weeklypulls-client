export interface IComic {
  id: string;
  images: string[];
  // Canonical date (YYYY-MM-DD) for display and sorting
  date: string;
  series_id: string;
  title: string;
  site_url?: string;
  description?: string;
  // Optional fields provided by Weeks API when available
  pulled?: boolean;
  pull_id?: string | null;
  read?: boolean;
}

export interface IPull {
  id: string;
  pull_list_id: string;
  read: string[];
  series_id: string;
  series_title?: string;
  series_start_year?: number;
}

interface IPair {
  key: string;
}

// Legacy pair kept for now for compatibility in a few code paths (will be removed)
export interface IComicPullPair extends IPair {
  comic: IComic;
  pull: IPull | undefined;
  read: boolean;
}

/**
 * Unified domain model: Issue + Volume + optional Pull context
 * Mirrors backend models to reduce client-side joining.
 */
export interface IVolume {
  id: string; // ComicVineVolume.cv_id as string
  name?: string;
  start_year?: number | null;
  // Optional nested publisher if/when backend includes it
  publisher?: {
    id: string;
    name: string;
  } | null;
}

export interface IPullContext {
  id: string; // Pull.id
  pulled: boolean; // true if user has this series in any pull list
  read: boolean; // true if this issue id is in pull.read
  pull_list_id?: string; // optional for context screens
}

export interface IIssue {
  id: string; // ComicVineIssue.cv_id as string
  number?: string;
  name?: string; // issue title/subtitle
  title: string; // recommended display title (e.g., `${volume.name} #${number}`)
  date: string; // canonical YYYY-MM-DD
  images: string[]; // ordered by preference (first is best)
  site_url?: string;
  description?: string;
  volume: IVolume; // associated volume (series)
  pull?: IPullContext | null; // user context when available
}

export interface IUnreadIssue {
  cv_id: number;
  name: string;
  number: string;
  // Canonical date when provided by API
  date?: string;
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

// Temporary legacy compatibility: used by PullsDetail. Remove after migrating to IIssue.
export interface IComicPullSeriesPair extends IComicPullPair {
  // Minimal series shape used for title rendering
  series?: { title?: string };
}

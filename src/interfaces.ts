export interface IPull {
  id: string;
  pull_list_id: string;
  read: string[];
  series_id: string;
  series_title?: string;
  series_start_year?: number;
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

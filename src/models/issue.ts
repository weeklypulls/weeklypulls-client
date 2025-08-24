import { IIssue, IVolume, IPullContext, IUnreadIssue, IComic } from "../interfaces";

// Build IIssue from the Unread Issues endpoint row
export function issueFromUnreadRow(row: IUnreadIssue): IIssue {
  const images: string[] = [];
  if (row.image_url) images.push(row.image_url);
  else if (row.image_medium_url) images.push(row.image_medium_url);

  const volume: IVolume = {
    id: String(row.volume_id),
    name: row.volume_name,
    start_year: row.volume_start_year,
  };

  const pull: IPullContext | null = row.pull_id
    ? { id: String(row.pull_id), pulled: true, read: false }
    : null;

  const number = row.number;
  const title = `${row.volume_name} #${number}`.trim();

  return {
    id: String(row.cv_id),
    number,
    name: row.name,
    title,
    date: row.date || "",
    images,
    site_url: row.site_url,
    description: row.description,
    volume,
    pull,
  };
}

// Build IIssue from Weeks/Series comic item (IComic type)
export function issueFromWeekComic(comic: IComic): IIssue {
  const volume: IVolume = {
    id: comic.series_id,
  };
  const pull: IPullContext | null = comic.pull_id
    ? {
        id: String(comic.pull_id),
        pulled: !!comic.pulled,
        read: !!comic.read,
      }
    : comic.pulled || typeof comic.read === "boolean"
      ? { id: "", pulled: !!comic.pulled, read: !!comic.read }
      : null;

  return {
    id: comic.id,
    title: comic.title,
    date: comic.date,
    images: comic.images || [],
    site_url: comic.site_url,
    description: comic.description,
    volume,
    pull,
  } as IIssue;
}

// Minimal shape adapter for ReadButton
export function comicLikeForReadButton(issue: IIssue) {
  return {
    id: issue.id,
    date: issue.date,
    series_id: issue.volume.id,
    images: issue.images || [],
    pull_id: issue.pull?.id || null,
  } as any;
}

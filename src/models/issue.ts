import { IIssue, ComicLike } from "../interfaces";

// Minimal shape adapter for ReadButton
export function comicLikeForReadButton(issue: IIssue): ComicLike {
  return {
    id: issue.id,
    date: issue.date,
    series_id: issue.volume.id,
    images: issue.images || [],
    pull_id: issue.pull?.id || null,
  };
}

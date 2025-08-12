import { Link } from "react-router-dom";

import Images from "./Images";

// Renders a cover cell given one or more URLs. Returns null if empty.
export function renderCoverFromUrls(
  getUrls: (record: any) => string[] | string | undefined | null
) {
  return function CoverCell(_text: unknown, record: any) {
    const urls = getUrls(record);
    const arr = Array.isArray(urls) ? urls : urls ? [urls] : [];
    if (!arr.length) return null;
    return <Images images={arr} />;
  };
}

// Renders a two-line title block with optional external link.
// primary: bold line; secondary: small text below; href optional.
export function renderTitleBlock(
  get: (record: any) => { primary: string; secondary?: string; href?: string; title?: string }
) {
  return function TitleBlock(_text: unknown, record: any) {
    const { primary, secondary, href, title } = get(record);
    const content = (
      <span title={title}>
        <strong>{primary}</strong>
        {secondary ? (
          <>
            <br />
            <small>{secondary}</small>
          </>
        ) : null}
      </span>
    );
    if (!href) return content;
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" title={title}>
        {content}
      </a>
    );
  };
}

// Link to a week detail page if an ISO-like date string is provided; otherwise "--".
export function renderWeekLinkFromISO(getDate: (record: any) => string | undefined | null) {
  return function WeekLink(_text: unknown, record: any) {
    const iso = (getDate(record) || "").slice(0, 10);
    if (!iso) return "--";
    return <Link to={`/weeks/${iso}`}>{iso}</Link>;
  };
}

// Pull link renderer: shows "Title (Year)" linking to the pull when available.
export function renderPullLink(
  get: (record: any) => {
    pull_id?: string | number | null;
    title?: string;
    year?: string | number | null;
  }
) {
  return function PullLink(_text: unknown, record: any) {
    const { pull_id, title, year } = get(record);
    if (!pull_id) return "--";
    const yr = year ? ` (${year})` : "";
    return <Link to={`/pulls/${String(pull_id)}`}>{`${title || "Series"}${yr}`}</Link>;
  };
}

// Plain date or fallback
export function renderPlainDate(getDate: (record: any) => string | undefined | null) {
  return function PlainDate(_text: unknown, record: any) {
    return getDate(record) || "--";
  };
}

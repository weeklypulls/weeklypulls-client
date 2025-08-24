import { Popover, Tooltip } from "antd";
import { Link } from "react-router-dom";

import Images from "./Images";
import type { IIssue } from "../../interfaces";

// Minimal HTML sanitizer to reduce XSS risk. For robust sanitization, prefer DOMPurify.
function sanitizeHtml(html: string): string {
  if (!html) return html;
  // Remove script/style tags and their content
  let out = html.replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script>/gi, "");
  out = out.replace(/<\s*style[^>]*>[\s\S]*?<\s*\/\s*style>/gi, "");
  // Drop on* event handler attributes
  out = out.replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, "");
  out = out.replace(/\son[a-z]+\s*=\s*'[^']*'/gi, "");
  out = out.replace(/\son[a-z]+\s*=\s*[^\s>]+/gi, "");
  // Neutralize javascript: URLs
  out = out.replace(/(href|src)\s*=\s*"javascript:[^"]*"/gi, '$1="#"');
  out = out.replace(/(href|src)\s*=\s*'javascript:[^']*'/gi, "$1='#'");
  return out;
}

const COMICVINE_BASE = "https://comicvine.gamespot.com";

function rewriteComicVineLinks(html: string, base = COMICVINE_BASE): string {
  if (typeof document === "undefined" || !html) return html;
  const container = document.createElement("div");
  container.innerHTML = html;
  container.querySelectorAll("a[href]").forEach((a) => {
    const raw = a.getAttribute("href") || "";
    const href = raw.trim();
    if (!href) return;
    const hasProtocol = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(href);
    if (href.startsWith("//")) {
      a.setAttribute("href", "https:" + href);
    } else if (!hasProtocol && !href.startsWith("#")) {
      const normalized = href.startsWith("/") ? base + href : base + "/" + href;
      a.setAttribute("href", normalized);
    }
    a.setAttribute("target", "_blank");
    a.setAttribute("rel", "noopener noreferrer");
  });
  return container.innerHTML;
}

// Renders a cover cell given one or more URLs. Returns null if empty.
export function renderCoverFromUrls<T>(
  getUrls: (record: T) => string[] | string | undefined | null
) {
  return function CoverCell(_text: unknown, record: T) {
    const urls = getUrls(record);
    const arr = Array.isArray(urls) ? urls : urls ? [urls] : [];
    if (!arr.length) return null;
    return <Images images={arr} />;
  };
}

// Renders a two-line title block with optional external link directly from an IIssue.
// primary: bold line (issue.title); secondary: issue.name; href: issue.site_url; tooltip: issue.description
export function renderTitleBlock(_text: unknown, issue: IIssue) {
  const content = (
    <>
      <strong>{issue.title}</strong>
      {issue.name ? (
        <>
          <br />
          <small>{issue.name}</small>
        </>
      ) : null}
    </>
  );

  // Wrap with anchor if external link exists
  const linked = issue.site_url ? (
    <a href={issue.site_url} target="_blank" rel="noopener noreferrer">
      {content}
    </a>
  ) : (
    content
  );

  // Wrap with Popover when description HTML is available
  if (issue.description) {
    const html = rewriteComicVineLinks(sanitizeHtml(issue.description));
    return <Tooltip title={<div dangerouslySetInnerHTML={{ __html: html }} />}>{linked}</Tooltip>;
  }

  return linked;
}

// Link to a week detail page if an ISO-like date string is provided; otherwise "--".
export function renderWeekLinkFromISO<T>(getDate: (record: T) => string | undefined | null) {
  return function WeekLink(_text: unknown, record: T) {
    const iso = (getDate(record) || "").slice(0, 10);
    if (!iso) return "--";
    return <Link to={`/weeks/${iso}`}>{iso}</Link>;
  };
}

// Pull link renderer: shows "Title (Year)" linking to the pull when available.
export function renderPullLink<T>(
  get: (record: T) => {
    pull_id?: string | number | null;
    title?: string;
    year?: string | number | null;
  }
) {
  return function PullLink(_text: unknown, record: T) {
    const { pull_id, title, year } = get(record);
    if (!pull_id) return "--";
    const yr = year ? ` (${year})` : "";
    return <Link to={`/pulls/${String(pull_id)}`}>{`${title || "Series"}${yr}`}</Link>;
  };
}

This folder previously contained the legacy Comics page powered by the Marvel API.

As of 2025-08-10, the project has migrated to the ComicVine-backed endpoints under the data API. The legacy Comics landing page and navigation were removed.

Remaining components still used:
- ComicsList.tsx and ComicsListColumns.tsx are still referenced by Pulls detail view for rendering a table of comics for a series.

If you plan to fully remove ComicsList usage, update PullsDetail.tsx to provide its own columns and drop the import from '../series/ComicsListColumns'.

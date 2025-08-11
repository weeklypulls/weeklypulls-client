import { Table, Button, Input } from "antd";
import type { TableProps } from "antd";
import type { ColumnsType, ColumnType } from "antd/es/table";
import { useCallback, useMemo, useState } from "react";

import COLUMNS from "./ComicsListColumns";
import { IComic, IComicPullPair } from "../../../interfaces";
import { usePullLists, usePulls, useSeriesForPulls } from "../../../queries";
import utils from "../../../utils";

const { future, stringSort } = utils;

const isRead = (comicPair: IComicPullPair) => comicPair.read;

function ComicsList() {
  const pullsQuery = usePulls();
  const pullListsQuery = usePullLists();
  const seriesQuery = useSeriesForPulls(!pullsQuery.isLoading);
  const [searchText, setSearchText] = useState("");
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [filters, setFilters] = useState<Record<string, string[]>>({});

  // Navigation on auth failure would be handled by axios interceptor (future improvement)

  const handleChange: NonNullable<TableProps<IComicPullPair>["onChange"]> = (
    _pagination,
    filters
  ) => {
    const normalizedFilters: Record<string, string[]> = {};
    const isString = (value: unknown): value is string => typeof value === "string";

    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        normalizedFilters[key] = value.filter(isString);
      } else if (isString(value)) {
        normalizedFilters[key] = [value];
      } else {
        normalizedFilters[key] = [];
      }
    });
    setFilters(normalizedFilters);
  };

  const onInputChange = useCallback((event: any) => {
    setSearchText(event.target.value);
  }, []);

  const onSearch = useCallback(() => {
    setFilters((prev) => ({ ...prev, "comic.title": [searchText] }));
    setFilterDropdownOpen(false);
  }, [searchText]);

  const onClear = useCallback(() => {
    setSearchText("");
    setFilters((prev) => ({ ...prev, "comic.title": [] }));
    setFilterDropdownOpen(false);
  }, []);

  const columns: ColumnsType<IComicPullPair> = useMemo(() => {
    const currentFilters = filters as any;
    return COLUMNS.map((column) => {
      const col: ColumnType<IComicPullPair> = { ...column };
      const key = String(column.key ?? "");
      col.filteredValue = currentFilters?.[key] ?? [];

      if (column.key === "pull.pull_list_id") {
        col.filters = (pullListsQuery.data || []).map((pullList: any) => ({
          text: pullList.title,
          value: pullList.id,
        }));
      }

      if (column.key === "comic.title") {
        col.onFilterDropdownOpenChange = (open: boolean) => setFilterDropdownOpen(open);
        col.filterDropdownOpen = filterDropdownOpen;
        col.filterDropdown = (
          <div className="custom-filter-dropdown">
            <Input
              onChange={onInputChange}
              onPressEnter={onSearch}
              placeholder="Search name"
              value={searchText}
            />
            <Button type="primary" onClick={onSearch}>
              Search
            </Button>
            <Button onClick={onClear}>Clear</Button>
          </div>
        );
      }

      return col;
    });
  }, [
    filters,
    pullListsQuery.data,
    filterDropdownOpen,
    onInputChange,
    onSearch,
    onClear,
    searchText,
  ]);

  const filterByRegex = useCallback(
    (key: string, record: IComicPullPair) => {
      const active = ((filters as any)?.[key] ?? []) as string[];
      const value = (record as any)?.[key]?.toString?.() ?? "";
      if (!active.length) return true;
      const filter = active[0];
      const reg = new RegExp(filter, "gi");
      return !!value.match(reg);
    },
    [filters]
  );

  const filterBy = useCallback(
    (key: string, record: IComicPullPair) => {
      const active = ((filters as any)?.[key] ?? []) as string[];
      const value = (record as any)?.[key]?.toString?.() ?? "";
      if (!active.length) return true;
      return active.includes(value);
    },
    [filters]
  );

  const dataSource: IComicPullPair[] = useMemo(() => {
    const pulls = pullsQuery.data || [];

    let earliestUnread = "";
    let seriesComics = pulls.map((pull) => {
      const series = seriesQuery.data?.[pull.series_id];
      if (!series) return [];
      const comics: IComic[] = (series?.comics ?? []) as IComic[];
      const pullComicPairs = comics
        .map((comic: IComic) => ({
          comic,
          key: comic.id,
          pull,
          read: pull.read.includes(comic.id),
        }))
        .filter((comicPair: IComicPullPair) => !future(comicPair.comic.on_sale));

      if (!pullComicPairs.length || pullComicPairs.every(isRead)) {
        return [];
      }

      const unreadDate = pullComicPairs
        .filter((cp: IComicPullPair) => !cp.read)
        .map((cp: IComicPullPair) => cp.comic.on_sale)
        .sort(stringSort)[0];

      if (!earliestUnread || earliestUnread > unreadDate) {
        earliestUnread = unreadDate;
      }
      return pullComicPairs;
    });

    // Filter out series with all read
    seriesComics = seriesComics.filter((comicPair) => !comicPair.every(isRead));

    // flatten list
    const comicPairs = seriesComics.flat();

    const comicsPairsFiltered = comicPairs.filter((comicPair: IComicPullPair) => {
      if (comicPair.comic.on_sale < earliestUnread) return false;
      return (
        filterBy("read", comicPair) &&
        filterBy("pull.pull_list_id", comicPair) &&
        filterByRegex("comic.title", comicPair)
      );
    });

    return comicsPairsFiltered;
  }, [pullsQuery.data, seriesQuery.data, filterBy, filterByRegex]);

  return (
    <div>
      <h2>Comics</h2>
      <Table
        columns={columns}
        dataSource={dataSource}
        loading={pullsQuery.isLoading || seriesQuery.isLoading || pullListsQuery.isLoading}
        onChange={handleChange}
        pagination={{ pageSize: 50 }}
        rowClassName={utils.rowClassName}
        size="small"
      />
    </div>
  );
}

export default ComicsList;

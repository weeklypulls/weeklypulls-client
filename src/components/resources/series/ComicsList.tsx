import { Table, Button, Input } from "antd";
import type { TableProps } from "antd";
import type { ColumnsType, ColumnType } from "antd/es/table";
import { toJS } from "mobx";
import { observer } from "mobx-react";
import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import COLUMNS from "./ComicsListColumns";
import { IComic, IComicPullPair } from "../../../interfaces";
import Store from "../../../store";
import { StoreContext } from "../../../storeContext";
import utils from "../../../utils";

const { future, stringSort } = utils;

const isRead = (comicPair: IComicPullPair) => comicPair.read;

function ComicsList() {
  const store = useContext<Store>(StoreContext);
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await Promise.all([store.pullLists.listIfCold(), store.getAllSeries()]);
      } catch (e: any) {
        // tslint:disable-next-line no-console
        console.error(e);
        if (mounted && e?.response?.status === 401) {
          navigate("/login");
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [store, navigate]);

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
    store.setFilters(normalizedFilters);
  };

  const onInputChange = useCallback((event: any) => {
    setSearchText(event.target.value);
  }, []);

  const onSearch = useCallback(() => {
    store.setFilters({
      ...toJS(store.filters),
      "comic.title": [searchText],
    });
    setFilterDropdownOpen(false);
  }, [searchText, store]);

  const onClear = useCallback(() => {
    setSearchText("");
    store.setFilters({
      ...toJS<any>(store.filters),
      "comic.title": [],
    });
    setFilterDropdownOpen(false);
  }, [store]);

  const columns: ColumnsType<IComicPullPair> = useMemo(() => {
    const filters = store.filters as any;
    return COLUMNS.map((column) => {
      const col: ColumnType<IComicPullPair> = { ...column };
      const key = String(column.key ?? "");
      col.filteredValue = toJS(filters?.[key] ?? []);

      if (column.key === "pull.pull_list_id") {
        col.filters = store.pullLists.all.map((pullList) => ({
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
    store.filters,
    store.pullLists.all,
    filterDropdownOpen,
    onInputChange,
    onSearch,
    onClear,
    searchText,
  ]);

  const filterByRegex = useCallback(
    (key: string, record: IComicPullPair) => {
      const filters = ((store.filters as any)?.[key] ?? []) as string[];
      const value = (record as any)?.[key]?.toString?.() ?? "";
      if (!filters.length) return true;
      const filter = filters[0];
      const reg = new RegExp(filter, "gi");
      return !!value.match(reg);
    },
    [store.filters]
  );

  const filterBy = useCallback(
    (key: string, record: IComicPullPair) => {
      const filters = ((store.filters as any)?.[key] ?? []) as string[];
      const value = (record as any)?.[key]?.toString?.() ?? "";
      if (!filters.length) return true;
      return filters.includes(value);
    },
    [store.filters]
  );

  const dataSource: IComicPullPair[] = useMemo(() => {
    const pulls = store.pulls.all;

    let earliestUnread = "";
    let seriesComics = pulls.map((pull) => {
      const series = store.series.get(pull.series_id);
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
    const comicPairs = seriesComics.reduce(
      (flat: IComicPullPair[], toFlatten: IComicPullPair[]) => flat.concat(toJS(toFlatten)),
      [] as IComicPullPair[]
    );

    const comicsPairsFiltered = comicPairs.filter((comicPair: IComicPullPair) => {
      if (comicPair.comic.on_sale < earliestUnread) return false;
      return (
        filterBy("read", comicPair) &&
        filterBy("pull.pull_list_id", comicPair) &&
        filterByRegex("comic.title", comicPair)
      );
    });

    return comicsPairsFiltered;
  }, [store.pulls.all, store.series, filterBy, filterByRegex]);

  return (
    <div>
      <h2>Comics</h2>
      <Table
        columns={columns}
        dataSource={dataSource}
        loading={store.isLoading}
        onChange={handleChange}
        pagination={{ pageSize: 50 }}
        rowClassName={utils.rowClassName}
        size="small"
      />
    </div>
  );
}

export default observer(ComicsList);

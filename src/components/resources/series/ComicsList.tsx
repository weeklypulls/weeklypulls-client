import { Table, Button, Input } from "antd";
import { PaginationConfig } from "antd/lib/pagination";
import { ColumnProps } from "antd/lib/table";
import autoBindMethods from "class-autobind-decorator";
import { toJS, observable } from "mobx";
import { inject, observer } from "mobx-react";
import React, { Component } from "react";
import { RouteComponentProps } from "react-router";

import COLUMNS from "./ComicsListColumns";
import { IComic, IComicPullPair } from "../../../interfaces";
import Store, { IFilters } from "../../../store";
import utils from "../../../utils";

const { future, stringSort } = utils;

const isRead = (comicPair: IComicPullPair) => comicPair.read;

interface IInjected extends RouteComponentProps {
  store: Store;
}

@inject("store")
@autoBindMethods
@observer
class ComicsList extends Component<RouteComponentProps> {
  @observable public searchText = "";
  @observable public filterDropdownVisible = false;

  private get injected() {
    return this.props as IInjected;
  }

  public componentDidMount() {
    this.getAllSeries();
  }

  public async getAllSeries() {
    try {
      await Promise.all([
        this.injected.store.pullLists.listIfCold(),
        this.injected.store.getAllSeries(),
      ]);
    } catch (e) {
      // tslint:disable-next-line no-console
      console.error(e);
      if ((e as any)?.response?.status === 401) {
        this.props.history.push("/login");
      }
    }
  }

  public handleChange(pagination: PaginationConfig, filters: IFilters) {
    this.injected.store.setFilters(filters);
  }

  public onInputChange(event: any) {
    this.searchText = event.target.value;
  }

  public onFilterDropdownVisibleChange(visible: boolean) {
    this.filterDropdownVisible = visible;
  }

  public onSearch() {
    const { store } = this.injected;

    store.setFilters({
      ...toJS<any>(store.filters),
      "comic.title": [this.searchText],
    });

    this.filterDropdownVisible = false;
  }

  public onClear() {
    const { store } = this.injected;

    this.searchText = "";
    store.setFilters({
      ...toJS<any>(store.filters),
      "comic.title": [],
    });

    this.filterDropdownVisible = false;
  }

  public get columns(): Array<ColumnProps<IComicPullPair>> {
    const filters = this.injected.store.filters;

    return COLUMNS.map((column) => {
      column.filteredValue = toJS((filters as any)?.[column.key || ""] ?? []);

      if (column.key === "pull.pull_list_id") {
        column.filters = this.injected.store.pullLists.all.map((pullList) => ({
          text: pullList.title,
          value: pullList.id,
        }));
      }

      if (column.key === "comic.title") {
        column.onFilterDropdownVisibleChange = this.onFilterDropdownVisibleChange;
        column.filterDropdownVisible = this.filterDropdownVisible;
        column.filterDropdown = (
          <div className="custom-filter-dropdown">
            <Input
              onChange={this.onInputChange}
              onPressEnter={this.onSearch}
              placeholder="Search name"
              value={this.searchText}
            />
            <Button type="primary" onClick={this.onSearch}>
              Search
            </Button>
            <Button onClick={this.onClear}>Clear</Button>
          </div>
        );
      }

      return column;
    });
  }

  public filterByRegex(key: string, record: IComicPullPair) {
    const filters = ((this.injected.store.filters as any)?.[key] ?? []) as string[],
      value = (record as any)?.[key]?.toString?.() ?? "";

    if (!filters.length) {
      return true;
    }

    const filter = filters[0],
      reg = new RegExp(filter, "gi");

    return !!value.match(reg);
  }

  public filterBy(key: string, record: IComicPullPair) {
    const filters = ((this.injected.store.filters as any)?.[key] ?? []) as string[],
      value = (record as any)?.[key]?.toString?.() ?? "";

    if (!filters.length) {
      return true;
    }

    return filters.includes(value);
  }

  public dataSource(): IComicPullPair[] {
    const { store } = this.injected,
      pulls = store.pulls.all;

    // Build out data
    let earliestUnread = "";
    let seriesComics = pulls.map((pull) => {
      const series = store.series.get(pull.series_id);

      if (!series) {
        return [];
      }

      const comics: IComic[] = ((series as any)?.comics ?? []) as IComic[],
        pullComicPairs = comics
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

    // Filter out series
    seriesComics = seriesComics.filter((comicPair) => !comicPair.every(isRead));

    // flatten list
    const comicPairs = seriesComics.reduce((flat, toFlatten) => flat.concat(toJS(toFlatten)), []);

    const comicsPairsFiltered = comicPairs.filter((comicPair: IComicPullPair) => {
      let filter = true;

      if (comicPair.comic.on_sale < earliestUnread) {
        return false;
      }

      filter = filter && this.filterBy("read", comicPair);
      filter = filter && this.filterBy("pull.pull_list_id", comicPair);
      filter = filter && this.filterByRegex("comic.title", comicPair);

      return filter;
    });

    return comicsPairsFiltered;
  }

  public render() {
    const { store } = this.injected;
    return (
      <div>
        <h2>Comics</h2>
        <Table
          columns={this.columns}
          dataSource={this.dataSource()}
          loading={store.isLoading}
          onChange={this.handleChange}
          pagination={{ pageSize: 50 }}
          rowClassName={utils.rowClassName}
          size="small"
        />
      </div>
    );
  }
}

export default ComicsList;

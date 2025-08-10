import { FormModal } from "@mighty-justice/fields-ant";
import { Table, Spin, Empty } from "antd";
import { ColumnProps } from "antd/lib/table";
import autoBindMethods from "class-autobind-decorator";
import { get } from "lodash";
import { action, observable } from "mobx";
import { inject, observer } from "mobx-react";
import React, { Component } from "react";
import { RouteComponentProps } from "react-router";
import { Link } from "react-router-dom";

import { IComic, IComicPullSeriesPair } from "../../../interfaces";
import Store from "../../../store";
import utils from "../../../utils";
import Images from "../../common/Images";
import LoadingButton from "../../common/LoadingButton";
import ModalButton from "../../common/ModalButton";
import ReadButton from "../../common/ReadButton";
import Title from "../../common/Title";

interface IInjected extends RouteComponentProps {
  store: Store;
}

@inject("store")
@autoBindMethods
@observer
class PullsDetail extends Component<RouteComponentProps> {
  @observable public isLoading = false;

  private get injected() {
    return this.props as IInjected;
  }

  private get pullId(): string {
    return get(this.injected.match.params, "pullId", "");
  }

  public componentWillMount() {
    this.getSeries();
  }

  public async getSeries() {
    const { store } = this.injected;

    try {
      const pull = await store.pulls.fetchIfCold(this.pullId);
      await Promise.all([
        store.pullLists.fetchIfCold(pull.pull_list_id),
        // Fetch series from ComicVine-backed data API
        store.series.fetchIfCold(pull.series_id),
      ]);
    } catch (e) {
      // tslint:disable-next-line no-console
      console.error(e);
      if (get(e, "response.status") === 401) {
        this.props.history.push("/login");
      }
    }
  }

  public dataSource(): IComicPullSeriesPair[] {
    const { store } = this.injected,
      pullWithSeries = store.pullWithSeries(this.pullId);

    if (!pullWithSeries) {
      return [];
    }
    const { series, pull } = pullWithSeries;
    return series.comics.map((comic: IComic) => ({
      comic,
      key: comic.id,
      pull,
      read: pull.read.includes(comic.id),
      series,
    }));
  }

  private get columns(): Array<ColumnProps<IComicPullSeriesPair>> {
    return [
      {
        dataIndex: "read",
        key: "read",
        title: "Read",
        render: (_: any, record: IComicPullSeriesPair) => (
          <ReadButton comic={record.comic} value={record.read} />
        ),
      },
      {
        dataIndex: "comic.images",
        key: "comic.images",
        title: "Covers",
        render: (_: any, record: IComicPullSeriesPair) => <Images images={record.comic.images} />,
      },
      {
        dataIndex: "comic.on_sale",
        key: "comic.on_sale",
        title: "On Sale",
        render: (_: any, record: IComicPullSeriesPair) => {
          const text = record.comic.on_sale;
          if (!text) {
            return "--";
          }
          const date = text.slice(0, 10);
          return <Link to={`/weeks/${date}`}>{date}</Link>;
        },
      },
      {
        dataIndex: "comic.title",
        key: "comic.title",
        title: "Title",
      },
    ];
  }

  public async onSave(model: any) {
    const { store } = this.injected,
      pullWithSeries = store.pullWithSeries(this.pullId);

    if (!pullWithSeries) {
      return;
    }
    const { pull } = pullWithSeries;

    if (pull.id) {
      await store.pulls.patch(pull.id, model);
    } else {
      await store.pulls.post({ ...model, series_id: pull.series_id });
    }
  }

  @action
  public async onDelete() {
    const { store } = this.injected;
    const pull = await store.pulls.fetchIfCold(this.pullId);

    this.isLoading = true;
    await store.pulls.delete(pull.id);
    await store.pullLists.fetch(pull.pull_list_id);
    this.injected.history.goBack();
    this.isLoading = false;
  }

  public render() {
    const { store } = this.injected,
      pullSeriesPair = store.pullWithSeries(this.pullId);
    if (this.isLoading) {
      return <Spin size="large" />;
    }

    if (!pullSeriesPair) {
      return <Empty description="Pull not found" />;
    }

    return (
      <div>
        <Title title={pullSeriesPair.series.title}>
          <LoadingButton type="danger" onClick={this.onDelete}>
            Delete
          </LoadingButton>
          <ModalButton
            label="Edit"
            modalComponent={FormModal}
            modalProps={{
              fieldSets: [
                [
                  {
                    field: "pull_list_id",
                    label: "Pull List",
                    optionType: "pullLists",
                    type: "optionSelect",
                  },
                ],
              ],
              model: pullSeriesPair.pull,
              onSave: this.onSave,
              title: pullSeriesPair.series.title,
            }}
          />
        </Title>

        <Table
          columns={this.columns}
          dataSource={this.dataSource()}
          loading={store.isLoading}
          pagination={{ pageSize: 50 }}
          rowClassName={utils.rowClassName}
          size="small"
        />
      </div>
    );
  }
}

export default PullsDetail;

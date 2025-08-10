import { Button, Icon, Row, Col } from "antd";
import autoBindMethods from "class-autobind-decorator";
import { inject, observer } from "mobx-react";
import React, { Component } from "react";
import { Link, RouteComponentProps } from "react-router-dom";

import COLUMNS from "./WeeksDetailPageColumns";
import { IComic, IComicPullPair } from "../../../interfaces";
import Store from "../../../store";
import utils from "../../../utils";
import ObserverTable from "../../common/ObserverTable";

interface IProps {
  weekId: string;
}

interface IInjected extends IProps, RouteComponentProps {
  store: Store;
}

@inject("store")
@autoBindMethods
@observer
class WeeksDetailPage extends Component<IProps> {
  private get injected() {
    return this.props as IInjected;
  }

  private get weekId(): string {
    return (this.injected.match.params as any)?.weekId ?? "";
  }

  public componentDidMount() {
    this.fetch(this.injected);
  }

  public componentDidUpdate() {
    this.fetch(this.injected);
  }

  public fetch(props: IInjected) {
    const { store } = props;
    store.weeks.fetchIfCold(this.weekId);
  }

  public get comics(): IComic[] {
    const { store } = this.injected,
      week = store.weeks.get(this.weekId),
      comics: IComic[] = (week as any)?.comics ?? [];

    return comics;
  }

  public dataSource(): IComicPullPair[] {
    return this.comics.map((comic: IComic) => {
      const pull = (this.injected.store.pulls.all as any[]).find(
        (p) => String(p.series_id) === String(comic.series_id)
      );

      if (!pull) {
        return {
          comic,
          key: comic.id,
          pull,
          read: false,
          store: this.injected.store,
        } as any;
      }

      return {
        comic,
        key: comic.id,
        pull,
        read: pull.read.includes(comic.id),
        store: this.injected.store,
      } as any;
    });
  }

  public render() {
    const weekId = this.weekId,
      nextWeek = utils.nextWeek(weekId),
      lastWeek = utils.prevWeek(weekId);

    const { store } = this.injected;

    return (
      <div>
        <Row type="flex" justify="space-between" align="top">
          <Col span={12}>
            <h2>Week of {weekId}</h2>
          </Col>
          <Col span={12} style={{ textAlign: "right" }}>
            <Button.Group>
              <Link to={`/weeks/${lastWeek}`}>
                <Button type="primary">
                  <Icon type="left" />
                  {lastWeek}
                </Button>
              </Link>{" "}
              <Button type="ghost" disabled>
                {weekId}
              </Button>{" "}
              <Link to={`/weeks/${nextWeek}`}>
                <Button type="primary">
                  {nextWeek}
                  <Icon type="right" />
                </Button>
              </Link>
            </Button.Group>
          </Col>
        </Row>

        <ObserverTable
          columns={COLUMNS as any}
          dataSource={this.dataSource()}
          loading={store.isLoading}
          pagination={false}
          size="small"
        />
      </div>
    );
  }
}

export default WeeksDetailPage;

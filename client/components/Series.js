import React, { Component } from 'react';
import PropTypes from 'prop-types';
import autobind from 'autobind-decorator';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import _ from 'lodash';

import utils from '../utils';
import Comic from './Comic';


@autobind
@observer
class Series extends Component {
  @observable minimized = null;

  defaultMinimized () {
    const allRead = !this.props.series.api.comics.some(comics => !(comics.read || comics.skipped));
    return allRead;
  }

  getMinimized () {
    if (this.minimized === null) {
      return this.defaultMinimized();
    }
    return this.minimized;
  }

  toggleMinimized () {
    if (this.minimized === null) {
      this.minimized = !this.defaultMinimized();
    }
    else {
      this.minimized = !this.minimized;
    }
  }

  fillInRead () {
    const {
      store,
      series,
    } = this.props;

    store.fillInRead(series.series_id);
  }

  render () {
    const {
        series,
        store,
      } = this.props
      , comicsSorted = _.sortBy(series.api.comics, 'on_sale')
      , comicsPublished = comicsSorted.filter(comic => !utils.future(comic.on_sale))
      ;

    return (
      <div className='series'>
        <h3>{series.api.title} <a onClick={this.toggleMinimized}>[{this.minimized ? '+' : '-'}]</a></h3>
        {!this.getMinimized() && (<div>
          <a onClick={this.fillInRead}>Fill in read</a>
          <ol>
            {comicsPublished.map(comic => (
              <Comic
                comic={comic}
                key={`series_comic${comic.id}`}
                pulled
                store={store}
              />
            ))}
          </ol>
        </div>)}
      </div>
    );
  }

  static propTypes = {
    mark: PropTypes.func,
    series: PropTypes.object,
    store: PropTypes.object,
  }
}

export default Series;

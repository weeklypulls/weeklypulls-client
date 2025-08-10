import moment from 'moment';
import { DateTime } from 'luxon';
import _ from 'lodash';
import cx from 'classnames';

import consts from './consts';
import { IComicPullPair } from './interfaces';

function stringSort (a: string, b: string) {
  if (a < b) { return -1; }
  if (a > b) { return 1; }
  return 0;
}

function future (week: string) {
  const date = moment(week, consts.DATE_FORMAT)
    , now = moment()
    ;

  return (date > now);
}

function nearFuture (week: string) {
  const date = moment(week, consts.DATE_FORMAT)
    , now = moment()
    , tooFar = moment().add(1, 'week')
    ;

  return (date > now) && (date < tooFar);
}

function farFuture (week: string) {
  const date = moment(week, consts.DATE_FORMAT)
    , tooFar = moment().add(1, 'week')
    ;

  return (date > tooFar);
}

function nearestWed () {
  return DateTime.fromObject({ weekday: 3 }).toISODate();
}

function nextWeek (weekIso: string) {
  return DateTime.fromISO(weekIso).plus({ weeks: 1 }).toISODate();
}

function prevWeek (weekIso: string) {
  return DateTime.fromISO(weekIso).minus({ weeks: 1 }).toISODate();
}

function stringAttrsSort (a: object, b: object, attrs: string[]) {
  for (const attr of attrs) {
    if (_.get(a, attr) < _.get(b, attr)) { return -1; }
    if (_.get(a, attr) > _.get(b, attr)) { return 1; }
  }
  return 0;
}

function rowClassName (record: IComicPullPair) {
  const { read } = record;
  return cx({
    'comic-read': read,
    'comic-toread': !read,
  });
}

export default {
  farFuture,
  future,
  nearestWed,
  nearFuture,
  nextWeek,
  prevWeek,
  rowClassName,
  stringAttrsSort,
  stringSort,
};

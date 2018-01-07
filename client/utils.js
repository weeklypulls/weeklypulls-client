import { observable } from 'mobx';
import autoBindMethods from 'class-autobind-decorator';
import moment from 'moment';
import { DateTime } from 'luxon';

import consts from './consts';

@autoBindMethods
class ModalManager {
  @observable isShowing = false;

  open () { this.isShowing = true; }
  close () { this.isShowing = false; }
}

function stringSort (a, b) {
  if (a < b) { return -1; }
  if (a > b) { return 1; }
  return 0;
}

function future (week) {
  const date = moment(week, consts.DATE_FORMAT)
    , now = moment()
    ;

  return (date > now);
}

function nearFuture (week) {
  const date = moment(week, consts.DATE_FORMAT)
    , now = moment()
    , tooFar = moment().add(1, 'week')
    ;

  return (date > now) && (date < tooFar);
}

function farFuture (week) {
  const date = moment(week, consts.DATE_FORMAT)
    , tooFar = moment().add(1, 'week')
    ;

  return (date > tooFar);
}

function nextWeek (weekIso) {
  return DateTime.fromISO(weekIso).plus({ weeks: 1 }).toISODate();
}

function prevWeek (weekIso) {
  return DateTime.fromISO(weekIso).minus({ weeks: 1 }).toISODate();
}

export default {
  farFuture,
  future,
  ModalManager,
  nearFuture,
  nextWeek,
  prevWeek,
  stringSort,
};

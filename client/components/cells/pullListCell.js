export default function pullListCell (text, record) {
  const pullList = record.store.pullLists.find(pullList => pullList.id === record.pull_list_id);
  return pullList ? pullList.title : '--';
}

export default function normalise(list) {
  const byId = {};
  const items = list.map(item => {
    byId[item.id] = item;
    return item.id
  });

  return {
    byId,
    items
  };
}

export default function items(list, attributes, mediaTypeWhitelist) {
  const inWhitelist = item => (
    !mediaTypeWhitelist || mediaTypeWhitelist.includes(item[attributes.mediaType])
  );

  return list.filter(inWhitelist).map(item => {
    const ret = {};

    Object.keys(attributes).forEach(key => {
      try {
        ret[key] = item[attributes[key]]
      } catch(exception) {
        ret[key] = undefined;
        console.error(`Can't get ${key} for ${item}.`);
      }
    });

    return ret;
  });
}

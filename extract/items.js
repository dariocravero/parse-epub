import querySelectorAll from '../query-selector-all.js';

export default function items(xml, item, attributes, mediaTypeWhitelist) {
  const inWhitelist = item => (
    !mediaTypeWhitelist ||
    mediaTypeWhitelist.indexOf(item.attributes[attributes.mediaType]) > -1
  );

  return querySelectorAll(xml, item).filter(inWhitelist).map(item => {
    const ret = {};

    Object.keys(attributes).forEach(key => {
      try {
        ret[key] = item.attributes[attributes[key]]
      } catch(exception) {
        ret[key] = undefined;
        console.error(`Can't get ${key} for ${item}.`);
      }
    });

    return ret;
  });
}

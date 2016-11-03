export default function items(xml, item, attributes, mediaTypeWhitelist) {
  return Array.prototype.filter.call(xml.querySelectorAll(item), item => (
    !mediaTypeWhitelist ||
    mediaTypeWhitelist.indexOf(item.getAttribute(attributes.mediaType)) > -1
  )).map(item => {
    const ret = {};

    Object.keys(attributes).forEach(key => {
      try {
        ret[key] = item.getAttribute(attributes[key])
      } catch(exception) {
        ret[key] = undefined;
        console.error(`Can't get ${key} for ${item} on ${tag}.`);
      }
    });

    return ret;
  });
}

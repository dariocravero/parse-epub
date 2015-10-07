export default function items(xml, item, attributes) {
  return Array.prototype.map.call(xml.querySelectorAll(item), item => {
    let ret = {};

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

const querySelector = (node, tag) => {
  let ret = false;

  const inside = n => {
    const r = querySelector(n, tag);
    if (r) {
      ret = r;
    }
    return r;
  }

  if (node.tagName === tag) {
    ret = node;
  // } else if (Array.isArray(node)) {
  //   node.find(inside);
  } else if (Array.isArray(node.children)) {
    node.children.find(inside);
  }

  return ret;
}

export default querySelector;

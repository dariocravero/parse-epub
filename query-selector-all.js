import flatten from 'flatten';

const querySelectorAll = (node, tag) => {
  let ret = []

  if (node.tagName === tag) {
    ret = [node]
  } else if (Array.isArray(node.children)) {
    ret = node.children.map(n => querySelectorAll(n, tag)).filter(Boolean)
  }

  return ret
}

export default (node, tag) => flatten(querySelectorAll(node, tag));

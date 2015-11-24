// this function will return DOM parsed nodes that are not comments or text nodes containing whitespace
export default function canIgnoreNode(node) {
  return !((node.nodeType === window.Node.COMMENT_NODE) ||
          ((node.nodeType === window.Node.TEXT_NODE) && !(/[^\t\n\r ]/.test(node.textContent))));
}

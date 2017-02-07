/* global DOMParser */

const HTML = 'text/html';
const XML = 'text/xml';
const domParser = new DOMParser();

export function parseRaw(markup, contentType=XML) {
  return domParser.parseFromString(markup, contentType);
}

export function parseRawHtml(markup) {
  return parseRaw(markup, HTML);
}

export function parseRawXml(markup) {
  return parseRaw(markup, XML);
}

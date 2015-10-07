const COVER_HREF_REGEX = /cover-image/;

export default function coverHref(manifest) {
  let href;

  try {
    href = manifest.find(item => COVER_HREF_REGEX.test(item.properties)).href;
  } catch(exception) {
    console.error(exception);
  }

  return href;
}

// TODO
// - Support ePub2 coverHref
//   https://github.com/dariocravero/readium-js/blob/master/src/epub/package-document-parser.js#L395-L417

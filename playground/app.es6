import parse, { parseSmil } from '../index';

const URI = '/books/xplor-g8-smil';

console.log('parse-epub: parsing book', URI);

parse(URI)
  .then(data => {
    console.log('parse-epub: parsed data', data);

    parseSmil(URI, data.manifest, data.metadata)
      .then(smil => {
        console.log('parse-epub: smil data', smil);

        window.$p = {
          book: data,
          smil
        };

        console.log('parse-epub: you can play with window.$p now', $p);
      });
  });

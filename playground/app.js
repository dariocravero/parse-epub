import { parseBook, parseAllSmil } from '../index';

const URI = '/books/demo';

console.log('parse-epub: parsing book', URI);

parseBook(URI)
  .then(data => {
    console.log('parse-epub: parsed data', data);

    parseAllSmil(URI, data.manifest, data.metadata)
      .then(smil => {
        console.log('parse-epub: smil data', smil);

        window.$p = {
          book: data,
          smil
        };

        console.log('parse-epub: you can play with window.$p now', $p);
      });
  });

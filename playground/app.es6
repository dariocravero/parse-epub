import { parseBook, parseSmil, parseAllSmil } from '../index';

const URI = '/books/xplor-g8-smil';
const SINGLE_SMIL = `${URI}/OPS/smil/collection01/selenasblog.xhtml.smil`;

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

console.log('parse-epub: parsing single smil', SINGLE_SMIL);

parseSmil(SINGLE_SMIL).then(smil => console.log(smil));

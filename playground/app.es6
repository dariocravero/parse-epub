import { parseBook, parseSmil, parseAllSmil } from '../index';

const URI = '/books/xplor-g8-smil';
const PACKAGE_DIRECTORY = 'CONTENT/OPS';
const SINGLE_SMIL = `${URI}/${PACKAGE_DIRECTORY}/smil/culture_and_belonging/selena_s_blog.xhtml.smil`;


console.log('parse-epub: parsing book', URI);

parseBook(URI)
  .then(data => {
    console.log('parse-epub: parsed data', data);
    const { manifest, metadata, packageDirectory } = data;

    parseAllSmil(URI, manifest, metadata, packageDirectory)
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

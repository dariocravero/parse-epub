import { parseBook, parseSmil, parseAllSmil } from '../index';

const URI = '/books/demo';
const SINGLE_SMIL = `${URI}/OPS/smil/anne_franks_legacy/a_star_who_s_anne_s_age.xhtml.smil`;

async function runParseBook(URI){
  try {
    const data = await parseBook(URI);
    console.log('parse-epub: parsing book', URI);

    const smil = await parseAllSmil(URI, data.manifest, data.metadata);

    window.$p = {
          book: data,
          smil
        };

    console.log('parse-epub: you can play with window.$p now', $p);

  } catch(err) {
    console.error(err)
  }
}

async function runParseSmil(SINGLE_SMIL){
  try{
    const smil = await parseSmil(SINGLE_SMIL);
    console.log('parse-epub: parsing single smil', SINGLE_SMIL);
    console.log(smil);
  }catch(err){
    console.error(err)
  }
}

runParseBook(URI);
runParseSmil(SINGLE_SMIL);

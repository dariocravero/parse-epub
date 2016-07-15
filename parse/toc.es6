import extractToc from '../extract/toc';
import fetchTocHtml from '../fetch/toc-html';

export default function parseToc(uri){
  return fetchTocHtml(uri).then(tocHtml => {
    return extractToc(tocHtml);
  });
}

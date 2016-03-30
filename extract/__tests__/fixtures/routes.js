import files from './files';

export default {
  name: 'smil',
  matcher: /\.smil$/,
  response: url => ({
    body: files[url.match(/OPS\/(.+)\.smil/)[1]]
  })
};

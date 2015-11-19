import files from './files';

export default [{
    name: 'smil',
    matcher: /\.smil$/,
    response: {
      body: url => files[url.match(/OPS\/(.+)\.smil/)[1]]
    }
  }
];

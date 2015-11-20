import FILES from './files';

const parser = new DOMParser();

export default Object.keys(FILES).map(key => parser.parseFromString(FILES[key], 'text/xml'));

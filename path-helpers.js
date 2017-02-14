// These functions are lifted directly from https://www.npmjs.com/package/path-browserify
// I have only included the ones that we are currently using - if we need any more in future: go get 'em!
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  let up = 0;
  for (let i = parts.length - 1; i >= 0; i--) {
    const last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
const splitPathRe =  /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
const splitPath = filename => {
  return splitPathRe.exec(filename).slice(1);
}

function filter(xs, f) {
  if (xs.filter) return xs.filter(f);
  let res = [];
  for (var i = 0; i < xs.length; i++) {
      if (f(xs[i], i, xs)) res.push(xs[i]);
  }
  return res;
}

var substr = 'ab'.substr(-1) === 'b'
  ? function (str, start, len) { return str.substr(start, len) }
  : function (str, start, len) {
    if (start < 0) start = str.length + start;
    return str.substr(start, len);
}

export function resolve() {
  let resolvedPath = '';
  let resolvedAbsolute = false;

  for (let i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    const path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
}

export function normalize(path) {
  const absolute = isAbsolute(path);
  const trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !absolute).join('/');

  if (!path && !absolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (absolute ? '/' : '') + path;
}

export function isAbsolute(path) {
  return path.charAt(0) === '/';
}

export function join() {
  const paths = Array.prototype.slice.call(arguments, 0);
  return normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
}

export function dirname(path) {
  const result = splitPath(path);
  const root = result[0];
  let dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
}

export function extname(path) {
  return splitPath(path)[3];
}

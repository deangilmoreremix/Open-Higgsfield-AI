const UID_KEY_NAME = 'butteruid';

const parseUri = (str) => {
  const o = parseUri.options;
  const m = o.parser[o.strictMode ? 'strict' : 'loose'].exec(str);
  const uri = {};
  let i = 14;

  while (i--) {
    uri[o.key[i]] = m[i] || '';
  }

  uri[o.q.name] = {};
  uri[o.key[12]].replace(o.q.parser, ($0, $1, $2) => {
    if ($1) {
      uri[o.q.name][$1] = $2;
    }
  });

  return uri;
};

parseUri.options = {
  strictMode: false,
  key: [
    'source', 'protocol', 'authority', 'userInfo', 'user', 'password',
    'host', 'port', 'relative', 'path', 'directory', 'file', 'query', 'anchor',
  ],
  q: {
    name: 'queryKey',
    parser: /(?:^|&)([^&=]*)=?([^&]*)/g,
  },
  parser: {
    strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/,
    loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/,
  },
};

const uriToString = (uri) => {
  let s = '';

  s += uri.protocol ? `${uri.protocol}://` : '';
  s += uri.authority || '';
  s += uri.path || '';
  s += uri.query ? `?${uri.query}` : '';
  s += uri.anchor ? `#${uri.anchor}` : '';

  return s;
};

const updateQuery = (uriObject) => {
  const { queryKey } = uriObject;
  let queryString = '';
  let queryKeyCount = 0;
  let key;
  let value;

  for (key in queryKey) {
    if (queryKey.hasOwnProperty(key)) {
      value = queryKey[key];
      queryString += queryKeyCount > 0 ? '&' : '';
      queryString += key;
      queryString += (!!value || value === 0) ? `=${value}` : '';
      queryKeyCount++;
    }
  }
  uriObject.query = queryString;
  return uriObject;
};

class Uri {
  isValid(str) {
    const urlRegex = '^(?!mailto:)(?:(?:http|https|ftp)://)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$';
    const url = new RegExp(urlRegex, 'i');
    return url.test(str);
  }

  isValidImageURI(str) {
    const imageUrlRegex = '^(http)?s?:?(\\/\\/[^"\']*\\.(?:png|jpg|jpeg|gif|png|svg))$';
    const imageUrl = new RegExp(imageUrlRegex, 'i');
    return imageUrl.test(str.split('?')[0]);
  }

  _seed = Date.now();

  set seed(value) {
    this._seed = value | 0;
  }

  get seed() {
    return this._seed;
  }

  parse(uriString) {
    const uri = parseUri(uriString);
    uri.toString = () => uriToString(uri);
    return uri;
  }

  makeUnique(uriObject) {
    if (typeof uriObject === 'string') {
      uriObject = this.parse(uriObject);
    }
    const { queryKey } = uriObject;
    queryKey[UID_KEY_NAME] = this._seed++;
    return updateQuery(uriObject);
  }

  stripUnique(uriObject) {
    if (typeof uriObject === 'string') {
      uriObject = this.parse(uriObject);
    }

    const { queryKey } = uriObject;
    if (queryKey) {
      delete queryKey[UID_KEY_NAME];
    }
    return updateQuery(uriObject);
  }
}

export default Uri;

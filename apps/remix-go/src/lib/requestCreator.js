function trimLeft(str, replacement) {
  while (str.charAt(0) === replacement) {
    str = str.substr(1);
  }
  return str;
}

function createURL(hostname, path, isServer) {
  if (hostname.indexOf('http://') === 0 || hostname.indexOf('https://') === 0) {
    // URL already has protocol
  }
  if (!isServer) {
    return `//${hostname}/${trimLeft(path, '/')}`;
  }
  return `http://${hostname}/${trimLeft(path, '/')}`;
}

export default (
  hostname,
  authorization,
  isServer = false,
  refreshFn,
) => async (url, requestOptions = {}) => {
  let currentAuthorization = authorization;

  function handleResponse(resp) {
    const redirect = resp.headers.get('Location');
    if (redirect) {
      if (!isServer) {
        window.location.replace(redirect);
      }
      return Promise.reject({ redirect });
    }

    const contentType = resp.headers && resp.headers.get('Content-Type');
    const isJSON = contentType && contentType.includes('json');
    const response = resp[isJSON ? 'json' : 'text']();

    return resp.ok ? response : response.then((err) => {
      if (process.env.DEV) {
        console.error('requestError:', err);
      }
      throw err;
    });
  }

  const requestURL = createURL(hostname, url, isServer);
  if (!requestOptions.headers) {
    requestOptions.headers = {};
  }

  const { headers } = requestOptions;

  if (requestOptions.body && !(requestOptions.body instanceof FormData)) {
    requestOptions.body = JSON.stringify(requestOptions.body);
    Object.assign(requestOptions.headers, {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    });
  }
  if (process.env.DEV) {
    console.info('requestURL:', requestURL);
  }

  headers.Authorization = headers.Authorization || currentAuthorization;

  let resp = await fetch(requestURL, requestOptions);
  if (resp.status === 401 && refreshFn) {
    currentAuthorization = await refreshFn();
    resp = await fetch(requestURL, requestOptions);
  }
  return handleResponse(resp);
};

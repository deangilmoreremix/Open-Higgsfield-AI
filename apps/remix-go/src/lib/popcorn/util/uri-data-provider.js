/**
 * Created by vedi on 14/04/16.
 */

const uriDataProvider = {
  name: 'uri',

  onReady() {
    // it's supposed to be redefined
  },

  canSupplyAny() {
    return true;
  },

  init() {
    this.onReady();
  },

  fetchData(callback) {
    try {
      const urlParams = this.getQueryParams(window.location.search.substr(1).split('&'));
      urlParams.url = window.location.origin + window.location.pathname;
      callback(null, urlParams);
    } catch (err) {
      callback(err);
    }
  },

  getQueryParams(params) {
    if (params === '') {
      return {};
    }
    const result = {};
    for (let i = 0; i < params.length; ++i) {
      const p = params[i].split('=', 2);
      if (p.length === 1) {
        result[p[0]] = '';
      } else {
        result[p[0]] = decodeURIComponent(p[1].replace(/\+/g, ' '));
      }
    }
    return result;
  },
};

export default uriDataProvider;

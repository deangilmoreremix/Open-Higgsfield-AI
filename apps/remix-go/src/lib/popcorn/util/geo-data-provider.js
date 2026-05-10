/**
 * Created by vedi on 24/03/16.
 */

import $ from 'jquery';

const SUPPORTED_KEYS = ['GEOCOUNTRY', 'GEOCITY', 'GEOSTATE'];

const FIELD_MAPPING = {
  country: 'GEOCOUNTRY',
  city: 'GEOCITY',
  regionName: 'GEOSTATE',
};

let result;

let country;
let city;
const awaitingCallbacks = [];

function getCountry(variables, callback) {
  if (country) {
    return callback(null, country);
  }
  awaitingCallbacks.push(callback);

  if (awaitingCallbacks.length > 1) {
    return;
  }
  $.getJSON('//pro.ip-api.com/json/?key=PjlxsWS2ccSdeop&callback=?')
    .then((data) => {
      if (!data) {
        throw new Error('Wrong result');
      }

      country = variables.GEOCOUNTRY = data.country;
      city = variables.GEOCITY = data.city;
      while (awaitingCallbacks.length > 0) {
        const awaitingCallback = awaitingCallbacks.shift();
        awaitingCallback(null, country);
      }
    })
    .fail((jqxhr, textStatus, error) => {
      const errorDetails = textStatus + ', ' + error;
      const err = new Error(errorDetails);
      while (awaitingCallbacks.length > 0) {
        const awaitingCallback = awaitingCallbacks.shift();
        awaitingCallback(err);
      }
    });
}

const geoDataProvider = {
  name: 'geo',

  onReady() {
    // it's supposed to be redefined
  },

  canSupplyAny(customVarKeys) {
    let found = false;
    SUPPORTED_KEYS.forEach((supportedKey) => {
      found = found || customVarKeys.indexOf(supportedKey) >= 0;
    });
    return found;
  },

  init() {
    this.onReady();
  },

  fetchData(callback) {
    if (!result) {
      $.getJSON('//pro.ip-api.com/json/?key=PjlxsWS2ccSdeop&callback=?')
        .then((data) => {
          if (!data) {
            throw new Error('Wrong result');
          }

          result = {};
          for (const key in data) {
            if (data.hasOwnProperty(key)) {
              const mapper = FIELD_MAPPING[key];
              if (mapper) {
                if (typeof mapper === 'function') {
                  mapper(result, data[key]);
                } else {
                  result[mapper] = data[key];
                }
              }
            }
          }

          callback(null, result);
        })
        .fail((jqxhr, textStatus, error) => {
          const errorDetails = textStatus + ', ' + error;
          const err = new Error(errorDetails);
          callback(err);
        });
    } else {
      callback(null, result);
    }
  },

  getCountry: getCountry,
};

export default geoDataProvider;

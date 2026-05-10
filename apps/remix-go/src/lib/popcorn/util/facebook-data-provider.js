/**
 * Created by vedi on 24/03/16.
 */

import $ from 'jquery';

const SUPPORTED_KEYS = ['EMAIL', 'NAME', 'FIRSTNAME', 'LASTNAME', 'IMAGE', 'GENDER'];
const TAB_IMAGE = 'https://cdn.vidcloud.io/resources/img/fb_tab_image.png';
const FIELD_MAPPING = {
  email: 'EMAIL',
  first_name: 'FIRSTNAME',
  last_name: 'LASTNAME',
  name: 'NAME',
  gender: 'GENDER',
  picture(dest, value) {
    dest.IMAGE = value ? value.data.url : undefined;
  },
};

const SOCIALIZER_APP_ID = '701751126630371';
const DEFAULT_APP_ID = SOCIALIZER_APP_ID;
const DEFAULT_NEEDED_PERMISSIONS = 'public_profile,email,user_gender';

let loggedIn = false;
let currentCallback;

const useFbButton = document.getElementById('useFbButton');
const withoutFbButton = document.getElementById('withoutFbButton');
const connectFbContainer = document.getElementById('connect-fb');

function fetchUserData(callback) {
  FB.api('/me',
    { fields: 'email, first_name, last_name, name, gender, picture.width(720)' },
    (response) => {
      const result = {};
      for (var key in response) {
        if (response.hasOwnProperty(key)) {
          const mapper = FIELD_MAPPING[key];
          if (mapper) {
            if (typeof mapper === 'function') {
              mapper(result, response[key]);
            } else {
              result[mapper] = response[key];
            }
          }
        }
      }

      // if opt-in hasn't been used - write user data into storage
      if (typeof (Storage) !== 'undefined' && localStorage.personalizedString) {
        const dataToStore = [];
        for (key in result) {
          if (result.hasOwnProperty(key)) {
            dataToStore.push(`${key}=${result[key]}`);
          }
        }
        localStorage.personalizedString = dataToStore.join('&');
      }

      callback(null, result);
    });
}

function fetchPagesData(callback) {
  FB.api('/me/accounts',
    {
      fields: 'id,name,access_token,fan_count',
      limit: 999,
    },
    (response) => {
      const result = response.data || [];
      callback(null, result);
    });
}

function getPageTabs(pageId, pageAccessToken, callback) {
  FB.api(`/${pageId}/tabs`,
    {
      access_token: pageAccessToken,
      app_id: window.fbDataProvider.currentAppId,
    },
    (response) => {
      if (!response || response.error) {
        console.log(response.error);
        return callback(new Error(response.error));
      }

      callback(null, response);
    },
  );
}

function postToFeed(options, callback) {
  FB.ui({
    method: 'share',
    href: `${options.backendUrl}/api/makes/fb-share/${SOCIALIZER_APP_ID
    }?projectUrl=${options.projectUrl
    }&redirectUrl=${encodeURIComponent(options.redirectUrl)
    }&timestamp=${Date.now()}`,
  }, (response) => {
    // Debug response (optional)
    if (!response || response.error) {
      console.log(response.error);
      return callback(new Error(response.error));
    }

    callback(null, response);
  });
}

function createTab(pageId, pageAccessToken, tabName, callback) {
  const globalProvider = window.fbDataProvider;
  FB.api(`/${pageId}/tabs`,
    'POST',
    {
      access_token: pageAccessToken,
      app_id: globalProvider.currentAppId,
      custom_image_url: TAB_IMAGE,
      custom_name: tabName,
    },
    (response) => {
      if (!response || response.error) {
        console.log(response.error);
        return callback(new Error(response.error));
      }

      const tabId = `${pageId}/tabs/app_${globalProvider.currentAppId}`;

      FB.api(`/${tabId}`, {
        access_token: pageAccessToken,
        fields: 'link',
      }, (response) => {
        if (!response || response.error) {
          console.log(response.error);
          return callback(new Error(response.error));
        }

        callback(null, {
          url: `https://www.facebook.com${response.data[0].link}`,
        });
      });
    });
}

function onUseFbButtonClicked() {
  destroyFbButtons();

  function callback(err, data) {
    if (currentCallback) {
      currentCallback(err, data);
      currentCallback = undefined;
    }
  }

  login((err) => {
    if (err) {
      return callback(err);
    }

    fetchUserData(callback);
  });
}

function onWithoutFbButtonClicked() {
  destroyFbButtons();

  if (currentCallback) {
    currentCallback();
    currentCallback = undefined;
  }
}

function destroyFbButtons() {
  connectFbContainer.remove();
}

function showFbButtons(callback) {
  if (!connectFbContainer) {
    return;
  }

  currentCallback = callback;
  connectFbContainer.classList.remove('hidden');

  useFbButton.addEventListener('click', onUseFbButtonClicked);
  withoutFbButton.addEventListener('click', onWithoutFbButtonClicked);
}

function login(neededPermissions, callback) {
  if (typeof neededPermissions === 'function') {
    callback = neededPermissions;
    neededPermissions = DEFAULT_NEEDED_PERMISSIONS;
  }
  if (!loggedIn) {
    FB.login((response) => {
      if (response.status === 'connected') {
        callback();
      } else {
        callback(response);
      }
    }, { scope: neededPermissions });
  } else {
    callback();
  }
}

function checkPermissions(neededPermissions, permissions) {
  const normalizedPermissions = [];
  permissions.forEach((item) => {
    normalizedPermissions.push(item.permission);
  });

  const neededPermissionsArr = neededPermissions.split(',');
  for (let i = 0; i < neededPermissionsArr.length; i++) {
    if (normalizedPermissions.indexOf(neededPermissionsArr[i]) < 0) {
      return false;
    }
  }

  return true;
}

function settleAuth(neededPermissions, callback) {
  if (typeof neededPermissions === 'function') {
    callback = neededPermissions;
    neededPermissions = DEFAULT_NEEDED_PERMISSIONS;
  }

  FB.getLoginStatus((response) => {
    if (response.status === 'connected') {
      // get permissions
      FB.api('/me/permissions', {
        fields: 'permission',
        status: 'granted',
      },
      (response) => {
        if (!checkPermissions(neededPermissions, response.data)) {
          callback(null, false);
        } else {
          callback(null, true);
        }
      });
    } else {
      callback(null, false);
    }
  });
}

function updateCache(data, callback) {
  if (typeof callback !== 'function') {
    callback = function () {
    };
  }

  return $
    .post('/api/makes/update-fb-cache', data, callback);
}

const facebookDataProvider = {
  name: 'facebook',

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

  init(appId, callback) {
    if (typeof appId === 'function') {
      callback = appId;
      appId = DEFAULT_APP_ID;
    }

    this.currentAppId = appId || DEFAULT_APP_ID;
    window.fbDataProvider = this;

    if (window.fbDataProvider.inited) {
      callback();
    }

    const globalProvider = window.fbDataProvider;
    window.fbAsyncInit = function () {
      function runningInFB() {
        try {
          return window.self !== window.top && /app_runner_fb/.test(window.name);
        } catch (e) {
          return true;
        }
      }

      let controlsContainer;
      let fullScreenBtn;
      let fullScreenBtnWidth;
      let rightControlContainer;
      let rightControlsWidth;
      let controlsVolumeContainer;
      let controlsVolumeOffsetRight;
      const videoContainer = document.getElementById('video-container');
      const container = document.getElementById('body');

      try {
        FB.init({
          appId: globalProvider.currentAppId,
          xfbml: true,
          version: 'v6.0',
        });
        globalProvider.inited = true;
      } catch (ex) {
      }

      globalProvider.onReady && globalProvider.onReady();

      if (runningInFB()) {
        const controls = document.getElementById('controls');
        window.FB.Canvas.setSize({
          height: (videoContainer ? videoContainer.clientHeight : 0) + (controls ? controls.clientHeight : 0),
          width: (videoContainer ? videoContainer.clientWidth : 0),
        });
        controlsContainer = document.getElementById('butter-controls');
        fullScreenBtn = document.getElementById('controls-fullscreen');
        fullScreenBtnWidth = fullScreenBtn ? fullScreenBtn.clientWidth : 0;
        rightControlContainer = document.querySelector('.controls-right');
        rightControlsWidth = rightControlContainer ? rightControlContainer.clientWidth : 0;
        controlsVolumeContainer = document.getElementById('controls-volume-container');
        controlsVolumeOffsetRight = (controlsContainer ? controlsContainer.clientWidth : 0)
          - (controlsVolumeContainer ? controlsVolumeContainer.offsetLeft : 0) - (controlsVolumeContainer ? controlsVolumeContainer.clientWidth : 0);

        // workaround to avoid background blinking
        setTimeout(() => {
          container.style.visibility = 'visible';
        }, 500);

        if (fullScreenBtn) {
          fullScreenBtn.style.display = 'none';
        }
        rightControlContainer && (rightControlContainer.style.width = `${rightControlsWidth - fullScreenBtnWidth}px`);
        controlsVolumeContainer && (controlsVolumeContainer.style.width = `${(controlsVolumeContainer ? controlsVolumeContainer.clientWidth : 0) + fullScreenBtnWidth}px`);
        controlsVolumeContainer && (controlsVolumeContainer.style.right = `${controlsVolumeOffsetRight - fullScreenBtnWidth}px`);
      } else {
        // make sure we're not in editor
        if (!window.Butter || (window.Butter && !window.Butter.app)) {
          container.style.visibility = 'visible';
        }
      }

      if (callback) {
        callback();
      }
    };

    (function (d, s, id) {
      let js; const
        fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) {
        return;
      }
      js = d.createElement(s);
      js.id = id;
      js.src = '//connect.facebook.net/en_US/sdk.js';
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
  },

  fetchData(callback) {
    if (!window.fbDataProvider.inited) {
      return callback && callback({ message: 'Fail on FB init.' });
    }
    settleAuth((err, result) => {
      loggedIn = result;
      if (!loggedIn) {
        showFbButtons(callback);
      } else {
        fetchUserData(callback);
      }
    });
  },

  settleAuth,
  fetchUserData,
  login,
  fetchPagesData,
  getPageTabs,
  createTab,
  postToFeed,
  updateCache,
};

export default facebookDataProvider;

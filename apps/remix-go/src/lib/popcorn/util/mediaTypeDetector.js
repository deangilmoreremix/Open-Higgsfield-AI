class MediaTypeDetector {
  constructor() {
    this.contentTypeDetectionEndpoint = '/api/get-content-type';
  }

  extractYouTubeDuration(duration) {
    let a = duration.match(/\d+/g);
    if (duration.indexOf('M') >= 0 && duration.indexOf('H') === -1 && duration.indexOf('S') === -1) {
      a = [0, a[0], 0];
    }
    if (duration.indexOf('H') >= 0 && duration.indexOf('M') === -1) {
      a = [a[0], 0, a[1]];
    }
    if (duration.indexOf('H') >= 0 && duration.indexOf('M') === -1 && duration.indexOf('S') === -1) {
      a = [a[0], 0, 0];
    }
    duration = 0;
    if (a.length === 3) {
      duration += parseInt(a[0], 10) * 3600;
      duration += parseInt(a[1], 10) * 60;
      duration += parseInt(a[2], 10);
    }
    if (a.length === 2) {
      duration += parseInt(a[0], 10) * 60;
      duration += parseInt(a[1], 10);
    }
    if (a.length === 1) {
      duration += parseInt(a[0], 10);
    }
    return duration;
  }

  checkUrl(url) {
    const REGEX_MAP = {
      YouTube: /^(?:https?:\/\/www\.|https?:\/\/m\.|https?:\/\/|www\.|\.|^)youtu/,
      Video360: /vr360:\/\/(.)*\.(mp4|m3u8|mpd)/,
      Adaptive: /((.)*\.(mp4|m3u8|mpd)?)+\|((.)*\.(mp4|m3u8|mpd)\|?)+/,
      Vimeo: /^(?:https?:\/\/www\.|https?:\/\/|www\.|\.|^)(vimeo\.com(\/[A-z0-9]*)+|player\.vimeo\.com\/video\/\d+)/,
      SoundCloud: /^(?:https?:\/\/www\.|https?:\/\/|www\.|\.|^)(w\.)?(soundcloud)/,
      Archive: /^(?:https?:\/\/www\.|https?:\/\/|www\.|\.|^)archive\.org\/(details|download|stream)\/((.*)start(\/|=)[\d\.]+(.*)end(\/|=)[\d\.]+)?/,
      Image: /((https|http)?:\/\/.*\.(?:png|jpg|jpeg|bmp|svg))/,
      null: /^\s*#t=(?:\d*(?:(?:\.|\:)?\d+)?),?(\d+(?:(?:\.|\:)\d+)?)\s*$/,
      Flickr: /^https?:\/\/(www\.)?flickr\.com/,
      Clyp: /^https?:\/\/(www\.)?(staging\.)?(?:clyp\.it|audiour\.com)/,
    };
    return Object.keys(REGEX_MAP).find(mediaType => REGEX_MAP[mediaType].test(url)) || 'HTML5';
  }

  async getMetadata(baseUrl, contentType) {
    baseUrl = decodeURI(baseUrl);
    const type = this.checkUrl(baseUrl);

    if (type === 'YouTube') {
      const parsedUri = new URL(baseUrl);
      const id = parsedUri.searchParams.get('v') || parsedUri.pathname.replace(/\/(embed\/)?/, '');
      if (!id) {
        return;
      }

      const xhrURL = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,status&id=${id}&key=AIzaSyC-t0srJyedCcUSL4kEIQkUkJ15eFPwNwc&alt=json`;
      const resp = await fetch(xhrURL, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!resp.ok) {
        throw new Error('Failed to fetch YouTube data');
      }

      const videoData = (await resp.json()).items[0];
      if (typeof videoData === 'undefined') {
        throw new Error('This YouTube video is unplayable');
      }

      const snippetData = videoData.snippet;
      let from = parsedUri.searchParams.get('t');

      if (videoData.status?.embeddable !== true) {
        throw new Error('Embedding of this YouTube video is disabled');
      }

      if (from) {
        from = from.replace(/(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?/, (all, hours, minutes, seconds) => {
          hours |= 0;
          minutes |= 0;
          seconds |= 0;
          return (+seconds + (((hours * 60) + minutes) * 60));
        });
      }

      const isVideo360 = videoData.contentDetails && videoData.contentDetails.projection === '360';
      return {
        source: `http://www.youtube.com/watch?v=${id}`,
        title: snippetData.title,
        type,
        thumbnail: (snippetData.thumbnails.standard || snippetData.thumbnails.high)?.url,
        author: snippetData.channelTitle,
        duration: this.extractYouTubeDuration(videoData.contentDetails.duration) > 0
          ? this.extractYouTubeDuration(videoData.contentDetails.duration) - 1
          : 15,
        from,
        projection: isVideo360,
      };
    } else if (type === 'Vimeo') {
      const id = await fetch(`https://vimeo.com/api/oembed.json?url=${baseUrl}`, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      }).then(r => r.json()).then(data => data.video_id);

      const xhrURL = `https://vimeo.com/api/v2/video/${id}.json`;
      const resp = await fetch(xhrURL, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!resp.ok) {
        throw new Error('This Vimeo video is unplayable');
      }

      const respData = await resp.json();
      const source = `http://player.vimeo.com/video/${id}`;

      return {
        source,
        type,
        thumbnail: respData[0].thumbnail_large || respData[0].thumbnail_medium,
        duration: respData[0].duration,
        title: respData[0].title,
      };
    } else {
      if (type === 'Adaptive') {
        baseUrl = baseUrl.split('|').find(url => url.split('.').reverse()[0] === 'mp4');
      }
      const title = baseUrl.substring(baseUrl.lastIndexOf('/') + 1);
      const encodedBaseUrl = encodeURI(baseUrl);

      if (!contentType) {
        const xhrURL = `${this.contentTypeDetectionEndpoint}?url=${encodeURIComponent(baseUrl)}`;
        const resp = await fetch(xhrURL, {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        });

        if (!resp.ok) {
          throw new Error('Failed to detect content type');
        }

        const data = await resp.json();
        ({ contentType } = data);

        if (!contentType) {
          throw new Error('Unable to detect content type');
        }
      }

      const successOptions = {
        source: encodedBaseUrl,
        type: 'HTML5',
        title,
        thumbnail: encodedBaseUrl,
        contentType,
        duration: 5,
      };

      if (contentType.indexOf('video') === 0 || contentType.indexOf('application/octet-stream') === 0) {
        const mediaElem = document.createElement('video');
        mediaElem.src = encodedBaseUrl;

        return new Promise((resolve, reject) => {
          mediaElem.addEventListener('loadedmetadata', () => {
            successOptions.duration = mediaElem.duration;
            resolve(successOptions);
          });
          mediaElem.addEventListener('error', () => {
            reject(new Error('This media is unplayable'));
          });
        });
      } else if (contentType.indexOf('audio') === 0 || contentType.indexOf('audio/mpeg') === 0) {
        const mediaElem = document.createElement('audio');
        mediaElem.src = encodedBaseUrl;
        successOptions.hidden = true;

        return new Promise((resolve, reject) => {
          mediaElem.addEventListener('loadedmetadata', () => {
            successOptions.duration = mediaElem.duration;
            resolve(successOptions);
          });
          mediaElem.addEventListener('error', () => {
            reject(new Error('This media is unplayable'));
          });
        });
      } else if (contentType.indexOf('image') === 0) {
        const mediaElem = document.createElement('img');
        mediaElem.src = encodedBaseUrl;

        return new Promise((resolve, reject) => {
          mediaElem.addEventListener('load', () => {
            successOptions.width = mediaElem.naturalWidth;
            successOptions.height = mediaElem.naturalHeight;
            resolve(successOptions);
          });
          mediaElem.addEventListener('error', () => {
            reject(new Error('This image is unavailable'));
          });
        });
      }

      throw new Error('This media is unplayable');
    }
  }
}

export default MediaTypeDetector;

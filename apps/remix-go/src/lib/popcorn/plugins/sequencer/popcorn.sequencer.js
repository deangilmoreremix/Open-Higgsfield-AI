/* eslint-disable no-underscore-dangle */
// PLUGIN: sequencer

((Popcorn) => {
  let _waiting = 0;

  const loadingHandler = {
    loading: [],
    compare(a, b) {
      return a.start - b.start;
    },
    add(options, beginLoad) {
      const _this = this;
      this.loading.push({
        start: options.start,
        end: options.end,
        beginLoad,
      });
      this.loading.sort(this.compare);
      if (this.loading.length === 1) {
        setTimeout(() => {
          _this.next();
        }, 0);
      }
    },
    next(currentTime) {
      let nextClip = 0;
      for (let index = 0; index < this.loading.length; index += 1) {
        if (this.loading[index].start <= currentTime &&
          this.loading[index].end >= currentTime) {
          nextClip = index;
          break;
        }
      }
      if (this.loading[nextClip]) {
        this.loading[nextClip].beginLoad();
      }
      this.loading.splice(nextClip, 1);
    },
  };

  Popcorn.plugin('sequencer', {
    _setup(options) {
      const _this = this;
      options._context = _this;

      options.setupContainer = () => {
        const container = document.createElement('div');
        let target = Popcorn.dom.find(options.target) || _this.media.parentNode;

        options._target = target;
        options._container = container;

        container.style.zIndex = options.zindex;
        container.className = 'popcorn-sequencer';
        container.style.position = 'absolute';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.top = 0;
        container.style.left = 0;
        container.style.pointerEvents = 'none';

        target.appendChild(container);
      };

      options.displayLoading = () => {
        if (!options.waiting) {
          options.waiting = true;
          _waiting += 1;
        }
      };

      options.hideLoading = () => {
        if (options.waiting) {
          options.waiting = false;
          _waiting -= 1;
          if (_waiting === 0) {
            _this.emit('sequencesReady');
          }
        }
      };

      options.setZIndex = () => {
        if (!options.hidden && options.active) {
          options._container.style.zIndex = +options.zindex;
        } else {
          options._container.style.zIndex = 0;
        }
      };

      if (!options.from || options.from > options.duration) {
        options.from = 0;
      }

      options._volumeEvent = () => {
        if (_this.muted()) {
          options._clip.mute();
        } else if (!options.mute) {
          options._clip.unmute();
          options._clip.volume((options.volume / 100) * _this.volume());
        } else {
          options._clip.mute();
        }
      };

      options.readyEvent = () => {
        options._clip.media.style.width = '100%';
        options._clip.media.style.height = '100%';
        options._container.style.width = '100%';
        options._container.style.height = '100%';
        if (options._cancelLoad) {
          options.playIfReady();
          options._cancelLoad = false;
          options.teardown();
        }
        options.failed = false;
        options._clip.off('error', options.fail);
        options._clip.off('loadedmetadata', options.readyEvent);
        options.ready = true;
        options._container.style.width = `${options.width || '100'}%`;
        options._container.style.height = `${options.height || '100'}%`;
        options._container.style.top = `${options.top || '0'}%`;
        options._container.style.left = `${options.left || '0'}%`;
        _this.on('volumechange', options._volumeEvent);
        if (options.active) {
          options._startEvent();
        } else {
          options._setClipCurrentTime(+options.from);
          options._container.style.zIndex = 0;
        }
        options.hideLoading();
      };

      options.clearLoading = () => {
        loadingHandler.next(_this.currentTime());
        options._clip.off('loadedmetadata', options.clearLoading);
      };

      options.fail = () => {
        options.clearLoading();
        options.failed = true;
        options.setZIndex();
        options.hideLoading();
        options.playIfReady();
      };

      options.addSource = () => {
        if (options.denied) {
          options.fail();
        }

        options.source = typeof options.source === 'string' ? [options.source] : options.source;

        options._clip = Popcorn.smart(
          options._container, options.source,
          { frameAnimation: true, framerate: 120 },
        );

        if (options._clip.error) {
          options.fail();
          return;
        }

        if (options._clip.media.readyState >= 1) {
          options.readyEvent();
          options.clearLoading();
        } else {
          options._clip.on('loadedmetadata', options.readyEvent);
          options._clip.on('loadedmetadata', options.clearLoading);
        }
      };

      options.teardown = () => {
        _this.off('volumechange', options._volumeEvent);
        if (options._clip) {
          options._clip.destroy();
        }
        if (options._container && options._container.parentNode) {
          options._container.parentNode.removeChild(options._container);
        }
      };

      options.setupContainer();
      if (options.source) {
        options.source = typeof options.source === 'string' ? [options.source] : options.source;
        loadingHandler.add(options, options.addSource);
      }

      options._startEvent = () => {
        options._setClipCurrentTime();
        _this.on('seeked', options._onSeeked);
        if (options._clip.media.buffered.length) {
          _this.on('timeupdate', options._onTimeUpdate);
          options._clip.on('progress', options._onProgress);
        }
        if (options.playIfReady()) {
          options._clip.play();
        }
        _this.on('play', options._playEvent);
        _this.on('pause', options._pauseEvent);
        options.hideLoading();
        options.setZIndex();
        if (options.active) {
          options._volumeEvent();
        }
      };

      options._endEvent = () => {
        if (!options._clip.paused()) {
          options._clip.pause();
        }
        options._setClipCurrentTime(+options.from);
        options._clip.mute();
        options._container.style.zIndex = 0;
      };

      options._playEvent = () => {
        if (options._clip.paused() &&
          !_waiting &&
          !options._clip.ended()) {
          options._clip.play();
        }
      };

      options._pauseEvent = () => {
        if (!options._clip.paused()) {
          options._clip.pause();
        }
      };

      options._onSeeked = () => {
        options._setClipCurrentTime();
      };

      options._setClipCurrentTime = (time) => {
        if (!time && time !== 0) {
          time = (_this.currentTime() - options.start) + (+options.from);
        }
        if (time !== options._clip.currentTime() &&
          time >= (+options.from) && time <= options.duration) {
          options._clip.currentTime(time);
        }
      };

      options.playIfReady = () => {
        if (options.playWhenReady && !_waiting) {
          options.playWhenReady = false;
          _this.play();
          return true;
        }
        return false;
      };

      options.toString = () => options.title || options.source || '';
    },

    start(event, options) {
      options.active = true;
      options._container.style.zIndex = options.zindex;
      if (options.source) {
        if (!options.hidden && options.failed) {
          options._container.style.zIndex = +options.zindex;
          return;
        }
        if (!options._context.paused()) {
          options.playWhenReady = true;
        }
        if (options.ready) {
          options._startEvent();
        } else {
          options._context.pause();
          options.displayLoading();
        }
      }
    },

    end(event, options) {
      options.active = false;
      options.playWhenReady = false;
      options.hideLoading();
      if (options.ready) {
        options._clip.off('progress', options._onProgress);
        options._endEvent();
      }
    },

    _update(options, updates) {
      if (updates.source && updates.source.toString() !== options.source.toString()) {
        options.ready = false;
        options.playWhenReady = false;
        if (options.active) {
          options.displayLoading();
        }
        options.source = typeof updates.source === 'string' ? [updates.source] : updates.source;
        options.clearEvents();
        options.teardown();
        options.setupContainer();
        loadingHandler.add(options, options.addSource);
      }
    },

    _teardown(options) {
      if (options.ready || !options.source) {
        options.teardown();
      } else {
        options._cancelLoad = true;
      }
    },

    manifest: {
      about: {},
      options: {
        start: { elem: 'input', type: 'text', label: 'In', units: 'seconds' },
        end: { elem: 'input', type: 'text', label: 'Out', units: 'seconds' },
        source: { elem: 'input', type: 'url', label: 'Source URL', default: '' },
        title: { elem: 'input', type: 'text', label: 'Clip title', default: '' },
        width: { elem: 'input', type: 'number', label: 'Width', default: 100, units: '%', hidden: true },
        height: { elem: 'input', type: 'number', label: 'Height', default: 100, units: '%', hidden: true },
        top: { elem: 'input', type: 'number', label: 'Top', default: 0, units: '%', hidden: true },
        left: { elem: 'input', type: 'number', label: 'Left', default: 0, units: '%', hidden: true },
        from: { elem: 'input', type: 'seconds', units: 'seconds', label: 'Start at', default: 0 },
        volume: { elem: 'input', type: 'range', units: '%', label: 'Volume', min: 0, max: 100, default: 100 },
        hidden: { elem: 'input', type: 'checkbox', label: 'Sound only', default: false },
        mute: { elem: 'input', type: 'checkbox', label: 'Mute', default: false },
        zindex: { hidden: true, default: 0 },
        duration: { hidden: true, default: 0 },
      },
    },
  });
})(window.Popcorn);

((Popcorn) => {
  Popcorn.plugin('pausePlugin', function() {
    const _this = this;
    let _timeout;
    const _seekedFunc = function() {
      if (_timeout) {
        clearTimeout(_timeout);
      }
      this.off('seeked', _seekedFunc);
    };

    return {
      _setup(options) {
        options.toString = function() {
          setTimeout(function() {
            const keyDuration = window.document.querySelectorAll('[data-manifest-key=duration]')[0];
            if (options.duration > 0 && keyDuration) {
              keyDuration.value = options.duration;
            }
          }, 80);
          return `Pause ${options.duration > 0 ? options.duration : 'forever'}`;
        };
      },
      start(event, options) {
        if (this.on) {
          this.on('seeked', _seekedFunc);
        }
        if (this.pause) {
          this.pause();
        }
        if (+options.duration > 0) {
          _timeout = setTimeout(function() {
            _this.play();
            _this.off('seeked', _seekedFunc);
          }, options.duration * 1000);
        }

        if (options.scripts && options.scripts._compiled && options.scripts._compiled.onStart) {
          options.scripts._compiled.onStart();
        }
      },
      end(event, options) {
        if (this.on) {
          this.on('seeked', _seekedFunc);
        }

        if (options.scripts && options.scripts._compiled && options.scripts._compiled.onEnd) {
          options.scripts._compiled.onEnd();
        }
      },
    };
  },
  {
    displayName: 'Pause',
    options: {
      start: { elem: 'input', type: 'text', label: 'In', units: 'seconds' },
      end: { elem: 'input', type: 'text', label: 'Out', units: 'seconds', hidden: true },
      duration: { elem: 'input', type: 'number', label: 'Pause Duration (0 = forever)', units: 'seconds', default: '0' },
      target: { hidden: true },
    },
  });
})(window.Popcorn);

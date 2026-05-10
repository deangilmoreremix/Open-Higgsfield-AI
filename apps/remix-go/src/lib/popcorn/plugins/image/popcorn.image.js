/* eslint-disable no-underscore-dangle,no-new-func */
// PLUGIN: IMAGE

import interact from 'interactjs';
import { extendObservable } from 'mobx';

const { consts } = require('../../../../lib/consts/consts');

function isSafari() {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.indexOf('safari') !== -1) {
    return ua.indexOf('chrome') === -1;
  }
  return false;
}

((Popcorn) => {
  const APIKEY = '&api_key=b939e5bd8aa696db965888a31b2f1964';
  const FLICKR_SINGLE_CHECK = 'flickr.com/photos/';
  const PER_PAGE_MAX = 100;

  Popcorn.plugin('image', {
    _setup(options) {
      const _target = Popcorn.dom.find(options.target);
      const _container = document.createElement('div');
      
      _container.classList.add('popcorn-image');
      _container.style.width = `${options.width || 100}%`;
      _container.style.height = `${options.height || 100}%`;
      _container.style.top = `${options.top || 0}%`;
      _container.style.left = `${options.left || 0}%`;
      _container.style.zIndex = +options.zindex;
      _container.classList.add(options.transition);
      _container.classList.add('off');

      options._container = _container;
      options._context = this;

      if (_target) {
        _target.appendChild(_container);
      }

      // Setup image element
      if (options.src) {
        const _link = document.createElement('div');
        const _imageDiv = document.createElement('div');
        _link.classList.add('image-plugin-link');
        _imageDiv.classList.add('image-plugin-img');
        _imageDiv.style.backgroundImage = `url("${options.src}")`;
        _link.appendChild(_imageDiv);
        _container.appendChild(_link);
        options._link = _link;
        options._image = _imageDiv;
      }

      extendObservable(options, {
        src: options.src,
        linkSrc: options.linkSrc,
        cornerRadius: options.cornerRadius,
        background: options.background,
        backgroundColor: options.backgroundColor,
      });
    },

    start(event, options) {
      if (options._container) {
        options._container.classList.add('on');
        options._container.classList.remove('off');
      }
    },

    end(event, options) {
      if (options._container) {
        options._container.classList.add('off');
        options._container.classList.remove('on');
      }
    },

    _teardown(options) {
      if (options._container && options._container.parentNode) {
        options._container.parentNode.removeChild(options._container);
      }
    },

    manifest: {
      about: {
        name: 'Popcorn image Plugin',
        version: '0.1',
        author: 'cadecairos',
      },
      options: {
        target: { elem: 'input', type: 'text', label: 'Target', default: 'video-overlay' },
        src: { elem: 'input', type: 'url', label: 'Source URL', default: '' },
        linkSrc: { elem: 'input', type: 'url', label: 'Link URL' },
        width: { elem: 'input', type: 'number', label: 'Width', default: 100, units: '%', hidden: true },
        height: { elem: 'input', type: 'number', label: 'Height', default: 100, units: '%', hidden: true },
        top: { elem: 'input', type: 'number', label: 'Top', default: 0, units: '%', hidden: true },
        left: { elem: 'input', type: 'number', label: 'Left', default: 0, units: '%', hidden: true },
        cornerRadius: { elem: 'input', type: 'number', label: 'Corner Radius', default: 0, units: '%', hidden: true },
        background: { elem: 'input', type: 'checkbox', label: 'Background', default: false, hidden: true },
        backgroundColor: { elem: 'input', type: 'color', label: 'Background color', hidden: true },
        title: { elem: 'input', type: 'text', label: 'Image Title', default: '' },
        transition: { elem: 'select', options: ['None', 'Pop', 'Slide Up', 'Slide Down', 'Fade', 'Fade In', 'Pan & Zoom', 'Fade In Up'], values: ['popcorn-none', 'popcorn-pop', 'popcorn-slide-up', 'popcorn-slide-down', 'popcorn-fade', 'popcorn-fade-in', 'popcorn-pan-zoom', 'popcorn-fade-in-up'], label: 'Transition', default: 'popcorn-fade' },
        rotation: { elem: 'input', type: 'number', label: 'Rotation', default: 0, units: 'degrees' },
        start: { elem: 'input', type: 'text', label: 'In', units: 'seconds' },
        end: { elem: 'input', type: 'text', label: 'Out', units: 'seconds' },
        zindex: { hidden: true },
        scripts: { onStart: '', onEnd: '' },
      },
    },
  });
})(window.Popcorn);

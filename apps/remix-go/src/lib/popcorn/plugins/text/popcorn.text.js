/* eslint-disable no-underscore-dangle,no-new-func */
// PLUGIN: text

import interact from 'interactjs';
import { extendObservable } from 'mobx';

const { consts } = require('../../../../lib/consts/consts');

const { callToActionFeature } = consts;

function isSafari() {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.indexOf('safari') !== -1) {
    return ua.indexOf('chrome') === -1;
  }
  return false;
}

((Popcorn, jQuery) => {
  const DEFAULT_FONT_COLOR = '#000000';
  const DEFAULT_SHADOW_COLOR = '#444444';
  const DEFAULT_STROKE_COLOR = '#000000';
  const DEFAULT_BACKGROUND_COLOR = '#888888';

  const TOKEN_HELPER_CLASSES = {
    d: 'token-default',
    default: 'token-default',
    up: 'token-uppercase',
  };
  const OPEN_PERSONALIZATION_TAG = '<span class="personalized-token" contenteditable="false">';
  const CLOSE_PERSONALIZATION_TAG = '</span>';

  function getAbsoluteStyleDimension(element, style) {
    return window.getComputedStyle(element)[style];
  }

  Popcorn.plugin('text', {
    manifest: {
      about: {
        name: 'Popcorn text Plugin',
        version: '0.1',
        author: '@k88hudson, @mjschranz',
      },
      options: {
        text: {
          elem: 'textarea',
          label: 'Text',
          default: 'Video Editor',
        },
        linkUrl: {
          elem: 'input',
          type: 'text',
          label: 'Link URL',
        },
        callNotifyAddress: {
          elem: 'input',
          type: 'text',
          label: 'Email to notify about call attempt',
        },
        linkTarget: {
          elem: 'select',
          options: ['New Tab', 'Current Tab'],
          values: ['_blank', '_parent'],
          label: 'Open Link In',
          default: '_blank',
        },
        position: {
          elem: 'select',
          options: ['Custom', 'Middle', 'Bottom', 'Top'],
          values: ['custom', 'middle', 'bottom', 'top'],
          label: 'Text Position',
          default: 'custom',
        },
        alignment: {
          elem: 'select',
          options: ['Center', 'Left', 'Right'],
          values: ['center', 'left', 'right'],
          label: 'Text Alignment',
          default: 'center',
        },
        start: {
          elem: 'input',
          type: 'text',
          label: 'In',
          group: 'advanced',
          units: 'seconds',
        },
        end: {
          elem: 'input',
          type: 'text',
          label: 'Out',
          group: 'advanced',
          units: 'seconds',
        },
        transition: {
          elem: 'select',
          options: ['None', 'Pop', 'Fade', 'Fade In', 'Fade In Up', 'Slide Up', 'Slide Down', 'Swivel In (Y-axis)', 'Swivel In (X-axis)', 'Typing Effect', 'Blur (White)', 'Wobble Vertical', 'Wobble Horizontal', 'Wobble Diagonal', 'Pulse (Looped)', 'Push', 'Bob', 'Buzz', 'Buzz out', 'Stroke Pulse (Looped)', 'Flicker', 'Type Blink'],
          values: ['popcorn-none', 'popcorn-pop', 'popcorn-fade', 'popcorn-fade-in', 'popcorn-fade-in-up', 'popcorn-slide-up', 'popcorn-slide-down', 'popcorn-swivel-y', 'popcorn-swivel-x', 'popcorn-typing', 'popcorn-blur-w', 'popcorn-wobble-vertical', 'popcorn-wobble-horizontal', 'popcorn-wobble-diagonal', 'popcorn-pulse', 'popcorn-push', 'popcorn-bob', 'popcorn-buzz', 'popcorn-buzz-out', 'popcorn-stroke-pulse', 'animate-flicker', 'popcorn-type-blink'],
          label: 'Transition',
          default: 'popcorn-fade-in',
        },
        rotation: {
          elem: 'input',
          type: 'number',
          label: 'Rotation',
          default: 0,
          units: 'degrees',
        },
        fontFamily: {
          elem: 'select',
          label: 'Font',
          styleClass: '',
          googleFonts: true,
          group: 'advanced',
          default: 'Anton',
        },
        fontSize: {
          elem: 'input',
          type: 'number',
          label: 'Font Size',
          default: 8,
          units: '%',
          group: 'advanced',
        },
        fontColor: {
          elem: 'input',
          type: 'color',
          label: 'Font color',
          default: DEFAULT_FONT_COLOR,
          group: 'advanced',
        },
        shadow: {
          elem: 'input',
          type: 'checkbox',
          label: 'Shadow',
          default: false,
          group: 'advanced',
        },
        shadowColor: {
          elem: 'input',
          type: 'color',
          label: 'Shadow colour',
          default: DEFAULT_SHADOW_COLOR,
          group: 'advanced',
        },
        background: {
          elem: 'input',
          type: 'checkbox',
          label: 'Background',
          default: false,
          group: 'advanced',
        },
        backgroundColor: {
          elem: 'input',
          type: 'color',
          label: 'Background color',
          default: DEFAULT_BACKGROUND_COLOR,
          group: 'advanced',
        },
        stroke: {
          elem: 'input',
          type: 'checkbox',
          label: 'Stroke',
          default: false,
          group: 'advanced',
        },
        strokeColor: {
          elem: 'input',
          type: 'color',
          label: 'Stroke color',
          default: DEFAULT_STROKE_COLOR,
          group: 'advanced',
        },
        fontDecorations: {
          elem: 'checkbox-group',
          labels: { bold: 'Bold', italics: 'Italics', responsive: 'Scale To Fit' },
          default: { bold: false, italics: false, responsive: false },
          group: 'advanced',
        },
        left: {
          elem: 'input',
          type: 'number',
          label: 'Left',
          units: '%',
          default: 25,
          hidden: true,
        },
        top: {
          elem: 'input',
          type: 'number',
          label: 'Top',
          units: '%',
          default: 0,
          hidden: true,
        },
        width: {
          elem: 'input',
          type: 'number',
          units: '%',
          label: 'Width',
          default: 50,
          hidden: true,
        },
        height: {
          elem: 'input',
          type: 'number',
          units: '%',
          label: 'Height',
          default: 10,
          hidden: true,
        },
        zindex: {
          hidden: true,
        },
        scripts: {
          onStart: '',
          onEnd: '',
        },
      },
    },

    _setup(options) {
      // Setup code here (simplified for porting)
      const target = Popcorn.dom.find(options.target) || this.media.parentNode;
      const container = document.createElement('div');
      container.className = 'popcorn-text';
      container.style.position = 'absolute';
      container.style.zIndex = options.zindex;
      target.appendChild(container);
      options._container = container;
      options._context = this;
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
  });
})(window.Popcorn, window.jQuery);

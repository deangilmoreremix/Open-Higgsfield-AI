// PLUGIN: Popup

((Popcorn) => {
  const sounds = {};
  let soundIndex = 0;
  const MAX_AUDIO_TIME = 2;

  Popcorn.plugin('popup', {
    manifest: {
      about: {
        name: 'Video Editor Popup Plugin',
        version: '0.1',
        author: 'Kate Hudson @k88hudson, Matthew Schranz @mjschranz, Brian Chirls @bchirls',
      },
      options: {
        start: { elem: 'input', type: 'text', label: 'In', units: 'seconds' },
        end: { elem: 'input', type: 'text', label: 'Out', units: 'seconds' },
        text: { elem: 'textarea', label: 'Text', default: 'Pop!' },
        linkUrl: { elem: 'input', type: 'text', label: 'Link URL' },
        type: { elem: 'select', options: ['Popup', 'Speech', 'Thought Bubble'], values: ['popup', 'speech', 'thought'], label: 'Type', default: 'popup' },
        triangle: { elem: 'select', options: ['Top Left', 'Top Right', 'Bottom Left', 'Bottom Right'], values: ['top left', 'top right', 'bottom left', 'bottom right'], label: 'Tail Position', default: 'bottom left', optional: true },
        sound: { elem: 'input', type: 'checkbox', label: 'Sound', default: false, optional: true },
        icon: { elem: 'select', options: ['Error', 'Audio', 'Broken Heart', 'Cone', 'Earth', 'Eye', 'Heart', 'Info', 'Man', 'Money', 'Music', 'Net', 'Skull', 'Star', 'Thumbs Down', 'Thumbs Up', 'Time', 'Trophy', 'Tv', 'User', 'Virus', 'Women', 'None'], values: ['error', 'audio', 'brokenheart', 'cone', 'earth', 'eye', 'heart', 'info', 'man', 'money', 'music', 'net', 'skull', 'star', 'thumbsdown', 'thumbsup', 'time', 'trophy', 'tv', 'user', 'virus', 'women', 'none'], label: 'Pop Icon', default: 'info', optional: true },
        flip: { elem: 'input', type: 'checkbox', label: 'Flip Tail?', default: false, optional: true },
        top: { elem: 'input', type: 'number', label: 'Top', units: '%', default: 5, hidden: true },
        left: { elem: 'input', type: 'number', label: 'Left', units: '%', default: 20, hidden: true },
        width: { elem: 'input', type: 'number', units: '%', label: 'Width', default: 30, hidden: true },
        transition: { elem: 'select', options: ['None', 'Pop', 'Fade', 'Fade In Up', 'Slide Up', 'Slide Down'], values: ['popcorn-none', 'popcorn-pop', 'popcorn-fade', 'popcorn-fade-in-up', 'popcorn-slide-up', 'popcorn-slide-down'], label: 'Transition', default: 'popcorn-fade' },
        fontFamily: { elem: 'select', label: 'Font', styleClass: '', googleFonts: true, default: 'Merriweather', group: 'advanced' },
        fontSize: { elem: 'input', type: 'number', label: 'Font Size', units: 'px', group: 'advanced' },
        fontPercentage: { elem: 'input', type: 'number', label: 'Font Size', default: 7, units: '%', group: 'advanced' },
        fontColor: { elem: 'input', type: 'color', label: 'Font color', default: '#000000', group: 'advanced' },
        fontDecorations: { elem: 'checkbox-group', labels: { bold: 'Bold', italics: 'Italics', underline: 'Underline' }, default: { bold: false, italics: false, underline: false }, group: 'advanced' },
        zindex: { hidden: true },
        scripts: { onStart: '', onEnd: '' },
      },
    },

    _setup(options) {
      const target = Popcorn.dom.find(options.target) || this.media.parentNode;
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.top = `${options.top}%`;
      container.style.left = `${options.left}%`;
      container.style.width = `${options.width}%`;
      container.style.zIndex = +options.zindex;
      container.classList.add('popcorn-popup');
      container.classList.add(options.transition);
      container.classList.add('off');

      const innerDiv = document.createElement('div');
      innerDiv.classList.add('popup-inner-div');
      innerDiv.style.fontStyle = options.fontDecorations.italics ? 'italic' : 'normal';
      innerDiv.style.color = options.fontColor || '#668B8B';
      innerDiv.style.textDecoration = options.fontDecorations.underline ? 'underline' : 'none';
      innerDiv.style.fontWeight = options.fontDecorations.bold ? 'bold' : 'normal';

      if (options.fontSize) {
        innerDiv.style.fontSize = `${options.fontSize}px`;
      } else {
        innerDiv.style.fontSize = `${options.fontPercentage}%`;
      }

      if (options.text) {
        innerDiv.innerHTML = options.text.replace(/\r?\n/gm, '<br>');
      }

      container.appendChild(innerDiv);
      target.appendChild(container);
      options._container = container;
      options._context = this;
    },

    start(event, options) {
      if (options._container) {
        options._container.classList.add('on');
        options._container.classList.remove('off');
      }

      if (options.scripts && options.scripts._compiled && options.scripts._compiled.onStart) {
        options.scripts._compiled.onStart();
      }
    },

    end(event, options) {
      if (options._container) {
        options._container.classList.add('off');
        options._container.classList.remove('on');
      }

      if (options.scripts && options.scripts._compiled && options.scripts._compiled.onEnd) {
        options.scripts._compiled.onEnd();
      }
    },

    _teardown(options) {
      if (options._container && options._container.parentNode) {
        options._container.parentNode.removeChild(options._container);
      }
    },
  });
})(window.Popcorn);

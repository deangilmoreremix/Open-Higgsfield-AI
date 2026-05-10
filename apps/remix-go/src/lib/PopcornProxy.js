/* eslint-disable global-require */
const PopcornProxy = {
  init: () => {
    if (typeof window === 'undefined') {
      return;
    }

    // Popcorn.JS and plugins should be loaded via script tags
    // or imported separately. This function verifies initialization.
    if (!window.Popcorn) {
      console.warn('Popcorn.js is not loaded. Please include it via a script tag.');
    }
  },

  isInitialized: () => typeof window !== 'undefined' && !!window.Popcorn,

  videoResizer: (element, padding = 10, baseFontSize = 14, baseVideoWidth = 560) => () => {
    const wrapper = element;
    const parent = wrapper.parentNode;
    if (!parent) return;
    
    const maxWidth = parent.clientWidth - (padding * 2);
    const maxHeight = parent.clientHeight - (padding * 2);

    wrapper.style.padding = (maxWidth - ((maxHeight * 16) / 9)) / 2 > 0
      ? `${padding}px ${((maxWidth - ((maxHeight * 16) / 9)) / 2) + padding}px`
      : `${((maxHeight - ((maxWidth * 9) / 16)) / 2) + padding}px ${padding}px`;
    
    const video = wrapper.childNodes[0];
    if (video) {
      wrapper.style.fontSize = `${baseFontSize * (video.offsetWidth / baseVideoWidth)}px`;
    }
  },
};

export default PopcornProxy;

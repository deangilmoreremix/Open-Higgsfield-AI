import React from 'react';
import FontLoader from 'react-google-font-loader';

const GoogleFontsLoader = ({ fonts }) => (
  <FontLoader
    fonts={fonts.map(item => ({ font: item }))}
  />
);

GoogleFontsLoader.propTypes = {
  fonts: PropTypes.array,
};

export default GoogleFontsLoader;

import React, { Component } from 'react';
import { observer } from 'mobx-react';

import PropTypes from '../../PropTypes';

@observer
export default class PopcornEditor extends Component {
  static propTypes = {
    element: PropTypes.any, // TODO: define prop type
    features: PropTypes.any, // TODO: define prop type
    onElementUpdate: PropTypes.func.isRequired,
  };

  static editors = {};

  fonts = [
    'Kanit',
    'Russo One',
    'Beth Ellen',
    'Exo 2',
    'Italianno',
    'Fjalla One',
    'Gentium Book Basic',
    'Source Sans Pro',
    'Poppins',
    'Squada One',
    'Lato',
    'Questrial',
    'Sintony',
    'Lora',
    'Roboto',
    'Khula',
    'Yanone Kaffeesatz',
    'Syncopate',
    'Economica',
    'Vollkorn',
    'Rajdhani',
    'Merriweather',
    'Ek Mukta',
    'Merriweather Sans',
    'Istok Web',
    'Metrophobic',
    'Montserrat',
    'Gravitas One',
    'PT Sans',
    'Open Sans',
    'Oswald',
    'Palanquin',
    'Bangers',
    'Fredoka One',
    'Covered By Your Grace',
    'Coda',
    'Bowlby One SC',
    'Titan One',
    'Bevan',
    'Teko',
    'Tienne',
    'Alfa Slab One',
    'Martel Sans',
    'Raleway',
    'Fredericka the Great',
    'Cabin Sketch',
    'Special Elite',
    'Anton',
    'Zeyada',
    'La Belle Aurore',
    'Homemade Apple',
    'Crete Round',
    'Palanquin Dark',
    'Dawning of a New Day',
    'Give You Glory',
    'Indie Flower',
    'Just Me Again Down Here',
    'Over the Rainbow',
    'Permanent Marker',
    'Reenie Beanie',
    'Rock Salt',
    'Waiting for the Sunrise',
    'Walter Turncoat',
    'Vast Shadow',
    'Lily Script One',
    'Cookie',
  ];

  parseRgba(rgba) {
    const rgbaRegexp = new RegExp('((rgb|hsl)a?\\((\\d{1,3}%?,\\s?){3}(1|0?(\\.\\d+)?)\\))', 'i');
    if (!rgba) {
      return { r: 0, g: 0, b: 0, a: 1 };
    }
    rgba = rgba.replace(/\s/g, '');
    if (!rgbaRegexp.test(rgba)) {
      return rgba;
    }
    const components = rgba.split('(')[1].split(')')[0].split(',');
    return {
      r: +components[0],
      g: +components[1],
      b: +components[2],
      a: +components[3],
    };
  }

  updateElement(key, value) {
    const { onElementUpdate } = this.props;
    onElementUpdate({ [key]: value });
  }

  removeElement() {
    const { onElementUpdate } = this.props;
    onElementUpdate();
  }

  updateMultiple(options) {
    const { onElementUpdate } = this.props;
    onElementUpdate(options);
  }
}

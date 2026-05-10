/* eslint-disable no-underscore-dangle */
import Chroma from 'chroma-js';
import generateStyledCSS from './style-generators/styled-css-generator';
import generateSVGStyles from './style-generators/styled-svg-generator';

class WhiteLabelManager {
  _generateCSS() {
    if (!this.shouldOverride) {
      return '';
    }
    const { _whiteLabel: { _id, theme: { accent2Color: sourceColor = 'dimgray' } }, _cdn: cdn } = this;
    const brandLogo = `${cdn}/wl/${domain}/resources/vc_go_logo`;
    const baseColor = Chroma(sourceColor);
    const theme = {
      primaryColor: baseColor.css(),
      stageSelectColor: baseColor.darken(0.33).css(),
      phaseHighlightColor: baseColor.desaturate(1.5).brighten(0.8).css(),
    };
    return `${generateStyledCSS(_id, brandLogo, theme)}${generateSVGStyles(_id, theme)}`;
  }

  constructor(whiteLabel, shouldOverride, cdn) {
    this._whiteLabel = whiteLabel || {};
    this._cdn = cdn;
    this.shouldOverride = shouldOverride;

    Object.assign(this, {
      key: this._whiteLabel._id,
      domain: this._whiteLabel.domain,
      serviceName: this._whiteLabel.name,
      brandName: `${this._whiteLabel.name} ${
        (this._whiteLabel.go && this._whiteLabel.go.alternateName) ?
          this._whiteLabel.go.alternateName :
          'GO'
      }`,
      brandLogo: `${cdn}/wl/${this._whiteLabel.domain}/resources/vc_go_logo`,
      appName: (this._whiteLabel.go && this._whiteLabel.go.alternateName) ?
        this._whiteLabel.go.alternateName :
        'GO',
      termsOfServiceLink: this._whiteLabel.termsOfServiceLink,
      tutorialsLink: this._whiteLabel.go && this._whiteLabel.go.tutorialsLink,
      css: this._generateCSS(),
    });
  }
}

export default WhiteLabelManager;

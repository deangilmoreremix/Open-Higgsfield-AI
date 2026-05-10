/**
 * CampaignStager - Base class for campaign staging
 * Ported to modern JavaScript (ES6+)
 */

import { action, observable, runInAction } from 'mobx';
import { modalContent, isResolutionWrong } from '../../../lib/utils/cropHelper';
import { showError } from '../../../services/alertService';

const iframeStyling = `<!--- embed styling ---->
<style> 
  .iframe-container { position:relative; padding-bottom:56.25%; padding-top:30px; height:0; overflow:hidden; border:1px solid #ccc; }
  .iframe-container iframe,.iframe-container object,.iframe-container embed { position:absolute; top:0; left:0; width:100%; height:100%; }
</style>
<!--- End of embed styling ---->`;

const posterframeRecommendedResolution = {
  width: 1200,
  height: 630,
};

class CampaignStager {
  static PostPreview = null;

  static posterframeRecommendedResolutionPrompt = `${posterframeRecommendedResolution.width}x${posterframeRecommendedResolution.height}`;

  static generateStageComponent = (render) => {
    const StageComponent = (props) => {
      const [state, setState] = React.useState({});
      
      React.useEffect(() => {
        Object.assign(state, props, {
          onVariablesUpdated: (variables) => {
            setState(variables);
          },
        });
      }, []);

      return render(state);
    };

    StageComponent.propTypes = {
      project: PropTypes.any,
      variables: PropTypes.shape({
        embedLocation: PropTypes.shape({
          key: PropTypes.string.isRequired,
          label: PropTypes.string.isRequired,
          prompt: PropTypes.string,
          embedGenerator: PropTypes.func,
        }),
        embedPage: PropTypes.string,
        preload: PropTypes.bool,
        autoplay: PropTypes.bool,
        selectedFbPage: PropTypes.string,
        facebookPageTab: PropTypes.shape({
          id: PropTypes.string,
          name: PropTypes.string,
        }),
        postData: PropTypes.shape({
          link: PropTypes.string,
          title: PropTypes.string,
          thumbnail: PropTypes.string,
          description: PropTypes.string,
        }),
        userData: PropTypes.shape({
          name: PropTypes.string.isRequired,
          userpic: PropTypes.string.isRequired,
        }),
      }),
    };

    return StageComponent;
  };

  static EMBED_LOCATIONS = [
    {
      key: 'default',
      label: 'Post On Social Media',
    },
    {
      key: 'leadpages',
      label: 'Embed On Webpage',
      embedGenerator: (url, width, height) => `${iframeStyling} <div class="iframe-container"><iframe id='vr-${url.split('/').reverse()[0]}' src='${url}' width='${width}' height='${height}' frameborder='0' allow="autoplay; fullscreen" mozallowfullscreen webkitallowfullscreen allowfullscreen></iframe></div>`,
    },
  ];

  _stages = [];

  @observable
  state = {
    currentStageIndex: 0,
    preload: true,
    embedLocation: this.constructor.EMBED_LOCATIONS[0],
  };

  @observable isUploading = false;

  @observable extraModal = null;

  constructor(provider, project, api) {
    this.provider = provider;
    this.project = project;
    this.api = api;
  }

  async sharePost() {
    const { project } = this;
    return project;
  }

  @action
  uploadFile = callback => async ({ target: { files: [file] } }) => {
    const { api } = this;
    if (!file) return;
    
    if (file.type.indexOf('image/') === -1) {
      showError('This image format is not supported.');
      return;
    }
    
    this.isUploading = true;
    try {
      const media = await api.uploadMedia({ data: file });
      const imageMeta = await new MediaTypeDetector().getMetadata(media.url);
      
      if (isResolutionWrong({
        imageMeta,
        recommendedResolution: posterframeRecommendedResolution,
      })) {
        runInAction(() => {
          this.extraModal = modalContent({
            imageMeta,
            recommendedResolution: posterframeRecommendedResolution,
            onFileUploaded: (res) => {
              callback(res);
              this.extraModal = null;
            },
          });
        });
      } else {
        callback(imageMeta);
      }
    } catch (err) {
      showError(err.message || 'This image format is not supported.');
    } finally {
      this.isUploading = false;
    }
  };

  canBypassStage() {
    return true;
  }

  @action
  async nextStage() {
    if (this.currentStage.key === this._stages[this._stages.length - 1].key) {
      return this.sharePost();
    }

    const { currentStageIndex } = this.state;
    this.state.currentStageIndex = Math.min(currentStageIndex + 1, this._stages.length - 1);
    
    if (this._stages[this.state.currentStageIndex].bootstrap) {
      await this._stages[this.state.currentStageIndex].bootstrap(this);
    }
    
    return this._stages[this.state.currentStageIndex];
  }

  @action
  async prevStage() {
    const { currentStageIndex } = this.state;
    this.state.currentStageIndex = Math.max(currentStageIndex - 1, 0);
    
    if (this._stages[this.state.currentStageIndex].bootstrap) {
      await this._stages[this.state.currentStageIndex].bootstrap(this);
    }
    
    return this._stages[this.state.currentStageIndex];
  }

  @action
  async setStage(stageName) {
    const currentStage = this._stages[this.state.currentStageIndex];
    if (currentStage.key === stageName) return;
    
    const newStage = this._stages.find(item => item.key === stageName);
    this.state.currentStageIndex = this._stages.indexOf(newStage);
    
    if (newStage.bootstrap) {
      await newStage.bootstrap(this);
    }
    
    return newStage;
  }

  get embedLocations() {
    return this.constructor.EMBED_LOCATIONS;
  }

  get stages() {
    return this._stages;
  }

  get currentStage() {
    return this._stages[this.state ? this.state.currentStageIndex : 0];
  }

  get variables() {
    return this.state;
  }

  set variables(value) {
    this.state = value;
  }
}

export default CampaignStager;

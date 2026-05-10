/**
 * FacebookCampaignStager - Simplified port to modern JS
 */
import { action, observable } from 'mobx';
import CampaignStager from './CampaignStager';

const BACK_END_URL = 'https://api.vidcloud.io';
const MIN_FANS_PAGE = 2000;
const FB_PAGE_PERMISSIONS = 'public_profile,email,manage_pages,pages_show_list';
const DEFAULT_PERMISSIONS = 'public_profile,email';
const LABEL_TEXTAREA = 'Copy & Paste this embed code inside the custom HTML element';
const TITLE_FB = 'How Do You Want To Send Your Video?';

class FacebookCampaignStager extends CampaignStager {
  static PostPreview = null; // FacebookPostPreview

  static EMBED_LOCATIONS = [
    ...CampaignStager.EMBED_LOCATIONS.slice(0, CampaignStager.EMBED_LOCATIONS.length - 1),
    CampaignStager.EMBED_LOCATIONS[CampaignStager.EMBED_LOCATIONS.length - 1],
  ];

  _stages = [
    {
      key: 'embed-engine',
      completionPercentage: 25,
      element: this.constructor.generateStageComponent((state) => (
        <div className="embed-engine p-4">
          <h5 className="embed-title text-xl font-semibold mb-4">{TITLE_FB}</h5>
          <div className="embed-grid space-y-4">
            <div className="embed-group flex items-center gap-4">
              <label className="cell w-32" htmlFor="embed-location-select">Embed Location</label>
              <select
                className="cell flex-1 px-3 py-2 border border-gray-300 rounded"
                id="embed-location-select"
                value={state.variables.embedLocation.key}
                onChange={({ target: { value } }) => {
                  state.variables.embedLocation = this.constructor.EMBED_LOCATIONS.find(item => item.key === value);
                  state.onVariablesUpdated(state.variables);
                }}
              >
                {this.constructor.EMBED_LOCATIONS.map(({ key, label }) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div className="embed-group flex items-center gap-4">
              <label className="cell w-32" htmlFor="preload-check">Preload</label>
              <input
                className="cell"
                type="checkbox"
                id="preload-check"
                checked={state.variables.preload}
                onChange={({ target: { checked } }) => {
                  state.variables.preload = checked;
                  state.onVariablesUpdated(state.variables);
                }}
              />
            </div>
          </div>
          <div className={state.variables.embedLocation.embedGenerator ? 'embed-details mt-6' : 'hidden'}>
            <div className="embed-line mb-4">{state.variables.embedLocation.prompt}</div>
            <div className="mb-2 font-medium">{LABEL_TEXTAREA}</div>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded font-mono text-sm"
              rows={4}
              readOnly
              value={state.variables.embedLocation.embedGenerator
                ? state.variables.embedLocation.embedGenerator(
                    [
                      state.project.make.url,
                      [
                        state.variables.autoplay ? 'autoplay=1' : null,
                        !state.variables.preload ? 'preload=none' : null,
                      ].filter(item => !!item).join('&'),
                    ].join('?'),
                    560, 358
                  )
                : ''
              }
              onClick={({ target }) => target.select()}
            />
          </div>
        </div>
      )),
    },
    {
      key: 'embed-location',
      completionPercentage: 25,
      element: this.constructor.generateStageComponent((state) => (
        <div className="embed-location p-4">
          <h5 className="embed-title text-xl font-semibold mb-4">URL Link to your page with your embedded video</h5>
          <input
            type="text"
            className="embed-page-input w-full px-3 py-2 border border-gray-300 rounded"
            value={state.variables.embedPage}
            onChange={({ target: { value } }) => {
              state.variables.embedPage = value;
            }}
          />
          <div className="url-hint-container mt-2 text-sm text-gray-600">
            <div>*Must start with https:// or http://</div>
            <div><strong>Example:</strong> https://videoremix.io/example</div>
          </div>
        </div>
      )),
    },
    {
      key: 'facebook-login',
      completionPercentage: 50,
      element: this.constructor.generateStageComponent(() => (
        <div className="facebook-login p-4 text-center">
          <div className="login-note mb-4">
            <label>You must login to Facebook and authorize our app to post Videos into Facebook Pages</label>
          </div>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            onClick={async () => {
              try {
                await this.provider.logIn(FB_PAGE_PERMISSIONS);
                return this.nextStage();
              } catch (e) {
                return this.setStage('facebook-login');
              }
            }}
          >
            Log in with Facebook
          </button>
        </div>
      )),
      bootstrap: async (instance) => {
        await instance.provider.init();
        try {
          const permissions = FB_PAGE_PERMISSIONS;
          if (await instance.provider.isAuthorized(permissions)) {
            return instance.nextStage();
          }
          return instance.setStage('facebook-login');
        } catch (error) {
          alert(error.message);
          return instance.setStage('facebook-login');
        }
      },
    },
    // Additional stages would be defined here...
  ];

  @observable
  state = {
    currentStageIndex: 0,
    preload: true,
    facebookPages: [],
    embedLocation: this.constructor.EMBED_LOCATIONS[0],
    userData: {},
    postData: {},
  };

  async sharePost(api) {
    const { project } = this;
    const {
      autoplay,
      preload,
      embedLocation,
      selectedFbPage,
      embedPage,
      postData,
    } = this.state;

    const shareOptions = {
      shouldCreateTab: embedLocation.key === 'facebook-page',
    };
    
    // Simplified share logic
    project.name = postData.title;
    project.description = postData.description;
    project.thumbnail = postData.thumbnail;

    await api.publish(await api.save(project));
    await api.invalidateFbCache(project.make.url);

    return project;
  }
}

export default FacebookCampaignStager;

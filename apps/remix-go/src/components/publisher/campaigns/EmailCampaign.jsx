import React, { useState } from 'react';

const SKIP_VARS = ['GEOCOUNTRY', 'GEOCITY', 'GEOSTATE'];

const STAGES = [
  { key: 'embed-engine', completionPercentage: (1/3.0) * 100 },
  { key: 'embed-location', completionPercentage: (2/3.0) * 100 },
  { key: 'service-provider', completionPercentage: 100 },
];

const LABEL_TEXTAREA = 'Embed Code';
const TITLE_EMAIL_CAMPAIGN = 'How Do You Want To Send Your Video?';

const iframeStyling = `<!--- embed styling ---->
<style> 
  .iframe-container { position:relative; padding-bottom:56.25%; padding-top:30px; height:0; overflow:hidden; border:1px solid #ccc; }
  .iframe-container iframe,.iframe-container object,.iframe-container embed { position:absolute; top:0; left:0; width:100%; height:100%; }
</style>
<!--- End of embed styling ---->`;

const embedScript = url => `<script>var vars={};var tempstring='';var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value){if(value){tempstring+=key+'='+value+'&';}});if (tempstring) { if (document.getElementById('vr-${url.split('/').reverse()[0]}')) {document.getElementById('vr-${url.split('/').reverse()[0]}').src='${url}?'+tempstring.slice(0, -1);} else {document.addEventListener('DOMContentLoaded',function() {document.getElementById('vr-${url.split('/').reverse()[0]}').src='${url}?'+tempstring.slice(0, -1);});}}</script>\n\n`;

const iframeTag = (url, width, height) => `<div class="iframe-container"><iframe id='vr-${url.split('/').reverse()[0]}' src='${url}' width='${width}' height='${height}' frameborder='0' allow="autoplay; fullscreen" mozallowfullscreen webkitallowfullscreen allowfullscreen></iframe></div>`;

const EMBED_LOCATIONS = [
  {
    key: 'default',
    label: 'Send Via AutoResponder',
  },
  {
    key: 'leadpages',
    label: 'Embed & Send (Advanced)',
    embedGenerator: (url, width, height) => `${embedScript(url)}${iframeStyling}${iframeTag(url, width, height)}`,
  },
  {
    key: 'wordpress',
    label: 'Embed On WordPress & Send',
    embedGenerator: (url, width, height) => `${iframeStyling}${iframeTag(url, width, height)}`,
  },
];

const EMAIL_PROVIDERS = [
  {
    key: 'aweber',
    label: 'AWeber',
    image: '/images/publisher/email-campaign/aweber_hover.png',
    paramsBuilder: (personalizations) => {
      let result = '';
      const lookup = { GEOCOUNTRY: 'geog_country', IMAGE: 'custom image' };
      personalizations.forEach((personalization) => {
        const tempvar = lookup[personalization] || personalization.toLowerCase();
        if (result.split('&').map(keyPair => keyPair.split('=')[0]).indexOf(personalization) === -1) {
          result = `${result}${personalization}={!${tempvar}}&`;
        }
      });
      return result.slice(0, -1);
    },
  },
  {
    key: 'mailchimp',
    label: 'MailChimp',
    image: '/images/publisher/email-campaign/mailchimp_hover.png',
    paramsBuilder: (personalizations) => {
      let result = '';
      const lookup = { LASTNAME: 'LNAME', FIRSTNAME: 'FNAME', GEOCOUNTRY: 'Everywhere', IMAGE: 'IMAGE' };
      personalizations.forEach((personalization) => {
        const tempVar = lookup[personalization] || personalization;
        if (result.split('&').map(keyPair => keyPair.split('=')[0]).indexOf(personalization) === -1) {
          result = result + personalization + (tempVar !== 'Everywhere' ? `=*|${tempVar}|*&` : `=${tempVar}&`);
        }
      });
      return result.slice(0, -1);
    },
  },
  // Additional providers would be defined here...
];

const EmailCampaign = ({ project, onCampaignFinished, className }) => {
  const [currentStage, setCurrentStage] = useState(STAGES[0]);
  const [embedLocation, setEmbedLocation] = useState(EMBED_LOCATIONS[0]);
  const [preload, setPreload] = useState(true);
  const [autoplay, setAutoplay] = useState(false);
  const [embedPage, setEmbedPage] = useState('');
  const [emailProvider, setEmailProvider] = useState(null);

  const nextStage = () => {
    let nextStageIdx = Math.min(
      STAGES.findIndex(item => currentStage.key === item.key) + 1,
      STAGES.length - 1
    );
    if (STAGES[nextStageIdx].key === 'embed-location' && embedLocation.key === 'default') {
      nextStageIdx += 1;
    }
    setCurrentStage(STAGES[nextStageIdx]);
  };

  const prevStage = () => {
    let prevStageIdx = Math.max(
      STAGES.findIndex(item => currentStage.key === item.key) - 1,
      0
    );
    if (STAGES[prevStageIdx].key === 'embed-location' && embedLocation.key === 'default') {
      prevStageIdx -= 1;
    }
    setCurrentStage(STAGES[prevStageIdx]);
  };

  const generatePersonalizedLink = () => {
    let { personalizations } = project;
    const { autoplay: ap, preload: pl, embedLocation: el, emailProvider: ep } = { autoplay, preload, embedLocation, emailProvider };
    const basicPath = el.key === 'default' ? project.make.url : embedPage;
    personalizations = personalizations.filter(item => SKIP_VARS.indexOf(item) === -1);
    const providerParams = (ep && ep.paramsBuilder) ? ep.paramsBuilder(personalizations) : '';
    return [
      basicPath,
      [ap ? 'autoplay=1' : null, !pl ? 'preload=none' : null, providerParams].filter(item => !!item).join('&'),
    ].join('?');
  };

  const canBypassStage = (stage) => {
    const { embedPage: ep, emailProvider: ev } = { embedPage, emailProvider };
    switch (stage.key) {
      case 'embed-engine':
        return true;
      case 'embed-location':
        return ep && ep.length > 0;
      case 'service-provider':
        return ev;
      default:
        return false;
    }
  };

  return (
    <div className={`email-campaign ${className || ''}`}>
      <div className="workspace">
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
            style={{ width: `${currentStage.completionPercentage}%` }}
          />
        </div>
        
        <div className={currentStage.key !== 'embed-engine' ? 'hidden' : ''}>
          <h5 className="embed-title text-xl font-semibold mb-4">{TITLE_EMAIL_CAMPAIGN}</h5>
          <div className="embed-grid space-y-4">
            <div className="embed-group flex items-center gap-4">
              <label className="cell w-32" htmlFor="embed-location-select">Embed Location</label>
              <select
                className="cell flex-1 px-3 py-2 border border-gray-300 rounded"
                id="embed-location-select"
                value={embedLocation.key}
                onChange={({ target: { value } }) => setEmbedLocation(EMBED_LOCATIONS.find(item => item.key === value))}
              >
                {EMBED_LOCATIONS.map(({ key, label }, idx) => (
                  <option key={idx} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div className="embed-group flex items-center gap-4">
              <label className="cell w-32" htmlFor="preload-check">Preload</label>
              <input
                className="cell"
                type="checkbox"
                id="preload-check"
                checked={preload}
                onChange={({ target: { checked } }) => setPreload(checked)}
              />
            </div>
          </div>
          
          <div className={embedLocation.key === 'default' ? 'hidden' : 'embed-details mt-6'}>
            {embedLocation.key === 'wordpress' && (
              <span className="embed-line">
                Click here to install the <a href="https://cdn.vidcloud.io/wp/vr.zip">wp</a> plugin.
              </span>
            )}
            <span className="embed-line block mb-4">{embedLocation.prompt}</span>
            <div className="hint-container mb-4 p-4 bg-blue-50 rounded">
              <div className="hint-title font-semibold mb-2">Use this option to send your lead to a webpage with your personalized video on it. (Example: Salespage)</div>
              <div className="hint-steps space-y-1 text-sm">
                <div><strong>Step 1:</strong> Embed the code below on a web-page where you want the video</div>
                <div><strong>Step 2:</strong> Save changes on the web-page</div>
                <div><strong>Step 3:</strong> Click the Next button on this dialog box and enter your website/landing page URL</div>
              </div>
            </div>
            <div className="mb-2 font-medium">{LABEL_TEXTAREA}</div>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded font-mono text-sm"
              rows={4}
              readOnly
              value={embedLocation.embedGenerator ? embedLocation.embedGenerator(project.make.url, 560, 358) : ''}
              onClick={({ target }) => target.select()}
            />
          </div>
        </div>
        
        <div className={currentStage.key !== 'embed-location' ? 'hidden' : ''}>
          <h5 className="embed-title text-xl font-semibold mb-4">URL Link to your page with your embedded video</h5>
          <input
            type="text"
            className="embed-page-input w-full px-3 py-2 border border-gray-300 rounded"
            value={embedPage}
            onChange={({ target: { value } }) => setEmbedPage(value)}
          />
          <div className="url-hint-container mt-2 text-sm text-gray-600">
            <div>*Must start with https:// or http://</div>
            <div><strong>Example:</strong> https://videoremix.io/example</div>
          </div>
        </div>
        
        <div className={currentStage.key !== 'service-provider' ? 'hidden' : ''}>
          <ul className="service-provider-inner space-y-4">
            <li className="service-provider-step">
              <span className="block mb-2">Select your Email Service Provider</span>
              <ul className="providers-list flex gap-4">
                {EMAIL_PROVIDERS.map((item, idx) => (
                  <li
                    className={`provider-item cursor-pointer p-2 border-2 rounded ${emailProvider && emailProvider.key === item.key ? 'border-blue-500' : 'border-gray-300'}`}
                    key={idx}
                    onClick={() => setEmailProvider(item)}
                  >
                    <img src={item.image} alt={item.label} className="w-16 h-16" />
                  </li>
                ))}
              </ul>
            </li>
            {emailProvider && (
              <>
                <li className="service-provider-step">
                  <span>Copy & Paste this PersonalizedLink™ into your email campaign</span>
                  <input
                    className="personalized-link w-full px-3 py-2 border border-gray-300 rounded font-mono text-sm mt-2"
                    type="text"
                    value={generatePersonalizedLink()}
                    readOnly
                    onClick={({ target }) => target.select()}
                  />
                </li>
                <li className="service-provider-step">
                  <span>Send your Personalized email campaign</span>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
      
      <div className="controls flex justify-between mt-6">
        <button
          className={`px-4 py-2 rounded border border-gray-300 hover:bg-gray-50 ${currentStage.key === STAGES[0].key ? 'hidden' : ''}`}
          onClick={prevStage}
        >
          Back
        </button>
        <button
          className={`px-4 py-2 rounded text-white ml-auto ${
            canBypassStage(currentStage) ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
          }`}
          disabled={!canBypassStage(currentStage)}
          onClick={() => {
            if (!canBypassStage(currentStage)) return;
            if (currentStage.key === STAGES[STAGES.length - 1].key) {
              onCampaignFinished();
            } else {
              nextStage();
            }
          }}
        >
          {currentStage.key === STAGES[STAGES.length - 1].key ? 'Done' : 'Next'}
        </button>
      </div>
    </div>
  );
};

export default EmailCampaign;

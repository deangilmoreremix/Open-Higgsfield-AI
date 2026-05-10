import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../../stores/StoreProvider';

import FacebookCampaignStager from './campaign-stagers/FacebookCampaignStager';
import LinkedinCampaignStager from './campaign-stagers/LinkedinCampaignStager';

const SocialCampaign = ({ project, onCampaignFinished, onTitleUpdated, iframeConductor, className }) => {
  const store = useStore();
  const { api } = store;
  
  const socialSources = [
    {
      key: 'facebook',
      title: 'Facebook',
      image: '/images/publisher/social-campaign/facebook-logo.svg',
      loader: (props) => new FacebookCampaignStager(
        {
          conductor: iframeConductor,
          appId: '1728968890675795',
        },
        project,
        api
      ),
    },
    {
      key: 'linkedin',
      title: 'LinkedIn',
      image: '/images/publisher/social-campaign/linkedin-logo.png',
      loader: (props) => new LinkedinCampaignStager(
        {
          conductor: iframeConductor,
          clientId: '77dc93kxh13kfc',
        },
        project,
        api
      ),
    },
  ];

  const activeSocialSources = socialSources.filter(
    item => project.allowedSocials.indexOf(item.key) !== -1
  );

  const [stager, setStager] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useState(() => {
    if (activeSocialSources.length === 1) {
      setStager(activeSocialSources[0].loader({ iframeConductor, project, api }));
    }
  }, []);

  const sharePost = async () => {
    try {
      store.activeProject = await stager.sharePost(api);
      onCampaignFinished();
    } catch (error) {
      alert(error.message || 'Unable to post');
    }
  };

  const selectSocialSource = (key) => {
    const selectedSource = activeSocialSources.find(item => item.key === key);
    setStager(selectedSource.loader({ iframeConductor, project, api }));
    onTitleUpdated(`${selectedSource.title} Social Campaign`);
  };

  const handleBackButtonClick = async () => {
    if (isLoading) return;
    setIsLoading(true);
    await stager.prevStage();
    setIsLoading(false);
  };

  const handleNextButtonClick = async () => {
    if (!stager.canBypassStage(stager.currentStage)) return;
    setIsLoading(true);
    if (stager.currentStage.key === stager.stages[stager.stages.length - 1].key) {
      await sharePost();
    } else {
      await stager.nextStage();
    }
    setIsLoading(false);
  };

  const loading = isLoading || (stager && stager.isUploading);

  return (
    <div className={`social-campaign ${className || ''}`}>
      {loading && (
        <div className="loading-screen workspace flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}
      
      <div className={`workspace ${loading ? 'hidden' : ''}`}>
        {!stager && (
          <div className="social-source-container text-center">
            <span className="block mb-4">Please select social network you want to continue with</span>
            <ul className="social-source-list flex justify-center gap-4">
              {activeSocialSources.map(({ key, title, image }) => (
                <li
                  key={key}
                  className="social-source-list-item cursor-pointer p-4 border rounded hover:border-blue-500 transition-colors"
                  onClick={() => selectSocialSource(key)}
                >
                  <img src={image} alt={title} className="w-16 h-16" />
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {stager && !stager.extraModal && (
          <>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${stager.currentStage.completionPercentage}%` }}
              />
            </div>
            <stager.currentStage.element
              variables={stager.variables}
              project={project}
            />
          </>
        )}
      </div>
      
      {stager && !stager.extraModal && (
        <div className="controls flex justify-between mt-6">
          <button
            className={`px-4 py-2 rounded border border-gray-300 hover:bg-gray-50 ${
              stager.currentStage.key === stager.stages[0].key ? 'hidden' : ''
            }`}
            onClick={handleBackButtonClick}
          >
            Back
          </button>
          <button
            className={`px-4 py-2 rounded text-white ml-auto ${
              stager.canBypassStage(stager.currentStage) 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-gray-400 cursor-not-allowed'
            } ${stager.currentStage.actionButtonClassName || ''}`}
            disabled={!stager.canBypassStage(stager.currentStage)}
            onClick={handleNextButtonClick}
          >
            {stager.currentStage.actionButtonCaption || 'Next'}
          </button>
        </div>
      )}
      
      {stager && stager.extraModal && stager.extraModal.content}
    </div>
  );
};

export default observer(SocialCampaign);

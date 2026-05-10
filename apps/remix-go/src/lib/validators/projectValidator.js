const TEMPLATE_TARGETS = {
  text: ['text', 'linkUrl'],
  popup: ['text', 'linkUrl'],
  seethroughtext: ['text', 'linkUrl'],
  personalizedImage: ['src', 'linkSrc'],
  image: ['linkSrc'],
};

function getOverriddenTokens(projectData) {
  let tracks = [];
  let leadformTrackEvent;

  if (!projectData.media || !projectData.media.length) {
    return [];
  }
  projectData.media.forEach(({ tracks: projectTracks }) => {
    tracks = [...tracks, ...projectTracks];
  });

  tracks.some((track) => {
    leadformTrackEvent = track.trackEvents.find(trackEvent => trackEvent.type === 'form');
    return true;
  });

  if (!leadformTrackEvent) {
    return [];
  }

  const leadformTokens = leadformTrackEvent.popcornOptions.elements.map(({ token }) => token);

  const overriddenTokens = [];
  tracks.forEach((track) => {
    track.trackEvents.forEach((trackEvent) => {
      if (trackEvent.popcornOptions.start < leadformTrackEvent.popcornOptions.start) {
        (TEMPLATE_TARGETS[trackEvent.type] || []).forEach((handlebaredField) => {
          const values = (trackEvent.popcornOptions[handlebaredField]
            && trackEvent.popcornOptions[handlebaredField].match(/{{\s?[\w\s]*\s?}}/g)) || [];
          values.forEach((currentToken) => {
            leadformTokens.forEach((leadformToken) => {
              if (currentToken.indexOf(`{${leadformToken}}`) !== -1
                  || currentToken.indexOf(`"${leadformToken}"`) !== -1
                  || currentToken.indexOf(`'${leadformToken}'`) !== -1) {
                if (overriddenTokens.indexOf(leadformToken) === -1) {
                  overriddenTokens.push(leadformToken);
                }
              }
            });
          });
        });
      }
    });
  });

  return overriddenTokens || [];
}

export const formWarning = (projectData) => {
  if (!projectData) {
    return;
  }
  const tokens = getOverriddenTokens(projectData);
  if (!tokens.length) {
    return {};
  }
  return ({
    additionalData: tokens,
    text: 'Some form field tokens also appear in personalized elements before the form on the '
      + 'timeline. This could cause the matching form fields to to pre-populate during playback.'
      + ' The matching duplicated tokens are:\n',
  });
};

export const errMaxSize2mb = (file) => {
  const wrongSize = !!file && file.size > 2 * 1024 * 1024;
  if (wrongSize) {
    return ("Image size can't be more than 2 MB");
  }
};

export default {
  formWarning,
  errMaxSize2mb,
};

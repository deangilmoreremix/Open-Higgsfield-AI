import React, { useRef, useEffect, useCallback } from 'react';
import { observer } from 'mobx-react-lite';

const POSTMESSAGE_URL = 'https://cdn.vidcloud.io/v/playback_preview';

function EmbeddedPlayback({ source, playerUrl = POSTMESSAGE_URL, title, width = '100%', height = '400', className }) {
  const iframeRef = useRef(null);

  const preplayHandler = useCallback((event) => {
    const { source: frameConductor, data: { topic } } = event;
    if (topic !== 'preplay') return;

    frameConductor.postMessage({
      topic: 'preplay',
      config: {
        domain: 'vidcloud.io',
        serviceName: 'VidCloud',
        salesPage: '',
        privacyPolicyLink: '',
        hideSalesPage: true,
        hidePlaybackLogo: true,
        hideCopyButton: true,
        showExtendedEndroll: false,
        showShare: false,
        allowedSocials: [],
        thumbnail: source?.thumbnail,
        data: JSON.stringify(source?.popcornObject),
        title: source?.name
      },
    }, playerUrl);
  }, [source, playerUrl]);

  useEffect(() => {
    if (source && typeof window !== 'undefined') {
      window.addEventListener('message', preplayHandler);
      return () => window.removeEventListener('message', preplayHandler);
    }
  }, [source, preplayHandler]);

  const src = typeof source === 'string' ? source : `${playerUrl}?preplay=postMessage`;

  return (
    <iframe
      ref={iframeRef}
      className={className}
      title={title}
      src={src}
      width={width}
      height={height}
      frameBorder="0"
      allow="autoplay; fullscreen"
      mozallowfullscreen="true"
      webkitallowfullscreen="true"
      allowFullScreen
    />
  );
}

export default observer(EmbeddedPlayback);

import { useState, useEffect } from 'react';
import PersonalizerDialog from './PersonalizerDialog';

function readParams() {
  if (typeof window === 'undefined') return {};
  const sp = new URLSearchParams(window.location.search);
  return {
    appId: sp.get('app') || sp.get('appId') || undefined,
    mode: sp.get('mode') || undefined,
    initialTarget: sp.get('target') || sp.get('initialTarget') || undefined,
  };
}

export default function PersonalizerPage() {
  const [params] = useState(readParams);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    setOpen(true);
  }, []);

  const handleClose = () => {
    setOpen(false);
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.hash = '#/studio';
    }
  };

  return (
    <PersonalizerDialog
      open={open}
      onClose={handleClose}
      appId={params.appId || 'ai-video-agency'}
      mode={params.mode || 'cold-email'}
      initialTarget={params.initialTarget}
    />
  );
}

import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores/StoreProvider';
import Header from '../Header';
import Footer from '../Footer';

const PageFactory = (RootComponent, className) => {
  const PageComponent = observer(({ ...props }) => {
    const store = useStore();

    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header className={`theme-${store.whiteLabelManager?.key || 'default'}`} />
        <main className={`flex-1 ${className || ''}`}>
          <RootComponent {...props} />
        </main>
        <Footer
          className={`theme-${store.whiteLabelManager?.key || 'default'}`}
          serviceName={store.whiteLabelManager?.serviceName || 'VideoRemix Go'}
        />
      </div>
    );
  });

  PageComponent.displayName = `PageFactory(${RootComponent.displayName || RootComponent.name || 'Component'})`;
  return PageComponent;
};

export default PageFactory;

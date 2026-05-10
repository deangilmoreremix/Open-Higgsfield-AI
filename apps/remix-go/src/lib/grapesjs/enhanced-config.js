import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';

// Import all FREE official plugins
import grapesjsBlocksBasic from 'grapesjs-blocks-basic';
import grapesjsPresetWebpage from 'grapesjs-preset-webpage';
import grapesjsPresetNewsletter from 'grapesjs-preset-newsletter';
import grapesjsPluginForms from 'grapesjs-plugin-forms';

// Import VERIFIED FREE plugins only
import grapesjsNavbar from 'grapesjs-navbar';
import grapesjsLorySlider from 'grapesjs-lory-slider';

// Custom video integration
export const createVideoBlock = (editor) => {
  editor.BlockManager.add('sendspark-video', {
    label: 'Sendspark Video',
    category: 'Media',
    content: {
      type: 'video',
      attributes: {
        'data-sendspark-video': 'true',
        controls: true,
        preload: 'metadata'
      },
      style: {
        width: '100%',
        maxWidth: '640px',
        height: 'auto'
      }
    },
    attributes: {
      title: 'Add your Sendspark video here'
    }
  });
};

// Custom personalization blocks
export const createPersonalizationBlocks = (editor) => {
  editor.BlockManager.add('personalized-content', {
    label: 'Personalized Content',
    category: 'Personalization',
    content: {
      type: 'text',
      content: 'Hello {{user.name}}! Welcome to {{company.name}}.',
      attributes: {
        'data-personalized': 'true'
      }
    }
  });
};

// Enhanced video player with Sendspark integration
export const createSendsparkVideoPlayer = (editor) => {
  editor.DomComponents.addType('sendspark-video', {
    model: {
      defaults: {
        tagName: 'video',
        attributes: {
          'data-sendspark-video': 'true',
          controls: true,
          preload: 'metadata'
        },
        traits: [
          {
            type: 'text',
            label: 'Video URL',
            name: 'src',
            placeholder: 'Enter your Sendspark video URL'
          }
        ]
      }
    }
  });
};

// Complete GrapesJS configuration
export const createCompleteGrapesJSConfig = (containerId, options = {}) => {
  const defaultConfig = {
    container: containerId,
    height: '100vh',
    width: 'auto',
    plugins: [
      'grapesjs-blocks-basic',
      'grapesjs-preset-webpage',
      'grapesjs-preset-newsletter',
      'grapesjs-plugin-forms',
      grapesjsNavbar,
      grapesjsLorySlider
    ],
    pluginsOpts: {
      'grapesjs-blocks-basic': {
        blocks: ['column1', 'column2', 'column3', 'column4', 'text', 'link', 'image', 'video', 'map'],
        flexGrid: false
      },
      'grapesjs-preset-webpage': {
        blocks: []
      }
    },
    canvas: {
      styles: [
        'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
      ]
    }
  };

  return { ...defaultConfig, ...options };
};

// Initialize complete GrapesJS with all features
export const initializeCompleteGrapesJS = (containerId, options = {}) => {
  const config = createCompleteGrapesJSConfig(containerId, options);
  const editor = grapesjs.init(config);

  createVideoBlock(editor);
  createPersonalizationBlocks(editor);
  createSendsparkVideoPlayer(editor);

  return editor;
};

export default {
  initializeCompleteGrapesJS,
  createCompleteGrapesJSConfig,
  createVideoBlock,
  createPersonalizationBlocks,
  createSendsparkVideoPlayer
};

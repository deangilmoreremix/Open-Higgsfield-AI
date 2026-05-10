import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores/StoreProvider';

import ImageUpload from '../ImageUpload';

const recommendedResolution = {
  width: 1200,
  height: 630,
};

const ProjectDetailsChanger = ({ project, onChange, className }) => {
  const [title, setTitle] = useState(project.name);
  const [description, setDescription] = useState(project.description);
  const [thumbnail, setThumbnail] = useState(project.thumbnail);

  const isDataValid = () => {
    return title && title.length > 0;
  };

  const onValueChange = () => {
    project.name = title;
    project.description = description;
    project.thumbnail = thumbnail;
    onChange(project);
  };

  const onFileUploaded = (newThumbnail) => {
    setThumbnail(newThumbnail);
  };

  return (
    <div className={className || ''}>
      <div className="mb-4">
        <label htmlFor="project-details-title" className="block mb-2 font-medium">
          Project Title
        </label>
        <input
          id="project-details-title"
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="text"
          value={title}
          onChange={({ target: { value } }) => setTitle(value)}
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="project-details-description" className="block mb-2 font-medium">
          Project Description
        </label>
        <textarea
          id="project-details-description"
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          value={description}
          onChange={({ target: { value } }) => setDescription(value)}
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="project-details-thumbnail" className="block mb-2 font-medium">
          Project Thumbnail
        </label>
        <img
          id="project-details-thumbnail"
          src={thumbnail}
          alt="Project Posterframe"
          className="w-full max-w-md rounded mb-4"
        />
        <div className="flex items-center gap-4">
          <ImageUpload
            onFileUploaded={onFileUploaded}
            recommendedResolution={recommendedResolution}
          />
          <button
            className={`px-4 py-2 rounded text-white transition-colors ${
              isDataValid() ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
            }`}
            disabled={!isDataValid()}
            onClick={() => {
              if (isDataValid()) {
                onValueChange();
              }
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default observer(ProjectDetailsChanger);

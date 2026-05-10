import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../../stores/StoreProvider';

import EmbedDataContainer from '../EmbedDataContainer';

const SortableItem = ({ value }) => <li className="token-list-item p-2 bg-white border rounded mb-2">{value}</li>;

const RetargetCampaign = ({ project, onCampaignFinished, className }) => {
  const [personalizations, setPersonalizations] = useState([...project.personalizations]);
  const store = useStore();

  // Simple drag-and-drop reorder (simplified version without react-sortable-hoc)
  const moveItem = (fromIndex, toIndex) => {
    const updated = [...personalizations];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setPersonalizations(updated);
  };

  const embedCodeGenerator = (cdnUrl) => `<!-- Start of Vidcloud Embed Code -->
<script type="application/javascript">
  var tokens = '${personalizations.join(' ')}';
  window.addEventListener("load",function(){var f=tokens.split(" "),a=document.createElement("iframe");a.style.display="none";a.name="vidcloud-embed";a.src="${cdnUrl}/api/embed-helper";document.body.appendChild(a);var b=document.forms["undefined"!==typeof formName&&formName||0];b&&(a=function(){for(var a=[],c=0,d=0;d<b.elements.length;d++){var e=b.elements[d];"hidden"!==e.type&&e.value&&f.length>c&&(a.push(f[c]+"="+encodeURIComponent(e.value)),c++)}document["vidcloud-embed"].postMessage({personalizedString:a.join("&")},
      "${cdnUrl}");return!0},b.addEventListener("submit",a),b.addEventListener("click",a))});
</script>
<!-- End of Vidcloud Embed Code -->`;

  return (
    <div className={`retarget-campaign ${className || ''}`}>
      <div className="workspace">
        <ul className="steps-list space-y-6">
          <li className="list-step">
            <p className="list-step-caption mb-4">Make sure you have disabled `Allow Facebook` option at the previous step</p>
          </li>
          <li className="list-step">
            <p className="list-step-caption mb-4">Reorder personalized tokens by dragging as they defined at your form</p>
            <ul className="tokens-list space-y-2">
              {personalizations.map((value, index) => (
                <li 
                  key={index} 
                  className="p-2 bg-white border rounded mb-2 cursor-move hover:bg-gray-50"
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('text/plain', index)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                    moveItem(fromIndex, index);
                  }}
                >
                  {value}
                </li>
              ))}
            </ul>
          </li>
          <li className="list-step">
            <p className="list-step-caption mb-4">Copy & Paste this embed code inside the custom HTML element</p>
            <EmbedDataContainer
              className="embed-item"
              url={project.make.url}
              stringGenerator={() => embedCodeGenerator(store.common.cdnHostname)}
            />
          </li>
        </ul>
      </div>
      <div className="controls flex justify-end mt-6">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          onClick={() => onCampaignFinished()}
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default observer(RetargetCampaign);

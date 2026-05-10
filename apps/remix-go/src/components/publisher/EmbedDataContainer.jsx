import React, { useState } from 'react';

const iframeStyling = `<!--- embed styling ---->
<style> 
  .iframe-container { position:relative; padding-bottom:56.25%; padding-top:30px; height:0; overflow:hidden; border:1px solid #ccc; }
  .iframe-container iframe,.iframe-container object,.iframe-container embed { position:absolute; top:0; left:0; width:100%; height:100%; }
</style>
<!--- End of embed styling ---->`;

const defaultStringGenerator = (url, width, height) => (`${iframeStyling}\r<iframe id='vr-${url.split('/').reverse()[0]}' src='${url}' width='${width}' height='${height}' frameborder='0' allow="autoplay; fullscreen" mozallowfullscreen webkitallowfullscreen allowfullscreen></iframe>\r<script>var vars={};var tempstring='';var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value){if(value){tempstring+=key+'='+value+'&';}});if (tempstring) { if (document.getElementById('vr-${url.split('/').reverse()[0]}')) {document.getElementById('vr-${url.split('/').reverse()[0]}').src='${url}?'+tempstring.slice(0, -1);} else {document.addEventListener('DOMContentLoaded',function() {document.getElementById('vr-${url.split('/').reverse()[0]}').src='${url}?'+tempstring.slice(0, -1);});}}</script>`);

const EmbedDataContainer = ({ url, resizable = false, stringGenerator = defaultStringGenerator, label, className }) => {
  const [width, setWidth] = useState(560);
  const [height, setHeight] = useState(358);

  const embedCode = stringGenerator(url, width, height);

  return (
    <div className={className || ''}>
      {resizable && (
        <div className="flex items-center gap-2 mb-4">
          <span>Size</span>
          <span className="ml-auto flex items-center gap-2">
            <input
              type="text"
              className="w-20 px-2 py-1 border border-gray-300 rounded"
              value={height}
              onChange={({ target: { value } }) => setHeight(value)}
            />
            <span>X</span>
            <input
              type="text"
              className="w-20 px-2 py-1 border border-gray-300 rounded"
              value={width}
              onChange={({ target: { value } }) => setWidth(value)}
            />
          </span>
        </div>
      )}
      {label && <span className="embed-code-title block mb-2 font-semibold">{label}</span>}
      <textarea
        className="w-full px-3 py-2 border border-gray-300 rounded font-mono text-sm"
        readOnly
        rows={4}
        value={embedCode}
        onClick={({ target }) => target.select()}
      />
    </div>
  );
};

EmbedDataContainer.propTypes = {
  className: PropTypes.string,
  url: PropTypes.string.isRequired,
  resizable: PropTypes.bool,
  stringGenerator: PropTypes.func,
  label: PropTypes.string,
};

export default EmbedDataContainer;

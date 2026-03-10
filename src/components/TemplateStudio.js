import { getTemplateById } from '../lib/templates.js';
import { muapi } from '../lib/muapi.js';
import { AuthModal } from './AuthModal.js';
import { createUploadPicker } from './UploadPicker.js';
import { navigate } from '../lib/router.js';
import { getTemplateThumbnail, createThumbnailImg } from '../lib/thumbnails.js';

export function TemplateStudio(templateId) {
  const template = getTemplateById(templateId);
  const container = document.createElement('div');
  container.className = 'w-full h-full flex flex-col items-center bg-app-bg overflow-y-auto p-6 md:p-10';

  if (!template) {
    container.innerHTML = `<div class="flex-1 flex items-center justify-center text-secondary">Template not found</div>`;
    return container;
  }

  const backBtn = document.createElement('button');
  backBtn.className = 'self-start mb-6 flex items-center gap-2 text-secondary hover:text-white transition-colors text-sm font-medium';
  backBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg> Back to Templates';
  backBtn.onclick = () => navigate('templates');
  container.appendChild(backBtn);

  const header = document.createElement('div');
  header.className = 'flex flex-col items-center mb-8 animate-fade-in-up w-full max-w-lg';

  const thumbSrc = getTemplateThumbnail(template.id);
  const thumbWrapper = document.createElement('div');
  thumbWrapper.className = 'w-full h-48 md:h-64 rounded-2xl overflow-hidden mb-6 relative';
  thumbWrapper.innerHTML = '<div class="thumb-skeleton absolute inset-0"></div>';
  const thumbImg = createThumbnailImg(thumbSrc, template.name, 'w-full h-full object-cover object-top');
  thumbWrapper.appendChild(thumbImg);
  const thumbOverlay = document.createElement('div');
  thumbOverlay.className = 'absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent';
  thumbWrapper.appendChild(thumbOverlay);
  header.appendChild(thumbWrapper);

  const iconEl = document.createElement('div');
  iconEl.className = 'w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 mb-4 text-2xl -mt-10 relative z-10 backdrop-blur-sm';
  iconEl.textContent = template.icon;
  header.appendChild(iconEl);

  const titleEl = document.createElement('h1');
  titleEl.className = 'text-2xl md:text-4xl font-black text-white tracking-tight mb-2 text-center';
  titleEl.textContent = template.name;
  header.appendChild(titleEl);

  const descEl = document.createElement('p');
  descEl.className = 'text-secondary text-sm max-w-md text-center';
  descEl.textContent = template.description;
  header.appendChild(descEl);

  const badgeRow = document.createElement('div');
  badgeRow.className = 'flex gap-2 mt-3';
  const typeBadge = document.createElement('span');
  typeBadge.className = `text-[10px] font-bold px-2.5 py-1 rounded-full ${template.outputType === 'video' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-primary/10 text-primary border border-primary/20'}`;
  typeBadge.textContent = template.outputType === 'video' ? 'Video' : 'Image';
  const catBadge = document.createElement('span');
  catBadge.className = 'text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/5 text-secondary border border-white/10';
  catBadge.textContent = template.category;
  badgeRow.appendChild(typeBadge);
  badgeRow.appendChild(catBadge);
  header.appendChild(badgeRow);

  container.appendChild(header);

  const formCard = document.createElement('div');
  formCard.className = 'w-full max-w-lg bg-[#111]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col gap-5 animate-fade-in-up';
  formCard.style.animationDelay = '0.15s';

  const formState = {};
  let uploadedUrl = null;
  let pickerRef = null;

  template.inputs.forEach(input => {
    const fieldWrapper = document.createElement('div');
    fieldWrapper.className = 'flex flex-col gap-1.5';

    const label = document.createElement('label');
    label.className = 'text-xs font-bold text-secondary uppercase tracking-wider';
    label.textContent = input.label;
    fieldWrapper.appendChild(label);

    if (input.type === 'image') {
      const previewImg = document.createElement('img');
      previewImg.className = 'hidden w-full h-48 object-cover rounded-xl border border-white/10';

      const uploadLabel = document.createElement('span');
      uploadLabel.className = 'text-sm text-muted';
      uploadLabel.textContent = 'Click to upload an image';

      const clearBtn = document.createElement('button');
      clearBtn.type = 'button';
      clearBtn.className = 'hidden text-xs font-bold text-red-400 hover:text-red-300 transition-colors';
      clearBtn.textContent = 'Remove';

      const picker = createUploadPicker({
        anchorContainer: container,
        onSelect: ({ url }) => {
          uploadedUrl = url;
          formState[input.name] = url;
          previewImg.src = url;
          previewImg.classList.remove('hidden');
          uploadLabel.textContent = 'Image uploaded';
          clearBtn.classList.remove('hidden');
        },
        onClear: () => {
          uploadedUrl = null;
          formState[input.name] = null;
          previewImg.classList.add('hidden');
          previewImg.src = '';
          uploadLabel.textContent = 'Click to upload an image';
          clearBtn.classList.add('hidden');
        },
        onFilePreview: (file) => {
          const blobUrl = URL.createObjectURL(file);
          previewImg.src = blobUrl;
          previewImg.classList.remove('hidden');
          uploadLabel.textContent = file.name;
        },
      });
      pickerRef = picker;

      clearBtn.onclick = (e) => {
        e.stopPropagation();
        picker.reset();
        uploadedUrl = null;
        formState[input.name] = null;
        previewImg.classList.add('hidden');
        previewImg.src = '';
        uploadLabel.textContent = 'Click to upload an image';
        clearBtn.classList.add('hidden');
      };

      const uploadRow = document.createElement('div');
      uploadRow.className = 'flex items-center gap-3';
      uploadRow.appendChild(picker.trigger);
      uploadRow.appendChild(uploadLabel);
      uploadRow.appendChild(clearBtn);
      fieldWrapper.appendChild(uploadRow);
      fieldWrapper.appendChild(previewImg);
      container.appendChild(picker.panel);
    } else if (input.type === 'text' || input.type === 'textarea') {
      const el = document.createElement(input.type === 'textarea' ? 'textarea' : 'input');
      el.className = 'bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors';
      if (input.type === 'textarea') {
        el.rows = 3;
        el.className += ' resize-none';
      }
      el.placeholder = input.placeholder || '';
      el.oninput = () => { formState[input.name] = el.value; };
      fieldWrapper.appendChild(el);
    } else if (input.type === 'select') {
      const select = document.createElement('select');
      select.className = 'bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary/50 transition-colors appearance-none cursor-pointer';
      input.options.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt;
        option.textContent = opt;
        option.style.background = '#111';
        select.appendChild(option);
      });
      formState[input.name] = input.options[0];
      select.onchange = () => { formState[input.name] = select.value; };
      fieldWrapper.appendChild(select);
    }

    formCard.appendChild(fieldWrapper);
  });

  const genBtn = document.createElement('button');
  genBtn.className = 'w-full bg-primary text-black py-3.5 rounded-xl font-black text-sm hover:shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all mt-2';
  genBtn.textContent = 'Generate';
  formCard.appendChild(genBtn);
  container.appendChild(formCard);

  const resultArea = document.createElement('div');
  resultArea.className = 'w-full max-w-lg mt-6 hidden';
  container.appendChild(resultArea);

  genBtn.onclick = async () => {
    const apiKey = localStorage.getItem('muapi_key');
    if (!apiKey) {
      AuthModal(() => genBtn.click());
      return;
    }

    genBtn.disabled = true;
    genBtn.innerHTML = '<span class="animate-spin inline-block mr-2">&#9711;</span> Generating...';

    try {
      const params = { model: template.model, ...(template.defaultParams || {}) };

      if (template.aspectRatio) params.aspect_ratio = template.aspectRatio;

      template.inputs.forEach(input => {
        if (formState[input.name]) {
          params[input.name] = formState[input.name];
        }
      });

      if (template.basePrompt && params.prompt) {
        params.prompt = template.basePrompt.replace('{prompt}', params.prompt);
      } else if (template.basePrompt && !params.prompt) {
        params.prompt = template.basePrompt.replace('{prompt}', '');
      }

      let result;
      if (template.modelType === 'i2v') {
        result = await muapi.generateI2V(params);
      } else if (template.modelType === 'i2i') {
        result = await muapi.generateI2I(params);
      } else {
        result = await muapi.generateImage(params);
      }

      if (result && result.url) {
        showResult(result.url);
        saveToHistory(result.url, params.prompt || template.name);
      } else {
        throw new Error('No output URL returned');
      }
    } catch (err) {
      console.error('[TemplateStudio]', err);
      genBtn.textContent = `Error: ${err.message.slice(0, 40)}`;
      setTimeout(() => {
        genBtn.textContent = 'Generate';
        genBtn.disabled = false;
      }, 3000);
      return;
    }

    genBtn.disabled = false;
    genBtn.textContent = 'Generate';
  };

  function showResult(url) {
    resultArea.classList.remove('hidden');
    resultArea.innerHTML = '';

    const card = document.createElement('div');
    card.className = 'bg-[#111]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 animate-fade-in-up';

    if (template.outputType === 'video') {
      const video = document.createElement('video');
      video.src = url;
      video.controls = true;
      video.autoplay = true;
      video.loop = true;
      video.className = 'w-full rounded-xl';
      card.appendChild(video);
    } else {
      const img = document.createElement('img');
      img.src = url;
      img.className = 'w-full rounded-xl';
      card.appendChild(img);
    }

    const actions = document.createElement('div');
    actions.className = 'flex gap-3 mt-4';

    const dlBtn = document.createElement('a');
    dlBtn.href = url;
    dlBtn.download = `${template.id}-${Date.now()}`;
    dlBtn.className = 'flex-1 bg-primary text-black py-2.5 rounded-xl font-bold text-sm text-center hover:shadow-glow transition-all';
    dlBtn.textContent = 'Download';

    const againBtn = document.createElement('button');
    againBtn.className = 'flex-1 bg-white/10 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-white/20 transition-all';
    againBtn.textContent = 'Generate Again';
    againBtn.onclick = () => genBtn.click();

    actions.appendChild(dlBtn);
    actions.appendChild(againBtn);
    card.appendChild(actions);
    resultArea.appendChild(card);
  }

  function saveToHistory(url, prompt) {
    try {
      const history = JSON.parse(localStorage.getItem('muapi_history') || '[]');
      history.unshift({
        id: Date.now().toString(),
        url,
        prompt,
        model: template.model,
        template: template.id,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem('muapi_history', JSON.stringify(history.slice(0, 100)));
    } catch (e) { /* ignore */ }
  }

  return container;
}

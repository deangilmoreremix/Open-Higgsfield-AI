// AI Influencer Generator - Frontend JavaScript

let generatedImage = null;
let generatedAudio = null;

// DOM Elements
const generateBtn = document.getElementById('generate-btn');
const generateVoiceBtn = document.getElementById('generate-voice');
const animateBtn = document.getElementById('animate-btn');
const loadingOverlay = document.getElementById('loading');
const imagePreview = document.getElementById('image-preview');
const downloadImageBtn = document.getElementById('download-image');
const audioPreview = document.getElementById('audio-preview');
const audioPlayer = document.getElementById('audio-player');
const downloadAudioBtn = document.getElementById('download-audio');
const videoPreview = document.getElementById('video-preview');
const videoPlayer = document.getElementById('video-player');
const downloadVideoBtn = document.getElementById('download-video');
const gallery = document.getElementById('gallery');

// Show loading overlay
function showLoading() {
    loadingOverlay.classList.remove('hidden');
}

// Hide loading overlay
function hideLoading() {
    loadingOverlay.classList.add('hidden');
}

// Display notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg ${type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white z-50`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Generate influencer image
generateBtn.addEventListener('click', async () => {
    const prompt = document.getElementById('prompt').value.trim();
    const style = document.getElementById('style').value;
    
    if (!prompt) {
        showNotification('Please enter a character description', 'error');
        return;
    }
    
    showLoading();
    
    try {
        const response = await fetch('/api/generate-influencer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, style })
        });
        
        const data = await response.json();
        
        if (data.success) {
            generatedImage = data.image_url;
            imagePreview.innerHTML = `<img src="${data.image_url}" class="max-h-full max-w-full object-contain" alt="Generated influencer">`;
            downloadImageBtn.classList.remove('hidden');
            animateBtn.disabled = false;
            addToGallery(data.image_url);
            showNotification('Image generated successfully!');
        } else {
            showNotification(data.error || 'Failed to generate image', 'error');
        }
    } catch (error) {
        showNotification('Error: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
});

// Generate voiceover
generateVoiceBtn.addEventListener('click', async () => {
    const script = document.getElementById('script').value.trim();
    const language = document.getElementById('language').value;
    const accent = document.getElementById('accent').value;
    
    if (!script) {
        showNotification('Please enter a script', 'error');
        return;
    }
    
    showLoading();
    
    try {
        const response = await fetch('/api/generate-voice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ script, language, accent })
        });
        
        const data = await response.json();
        
        if (data.success) {
            generatedAudio = data.audio_url;
            audioPlayer.src = data.audio_url;
            audioPreview.classList.remove('hidden');
            downloadAudioBtn.classList.remove('hidden');
            showNotification('Voice generated successfully!');
        } else {
            showNotification(data.error || 'Failed to generate voice', 'error');
        }
    } catch (error) {
        showNotification('Error: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
});

// Create animation
animateBtn.addEventListener('click', async () => {
    if (!generatedImage || !generatedAudio) {
        showNotification('Please generate both image and audio first', 'error');
        return;
    }
    
    showLoading();
    
    try {
        const response = await fetch('/api/animate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_url: generatedImage, audio_url: generatedAudio })
        });
        
        const data = await response.json();
        
        if (data.success) {
            videoPlayer.src = data.video_url;
            videoPreview.classList.remove('hidden');
            downloadVideoBtn.classList.remove('hidden');
            showNotification('Video created successfully!');
        } else {
            showNotification(data.error || 'Failed to create animation', 'error');
        }
    } catch (error) {
        showNotification('Error: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
});

// Download handlers
downloadImageBtn.addEventListener('click', () => {
    if (generatedImage) {
        window.open(generatedImage, '_blank');
    }
});

downloadAudioBtn.addEventListener('click', () => {
    if (generatedAudio) {
        window.open(generatedAudio, '_blank');
    }
});

downloadVideoBtn.addEventListener('click', () => {
    const videoSrc = videoPlayer.src;
    if (videoSrc) {
        window.open(videoSrc, '_blank');
    }
});

// Add to gallery
function addToGallery(imageUrl) {
    const emptyMsg = gallery.querySelector('p.text-gray-500');
    if (emptyMsg) emptyMsg.remove();
    
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.innerHTML = `
        <img src="${imageUrl}" alt="Generated influencer">
        <button onclick="useFromGallery('${imageUrl}')" class="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 flex items-center justify-center text-white">
            Use
        </button>
    `;
    gallery.prepend(item);
}

// Use from gallery
window.useFromGallery = function(imageUrl) {
    generatedImage = imageUrl;
    imagePreview.innerHTML = `<img src="${imageUrl}" class="max-h-full max-w-full object-contain" alt="Selected influencer">`;
    downloadImageBtn.classList.remove('hidden');
    animateBtn.disabled = false;
};

// Check API status on load
window.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/api/status');
        const data = await response.json();
        console.log('API Status:', data);
    } catch (error) {
        console.log('API not available (expected in demo mode)');
    }
});
const STORAGE_KEY = 'muapi_uploads';
const MAX_UPLOADS = 20;

export function getUploadHistory() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
        return [];
    }
}

export function saveUpload({ id, name, uploadedUrl, thumbnail, timestamp }) {
    const history = getUploadHistory();
    history.unshift({ id, name, uploadedUrl, thumbnail, timestamp });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, MAX_UPLOADS)));
}

export function removeUpload(id) {
    const history = getUploadHistory().filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export async function generateThumbnail(file) {
    if (file.type.startsWith('video/')) {
        return generateVideoThumbnail(file);
    }
    return new Promise((resolve) => {
        const objectUrl = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            const SIZE = 80;
            const canvas = document.createElement('canvas');
            canvas.width = SIZE;
            canvas.height = SIZE;
            const ctx = canvas.getContext('2d');
            const size = Math.min(img.width, img.height);
            const sx = (img.width - size) / 2;
            const sy = (img.height - size) / 2;
            ctx.drawImage(img, sx, sy, size, size, 0, 0, SIZE, SIZE);
            URL.revokeObjectURL(objectUrl);
            resolve(canvas.toDataURL('image/jpeg', 0.6));
        };
        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            resolve(null);
        };
        img.src = objectUrl;
    });
}

export function generateVideoThumbnail(file) {
    return new Promise((resolve) => {
        const objectUrl = URL.createObjectURL(file);
        const video = document.createElement('video');
        video.muted = true;
        video.playsInline = true;
        video.preload = 'metadata';

        video.onloadeddata = () => {
            video.currentTime = Math.min(1, video.duration / 4);
        };

        video.onseeked = () => {
            const SIZE = 80;
            const canvas = document.createElement('canvas');
            canvas.width = SIZE;
            canvas.height = SIZE;
            const ctx = canvas.getContext('2d');
            const vw = video.videoWidth;
            const vh = video.videoHeight;
            const size = Math.min(vw, vh);
            const sx = (vw - size) / 2;
            const sy = (vh - size) / 2;
            ctx.drawImage(video, sx, sy, size, size, 0, 0, SIZE, SIZE);

            const playIcon = SIZE / 3;
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.beginPath();
            ctx.arc(SIZE / 2, SIZE / 2, playIcon / 2 + 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'white';
            ctx.beginPath();
            const cx = SIZE / 2 + 2;
            const cy = SIZE / 2;
            ctx.moveTo(cx - 6, cy - 8);
            ctx.lineTo(cx + 8, cy);
            ctx.lineTo(cx - 6, cy + 8);
            ctx.closePath();
            ctx.fill();

            URL.revokeObjectURL(objectUrl);
            resolve(canvas.toDataURL('image/jpeg', 0.6));
        };

        video.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            resolve(null);
        };

        video.src = objectUrl;
    });
}

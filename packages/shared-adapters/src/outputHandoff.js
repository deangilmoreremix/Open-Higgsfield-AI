import { getClient } from './supabaseAdapter.js';

export async function saveToLibrary(url, type, metadata = {}) {
    const client = getClient();
    const { data: { user } } = await client.auth.getUser();
    if (!user) throw new Error('User must be authenticated to save to library');

    const filename = url.split('/').pop() || `file-${Date.now()}`;
    const storagePath = `${user.id}/${type}s/${filename}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch file for upload');
    const blob = await response.blob();

    const { error: uploadError } = await client.storage
        .from('library')
        .upload(storagePath, blob, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: publicUrl } = client.storage
        .from('library')
        .getPublicUrl(storagePath);

    const { error: dbError } = await client
        .from('library_items')
        .insert({
            user_id: user.id,
            type,
            url: publicUrl.publicUrl,
            storage_path: storagePath,
            filename,
            metadata,
            created_at: new Date().toISOString(),
        });

    if (dbError) throw dbError;

    return publicUrl.publicUrl;
}

export function downloadFile(url, filename) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || url.split('/').pop() || 'download';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

export async function shareFile(url, title = 'Shared from Higgsfield') {
    if (navigator.share) {
        try {
            await navigator.share({ title, url });
            return true;
        } catch {
            return false;
        }
    }
    return false;
}

export async function copyToClipboard(text) {
    if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        return true;
    }
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    return true;
}

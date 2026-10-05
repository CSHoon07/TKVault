import { getIdToken } from 'firebase/auth';
import { auth } from './firebase';

let requestSequence = 0;

function postToAppsScript(endpoint, payload) {
  return new Promise((resolve, reject) => {
    const requestId = `tkvault-drive-${Date.now()}-${requestSequence += 1}`;
    const iframe = document.createElement('iframe');
    const form = document.createElement('form');
    const input = document.createElement('input');
    let timeoutId;

    iframe.name = requestId;
    iframe.hidden = true;
    form.action = endpoint;
    form.method = 'post';
    form.target = requestId;
    form.hidden = true;
    input.type = 'hidden';
    input.name = 'payload';
    input.value = JSON.stringify({ ...payload, requestId });
    form.append(input);

    const cleanup = () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener('message', handleMessage);
      form.remove();
      iframe.remove();
    };

    const handleMessage = (event) => {
      if (event.source !== iframe.contentWindow || event.data?.requestId !== requestId) return;
      cleanup();
      if (!event.data.ok) {
        reject(new Error(event.data.error || 'Google Drive request failed.'));
        return;
      }
      resolve(event.data.result);
    };

    window.addEventListener('message', handleMessage);
    timeoutId = window.setTimeout(() => {
      cleanup();
      reject(new Error('Google Drive did not respond. Check the Apps Script deployment and try again.'));
    }, 120000);
    document.body.append(iframe, form);
    form.submit();
  });
}

async function sendDriveRequest(endpoint, request) {
  if (!endpoint) throw new Error('Google Drive storage has not been configured by the administrator yet.');
  if (!auth.currentUser) throw new Error('Sign in again before accessing shared Drive files.');
  const idToken = await getIdToken(auth.currentUser);
  return postToAppsScript(endpoint, { ...request, idToken });
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      resolve(dataUrl.slice(dataUrl.indexOf(',') + 1));
    };
    reader.onerror = () => reject(reader.error || new Error('Unable to read this file.'));
    reader.readAsDataURL(file);
  });
}

export async function uploadDriveFile(endpoint, group, category, file, replaceDriveId = '') {
  if (file.size > 25 * 1024 * 1024) {
    throw new Error('Files must be 25 MB or smaller to upload to shared Google Drive storage.');
  }
  const base64 = file.dataUrl
    ? file.dataUrl.slice(file.dataUrl.indexOf(',') + 1)
    : await fileToBase64(file);
  return sendDriveRequest(endpoint, {
    action: 'upload',
    group,
    category,
    name: file.name,
    mimeType: file.type || 'application/octet-stream',
    base64,
    replaceDriveId,
  });
}

export async function updateDriveFile(endpoint, group, category, driveId, action, name) {
  return sendDriveRequest(endpoint, { action, group, category, driveId, name });
}

export async function downloadDriveFile(endpoint, group, category, driveId) {
  return sendDriveRequest(endpoint, { action: 'download', group, category, driveId });
}

export function base64ToBlob(base64, mimeType) {
  const binary = atob(base64);
  const chunks = [];
  const chunkSize = 1024 * 1024;
  for (let offset = 0; offset < binary.length; offset += chunkSize) {
    const end = Math.min(offset + chunkSize, binary.length);
    const bytes = new Uint8Array(end - offset);
    for (let index = offset; index < end; index += 1) {
      bytes[index - offset] = binary.charCodeAt(index);
    }
    chunks.push(bytes);
  }
  return new Blob(chunks, { type: mimeType || 'application/octet-stream' });
}

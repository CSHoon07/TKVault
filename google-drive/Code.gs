const PROJECT_ID = 'tkvault-c6263';
const ADMIN_EMAIL = 'tkdvofinance@gmail.com';
const API_KEY = 'AIzaSyCqdPr23F_QRPEdhjKtcIAP2ugXIK2boN4';
const GROUPS = [
  'Buhangin', 'Bunawan', 'Calinan', 'Indangan', 'JP Laurel', 'Mandug',
  'Marilog', 'Mintal', 'Panacan', 'Ponciano', 'Samal', 'Sandawa', 'Toril', 'Mentors',
];
const CATEGORIES = {
  report: 'Liquidation Reports',
  receipt: 'Receipts',
};
const MAX_FILE_BYTES = 25 * 1024 * 1024;

function doPost(event) {
  let request = {};
  try {
    request = JSON.parse(event.parameter.payload || '{}');
    const user = authenticateUser(request.idToken, request.group);
    const result = handleRequest(request, user);
    return respond({ requestId: request.requestId, ok: true, result });
  } catch (error) {
    return respond({
      requestId: request.requestId || '',
      ok: false,
      error: error.message || 'Google Drive request failed.',
    });
  }
}

function respond(message) {
  const serialized = JSON.stringify(message).replace(/</g, '\\u003c');
  const html = '<!doctype html><meta charset="utf-8"><script>' +
    'window.parent.postMessage(' + serialized + ', "*");</script>';
  return HtmlService.createHtmlOutput(html)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function authenticateUser(idToken, group) {
  if (!idToken || !GROUPS.includes(group)) {
    throw new Error('Sign-in or group information is invalid. Sign in again and retry.');
  }

  const response = UrlFetchApp.fetch(
    'https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' + encodeURIComponent(API_KEY),
    {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({ idToken: idToken }),
      muteHttpExceptions: true,
    },
  );
  const status = response.getResponseCode();
  const identityResult = JSON.parse(response.getContentText() || '{}');
  const identity = identityResult.users && identityResult.users[0];
  if (status !== 200 || !identity || !identity.email) {
    throw new Error('Your Firebase sign-in expired or is invalid. Sign in again and retry.');
  }

  const email = identity.email.toLowerCase();
  if (email === ADMIN_EMAIL) return { email: email, role: 'administrator' };

  const profileResponse = UrlFetchApp.fetch(
    'https://firestore.googleapis.com/v1/projects/' + PROJECT_ID +
      '/databases/(default)/documents/userProfiles/' + encodeURIComponent(identity.localId),
    {
      method: 'get',
      headers: { Authorization: 'Bearer ' + idToken },
      muteHttpExceptions: true,
    },
  );
  if (profileResponse.getResponseCode() !== 200) {
    throw new Error('This account cannot access shared Drive files.');
  }
  const profile = JSON.parse(profileResponse.getContentText());
  const fields = profile.fields || {};
  const role = fields.role && fields.role.stringValue;
  const statusValue = fields.status && fields.status.stringValue;
  const accountGroup = fields.group && fields.group.stringValue;
  if (role !== 'group' || statusValue !== 'active' || accountGroup !== group) {
    throw new Error('Your account is not an approved member of this group.');
  }
  return { email: email, role: 'group', group: accountGroup };
}

function handleRequest(request, user) {
  const categoryName = CATEGORIES[request.category];
  if (!categoryName) throw new Error('File category is invalid.');
  if (user.role !== 'administrator' && user.group !== request.group) {
    throw new Error('You do not have access to this group’s Drive files.');
  }

  const folder = getCategoryFolder(request.group, categoryName);
  if (request.action === 'upload') return uploadFile(request, folder);
  if (request.action === 'download') return downloadFile(request, folder);
  if (request.action === 'rename') return renameFile(request, folder);
  if (request.action === 'delete') return deleteFile(request, folder);
  throw new Error('Unsupported Google Drive operation.');
}

function getCategoryFolder(group, categoryName) {
  const root = getOrCreateFolder(DriveApp.getRootFolder(), 'TKVault');
  const groupFolder = getOrCreateFolder(root, group);
  return getOrCreateFolder(groupFolder, categoryName);
}

function getOrCreateFolder(parent, name) {
  const folders = parent.getFoldersByName(name);
  return folders.hasNext() ? folders.next() : parent.createFolder(name);
}

function uploadFile(request, folder) {
  if (!request.name || !request.base64) throw new Error('Choose a file to upload.');
  const bytes = Utilities.base64Decode(request.base64);
  if (bytes.length > MAX_FILE_BYTES) throw new Error('Files must be 25 MB or smaller.');

  const oldFile = request.replaceDriveId
    ? getFileInFolder(request.replaceDriveId, folder)
    : null;
  const file = folder.createFile(Utilities.newBlob(
    bytes,
    request.mimeType || 'application/octet-stream',
    sanitizeName(request.name),
  ));
  if (oldFile) {
    try {
      oldFile.setTrashed(true);
    } catch (error) {
      file.setTrashed(true);
      throw new Error('The replacement was uploaded but the previous Drive file could not be removed.');
    }
  }
  return {
    driveId: file.getId(),
    name: file.getName(),
    size: file.getSize(),
    type: file.getMimeType(),
  };
}

function downloadFile(request, folder) {
  const file = getFileInFolder(request.driveId, folder);
  return {
    name: file.getName(),
    size: file.getSize(),
    type: file.getMimeType(),
    base64: Utilities.base64Encode(file.getBlob().getBytes()),
  };
}

function renameFile(request, folder) {
  const file = getFileInFolder(request.driveId, folder);
  file.setName(sanitizeName(request.name));
  return { driveId: file.getId(), name: file.getName() };
}

function deleteFile(request, folder) {
  getFileInFolder(request.driveId, folder).setTrashed(true);
  return { driveId: request.driveId };
}

function getFileInFolder(driveId, folder) {
  if (!driveId) throw new Error('The Drive file ID is missing.');
  const file = DriveApp.getFileById(driveId);
  const parents = file.getParents();
  while (parents.hasNext()) {
    if (parents.next().getId() === folder.getId()) return file;
  }
  throw new Error('The requested file is not in this group’s Drive folder.');
}

function sanitizeName(name) {
  const cleanName = String(name || '').replace(/[\u0000-\u001f\u007f]/g, '').trim();
  if (!cleanName || cleanName.length > 180) {
    throw new Error('File names must be between 1 and 180 characters.');
  }
  return cleanName;
}

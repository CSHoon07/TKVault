import { initializeApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  deleteUser,
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  onSnapshot,
  query,
  runTransaction,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCqdPr23F_QRPEdhjKtcIAP2ugXIK2boN4',
  authDomain: 'tkvault-c6263.firebaseapp.com',
  projectId: 'tkvault-c6263',
  appId: '1:737813050801:web:331304b84270fa420ff990',
};

export const ADMIN_EMAIL = 'tkdvofinance@gmail.com';
const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);

const stableStringify = (value) => {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
};

export async function getAccountForUser(user) {
  const email = (user.email || '').toLowerCase();
  if (email === ADMIN_EMAIL) {
    return { uid: user.uid, email, username: email, role: 'administrator', name: 'Administrator' };
  }
  const profile = await getDoc(doc(db, 'userProfiles', user.uid));
  if (!profile.exists()) throw new Error('This account has no TKVault group profile. Contact the administrator.');
  const data = profile.data();
  if (data.status !== 'active') throw new Error(data.status === 'rejected'
    ? 'This account was not approved. Contact the administrator.'
    : 'Your account is waiting for administrator approval.');
  return { uid: user.uid, email, username: email, role: 'group', name: data.name, group: data.group };
}

export async function signInAccount(email, password) {
  const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
  return getAccountForUser(credential.user);
}

export async function createGroupAccount({ name, email, password, group }) {
  if (email.trim().toLowerCase() === ADMIN_EMAIL) throw new Error('This administrator account is managed separately.');
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
  try {
    await setDoc(doc(db, 'userProfiles', credential.user.uid), {
      name: name.trim(),
      email: credential.user.email,
      role: 'group',
      group,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    await deleteUser(credential.user);
    throw error;
  }
  await signOut(auth);
  throw new Error('Your account was created and is waiting for administrator approval.');
}

export async function signOutAccount() {
  await signOut(auth);
}

export async function changeAccountPassword(password) {
  if (!auth.currentUser) throw new Error('You are signed out. Sign in again before changing your password.');
  await updatePassword(auth.currentUser, password);
}

export function watchGroupRecords(group, recordType, onRecords, onError) {
  return onSnapshot(
    collection(db, 'groups', group, recordType),
    { includeMetadataChanges: true },
    (snapshot) => onRecords(snapshot.docs.map((item) => item.data()), snapshot.metadata.fromCache),
    onError,
  );
}

export async function syncGroupRecords(group, recordType, records, baselineRecords = new Map()) {
  const recordsRef = collection(db, 'groups', group, recordType);
  const savedSnapshot = await getDocs(recordsRef);
  const wanted = new Map(records.map((item) => [String(item.id), JSON.parse(JSON.stringify(item))]));
  const existing = new Map(savedSnapshot.docs.map((item) => [item.id, item.data()]));
  const operations = [];

  for (const [id, data] of wanted) {
    const baseline = baselineRecords.get(id);
    const current = existing.get(id);
    if (!baseline && !current) {
      operations.push({ type: 'set', id, data });
    } else if (baseline && stableStringify(baseline) !== stableStringify(data)) {
      if (!current || stableStringify(current) === stableStringify(baseline)) {
        operations.push({ type: 'set', id, data });
      }
    }
  }
  for (const [id, baseline] of baselineRecords) {
    const current = existing.get(id);
    if (!wanted.has(id) && current && stableStringify(current) === stableStringify(baseline)) {
      operations.push({ type: 'delete', id });
    }
  }

  for (let index = 0; index < operations.length; index += 400) {
    const batch = writeBatch(db);
    for (const operation of operations.slice(index, index + 400)) {
      const recordRef = doc(recordsRef, operation.id);
      if (operation.type === 'set') batch.set(recordRef, operation.data);
      else batch.delete(recordRef);
    }
    await batch.commit();
  }
}

export async function setGroupMetadata(group, metadata) {
  const metadataRef = doc(db, 'groups', group, 'settings', 'main');
  const next = JSON.parse(JSON.stringify(metadata));
  const current = await getDoc(metadataRef);
  if (current.exists() && stableStringify(current.data()) === stableStringify(next)) return;
  await writeBatch(db).set(metadataRef, next).commit();
}

export function watchGroupMetadata(group, onMetadata, onError) {
  return onSnapshot(
    doc(db, 'groups', group, 'settings', 'main'),
    { includeMetadataChanges: true },
    (snapshot) => onMetadata(snapshot.exists() ? snapshot.data() : null, snapshot.metadata.fromCache),
    onError,
  );
}

export async function saveEventOptions(options) {
  await setDoc(doc(db, 'appSettings', 'eventOptions'), { options });
}

export function watchEventOptions(onOptions, onError) {
  return onSnapshot(
    doc(db, 'appSettings', 'eventOptions'),
    { includeMetadataChanges: true },
    (snapshot) => onOptions(snapshot.exists() ? snapshot.data().options : null, snapshot.metadata.fromCache),
    onError,
  );
}

export async function claimWeeklyDues(group, dateKey, weeklyRates) {
  const claimRef = doc(db, 'groups', group, 'settings', `weekly-dues-${dateKey}`);
  const memberSnapshot = await getDocs(collection(db, 'groups', group, 'members'));
  if (memberSnapshot.size > 499) {
    throw new Error('Weekly dues could not be applied: this group has too many members for one atomic update.');
  }

  return runTransaction(db, async (transaction) => {
    const current = await transaction.get(claimRef);
    if (current.exists()) return false;
    const members = [];
    for (const member of memberSnapshot.docs) {
      members.push({ ref: member.ref, snapshot: await transaction.get(member.ref) });
    }

    transaction.set(claimRef, { appliedAt: new Date().toISOString() });
    members.forEach(({ ref, snapshot }) => {
      if (!snapshot.exists()) return;
      const member = snapshot.data();
      const status = member.status || 'Unemployed';
      const weeklyRate = weeklyRates[status] || weeklyRates.Unemployed;
      transaction.update(ref, { unpaidBalance: (Number(member.unpaidBalance) || 0) + weeklyRate });
    });
    return true;
  });
}

export function watchPendingAccounts(onAccounts, onError) {
  return onSnapshot(
    query(collection(db, 'userProfiles'), where('status', '==', 'pending')),
    (snapshot) => onAccounts(snapshot.docs.map((item) => ({ uid: item.id, ...item.data() }))),
    onError,
  );
}

export async function setAccountStatus(uid, status) {
  await updateDoc(doc(db, 'userProfiles', uid), { status });
}

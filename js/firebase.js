/* ════════════════════════════════════════════════════════
   firebase.js — Remplace supabase.js
   Initialise Firebase et exporte auth + db helpers
════════════════════════════════════════════════════════ */
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged as onAuthStateChangedFirebase
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

/* ── Config Firebase ── */
const firebaseConfig = {
  apiKey:            "AIzaSyAABVVa9T_bsoOOqLUvu8u0BLzRw3nC8W8",
  authDomain:        "lab-201-1efe2.firebaseapp.com",
  projectId:         "lab-201-1efe2",
  storageBucket:     "lab-201-1efe2.firebasestorage.app",
  messagingSenderId: "889366412291",
  appId:             "1:889366412291:web:a0f6abadace39394946236"
};

export { firebaseConfig };

const app  = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export async function signOut() {
  return firebaseSignOut(auth);
}
const db   = getFirestore(app);

/* ────────────────────────────────────────────────────────
   AUTH helpers
──────────────────────────────────────────────────────── */

/** Connexion email / mot de passe */
export { signInWithEmailAndPassword };

/** Écoute les changements d'état d'auth — retourne unsubscribe */
export function onAuthStateChanged(callback) {
  return onAuthStateChangedFirebase(auth, callback);
}


/* ────────────────────────────────────────────────────────
   DATABASE helpers — collection tour_dates
──────────────────────────────────────────────────────── */

/** Écoute en temps réel les tour_dates triées par date */
export function onSnapshotTourDates(callback, onError) {
  const q = query(
    collection(db, 'tour_dates'),
    orderBy('date', 'asc')
  );
  return onSnapshot(q,
    snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
    onError
  );
}

/** Ajouter une date */
export async function addTourDate(data) {
  await addDoc(collection(db, 'tour_dates'), data);
}

/** Modifier une date */
export async function updateTourDate(id, data) {
  await updateDoc(doc(db, 'tour_dates', id), data);
}

/** Supprimer une date */
export async function deleteTourDate(id) {
  await deleteDoc(doc(db, 'tour_dates', id));
}

export async function fetchTourDatesRest() {
  const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/tour_dates?key=${firebaseConfig.apiKey}`;
  const res = await fetch(url);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = data?.error?.message || `HTTP ${res.status}`;
    throw new Error(message);
  }

  return (data.documents || [])
    .map(doc => ({
      id: doc.name.split('/').pop(),
      ...fromFirestoreFields(doc.fields || {}),
    }))
    .sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')));
}

function fromFirestoreFields(fields) {
  return Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [key, fromFirestoreValue(value)])
  );
}

function fromFirestoreValue(value) {
  if ('stringValue' in value) return value.stringValue;
  if ('booleanValue' in value) return value.booleanValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return value.doubleValue;
  if ('timestampValue' in value) return value.timestampValue;
  if ('nullValue' in value) return null;
  return '';
}

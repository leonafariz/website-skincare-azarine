const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');

// Normalize env values: strip accidental wrapping quotes (common when the
// .env format is pasted as-is into the Vercel dashboard) and unescape \n.
function envValue(name) {
    let v = process.env[name];
    if (!v) return undefined;
    v = v.trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
    }
    return v.replace(/\\n/g, '\n');
}

// Lazy init: don't crash the whole serverless function at import time —
// fail per-request with a clear error message instead.
let _db = null;
let _auth = null;

function init() {
    const projectId = envValue('FIREBASE_PROJECT_ID');
    const clientEmail = envValue('FIREBASE_CLIENT_EMAIL');
    const privateKey = envValue('FIREBASE_PRIVATE_KEY');

    if (!projectId || !clientEmail || !privateKey) {
        throw new Error(
            'Missing Firebase Admin credentials. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in your environment (see .env.example).'
        );
    }

    if (!getApps().length) {
        initializeApp({
            credential: cert({ projectId, clientEmail, privateKey }),
        });
    }
    _db = getFirestore();
    _auth = getAuth();
}

function lazy(getTarget) {
    return new Proxy({}, {
        get(_, prop) {
            if (!_db) init();
            const target = getTarget();
            const value = target[prop];
            return typeof value === 'function' ? value.bind(target) : value;
        },
    });
}

const db = lazy(() => _db);
const auth = lazy(() => _auth);

module.exports = { db, auth, envValue };

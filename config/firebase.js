const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : undefined;

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

const db = getFirestore();
const auth = getAuth();

module.exports = { db, auth };

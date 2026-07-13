const admin = require('firebase-admin');
const { db } = require('./firebase');

// Firebase Admin is already initialized via firebase.js
// This module just re-exports the auth instance for verifying ID tokens
function getAuth() {
    return admin.auth();
}

module.exports = { getAuth };

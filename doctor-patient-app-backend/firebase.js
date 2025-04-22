// firebase.js
const admin = require("firebase-admin");
require("dotenv").config();

admin.initializeApp({
  credential: admin.credential.cert(require(process.env.FIREBASE_CREDENTIALS)),
});

const db = admin.firestore();
module.exports = { admin, db };

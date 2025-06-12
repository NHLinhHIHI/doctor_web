// firebase.js
const admin = require("firebase-admin");
const path = require("path");
require("dotenv").config();

// Use direct path to serviceAccountKey.json if environment variable is not set
const serviceAccountPath = process.env.FIREBASE_CREDENTIALS || 
                          path.join(__dirname, "serviceAccountKey.json");

try {
  let serviceAccount;
  // Try to load the service account file
  if (process.env.FIREBASE_CREDENTIALS) {
    serviceAccount = require(process.env.FIREBASE_CREDENTIALS);
  } else {
    serviceAccount = require("./serviceAccountKey.json");
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // Explicitly specify the database URL
    databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
  });

  console.log('Firebase Admin initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
  process.exit(1); // Exit if Firebase couldn't be initialized
}

const db = admin.firestore();
module.exports = { admin, db };

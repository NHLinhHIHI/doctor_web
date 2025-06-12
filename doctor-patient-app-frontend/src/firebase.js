// Cấu hình Firebase cho frontend
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDx50gxD5-PCUNNfQ2ODxXz2tF82lL_bjU",
  authDomain: "datn-doctor-patient.firebaseapp.com",
  projectId: "datn-doctor-patient",
  storageBucket: "datn-doctor-patient.appspot.com",
  messagingSenderId: "438787063407",
  appId: "1:438787063407:web:723e3ea49a4fde15c52bbe",
  measurementId: "G-5X6D1FHWRY"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);

// Khởi tạo các dịch vụ
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
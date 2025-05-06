// routes/prescriptions.js
const express = require("express");
const router = express.Router();
const { db } = require("../firebase");
const {
  collection,
  doc,
  getDocs,
  setDoc,
  addDoc,
  Timestamp,
} = require("firebase/firestore");

// Route GET - Lấy tất cả các cuộc khám hôm nay
router.get("/examinations/today", async (req, res) => {
  try {
    const examinationsRef = collection(db, "examinations");
    const snapshot = await getDocs(examinationsRef);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = snapshot.docs
      .filter((docSnap) => {
        const data = docSnap.data();
        const examDate = data.examinationDate?.toDate?.();
        if (!examDate) return false;
        examDate.setHours(0, 0, 0, 0);
        return examDate.getTime() === today.getTime();
      })
      .map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          name: data.patientName || "Bệnh nhân",
          age: data.age || 30,
          gender: data.gender || "Nam",
          symptoms: data.symptoms || "Chưa có triệu chứng",
          waitingSince: data.appointmentTime || "08:00",
        };
      });

    res.status(200).json(result);
  } catch (error) {
    console.error("Lỗi khi lấy examinations:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

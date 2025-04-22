// routes/doctor.js
const express = require("express");
const { admin, db } = require("../firebase");
const router = express.Router();

// API tạo doctor mới
router.post("/create-doctor", async (req, res) => {
  const {
    email,
    password,
    fullName,
    phone,
    address,
    birthDate,
    experience,
    note,
    CCCD,
  } = req.body;

  try {
    // 1. Tạo tài khoản Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
    });

    const uid = userRecord.uid;

    // 2. Lưu thông tin vào Firestore
    await db.collection("users").doc(uid).set({
      name: fullName,
      role: "doctor",
      phone,
      address,
      birthDate,
      experience,
      note,
      CCCD,
      createdAt: new Date(),
    });

    res.json({ success: true, message: "Doctor created", uid });
  } catch (error) {
    console.error("Error creating doctor:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

const express = require("express");

const { admin, db } = require("../firebase");
const router = express.Router();

// API lưu hồ sơ người dùng
router.post("/create", async (req, res) => {
  const { uid, name, role } = req.body; // role: "doctor" hoặc "patient"

  try {
    await db.collection("users").doc(uid).set({ name, role });
    res.json({ success: true, message: "User profile created" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

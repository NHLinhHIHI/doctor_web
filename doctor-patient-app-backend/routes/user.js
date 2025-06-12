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

router.get('/user-profile/check-profile/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const userDoc = await db.collection('users').doc(id).get();
    if (!userDoc.exists) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy user' });
    }
    // Kiểm tra profile
    const profileRef = db.collection('users').doc(id).collection('Profile');
    const normalProfileDoc = await profileRef.doc('NormalProfile').get();
    const healthProfileDoc = await profileRef.doc('HealthProfile').get();
    res.json({
      success: true,
      hasNormalProfile: normalProfileDoc.exists,
      hasHealthProfile: healthProfileDoc.exists
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

const express = require("express");
const axios = require("axios");
const { db } = require("../firebase");
const router = express.Router();

const API_KEY = process.env.FIREBASE_API_KEY;
// sau khi làm trang admin thì hãy nhớ lúc mà tạo tài khoảng cho bác sĩ thì điền mâj khẩu tài khoảng , sau đó copu uid và
//chuyển vào firebase store  để tạo role cho bác sĩ 
// POST /auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Bước 1: Gửi request tới Firebase Authentication REST API
    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
      {
        email,
        password,
        returnSecureToken: true,
      }
    );

    const { localId: uid, idToken } = response.data;

    // Bước 2: Kiểm tra xem user có tồn tại trong Firestore không
    const userDoc = await db.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "User profile not found in Firestore",
      });
    }

    const userData = userDoc.data();

    // Bước 3: Trả kết quả
    res.json({
      success: true,
      message: "Login successful",
      uid,
      idToken,
      user: userData,
    });

  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(401).json({
      success: false,
      message: "Invalid email or password",
      error: error.response?.data?.error || error.message,
    });
  }
});

module.exports = router;

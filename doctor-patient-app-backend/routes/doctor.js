// routes/doctor.js
const express = require("express");
const { admin, db } = require("../firebase");
const bcrypt = require("bcrypt");
const router = express.Router();
const nodemailer = require("nodemailer");
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'LINH.NH18886@sinhvien.hoasen.edu.vn',
    pass: 'mfzg jvaj lkvn nmoz', // Mật khẩu ứng dụng Gmail (không phải mật khẩu thường)
  }
});
router.post("/send-reminder-email", async (req, res) => {
  const { email, reExamDate,name,html } = req.body;

  if (!email || !reExamDate || !name) {
    return res.status(400).json({ success: false, message: "Thiếu thông tin." });
  }

  // Gửi mail (giả sử dùng nodemailer)
  try {
     const dateObj = new Date(reExamDate);

  // Format lại thành dạng YYYY-MM-DD
  const formattedDate = dateObj.toISOString().split('T')[0]; // ví dụ: "2025-06-22"
    await transporter.sendMail({
      from: 'LINH.NH18886@sinhvien.hoasen.edu.vn',
      to: email,  
      subject: "Nhắc lịch khám bệnh",
      text: `Xin chào bạn  ${name}, Bạn có lịch tái khám vào  ${formattedDate}, mọi sự thay đổi vui lòng liên hệ lại với chúng tôi .`,
      html

    });

    res.json({ success: true });
  } catch (error) {
    console.error("Lỗi gửi mail:", error);
    res.status(500).json({ success: false, message: "Gửi mail thất bại." });
  }
});
router.post("/send-pdf-email", async (req, res) => {
  const { email, name, html } = req.body;

  if (!email || !name || !html) {
    return res.status(400).json({ success: false, message: "Thiếu thông tin." });
  }

  try {
   

    // Tạo file PDF từ HTML bằng Puppeteer
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const fileName = `prescription_${Date.now()}.pdf`;
    const filePath = path.join(__dirname, '../pdfs', fileName); // tạo folder "pdfs" sẵn

    await page.pdf({ path: filePath, format: 'A4' });
    await browser.close();

    // Gửi email kèm file PDF


    await transporter.sendMail({
      
      from: 'LINH.NH18886@sinhvien.hoasen.edu.vn',
      to: email,
      subject: "Toa thuốc đính kèm",
      text: `Xin chào ${name}, đây là toa thuốc từ Bác Sĩ bạn đã khám .`,
      attachments: [
        {
          filename: 'ToaThuoc.pdf',
          path: filePath,
        },
      ],
    });
    fs.unlink(filePath, (err) => {
  if (err) console.error('Không thể xoá file PDF:', err);
});


    res.json({ success: true });
  } catch (error) {
    console.error("Lỗi gửi mail:", error);
    res.status(500).json({ success: false, message: "Gửi mail thất bại." });
  }
});
// API tạo doctor mới
router.post("/create-doctor", async (req, res) => {
  const {
    email,
    password,
    specialty,
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
    const hashedPassword = await bcrypt.hash(password, 10);

    // 2. Lưu thông tin vào Firestore
    await db.collection("users").doc(uid).set({
      email: email,
      password: hashedPassword,
      name: fullName,
      role: "doctor",
      phone,
      address,
      birthDate,
      specialty,
      experience,
      note,
      CCCD,
      createdAt: new Date(),
    });
    const mailOptions = {
      from: 'LINH.NH18886@sinhvien.hoasen.edu.vn',
      to: email,
      subject: "Tài khoản bác sĩ đã được tạo",
      text: `Xin chào ${fullName},\n\nTài khoản của bạn đã được tạo thành công:\n\n📧 Email: ${email}\n🔐 Mật khẩu: ${password}\n\nVui lòng đăng nhập và đổi mật khẩu sau lần đăng nhập đầu tiên.\n\nTrân trọng,\nPhòng khám`
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.error("Gửi email thất bại:", error);
      } else {
        console.log("Email đã gửi:", info.response);
      }});

    res.json({ success: true, message: "Doctor created", uid });
  } catch (error) {
    console.error("Error creating doctor:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});
// Lấy thông tin profile doctor từ email
router.get("/profile", async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const snapshot = await db.collection("users").where("email", "==", email).get();

    if (snapshot.empty) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    const doctorDoc = snapshot.docs[0];
    const doctorData = doctorDoc.data();

    res.json({
      id: doctorDoc.id,
      ...doctorData,
    });
  } catch (error) {
    console.error("Error getting doctor profile:", error);
    res.status(500).json({ error: "Failed to fetch doctor profile" });
  }
});
router.put("/update/:email", async (req, res) => {
  const { email } = req.params;
  const updates = req.body;

  try {
    const snapshot = await db.collection("users").where("email", "==", email).get();

    if (snapshot.empty) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const docId = snapshot.docs[0].id;
    await db.collection("users").doc(docId).update(updates);

    res.status(200).json({ message: "Cập nhật thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi cập nhật thông tin" });
  }
});
// 4. Đổi mật khẩu - cập nhật cả Auth và Firestore
router.post("/change-password", async (req, res) => {
  const { email, password, newPassword } = req.body;

  try {
    const snapshot = await db.collection("users").where("email", "==", email).get();

    if (snapshot.empty) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();

    // Kiểm tra mật khẩu cũ
    const isMatch = await bcrypt.compare(password, userData.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Sai mật khẩu cũ" });
    }

    const hashedNew = await bcrypt.hash(newPassword, 10);

    // ✅ 1. Cập nhật Auth
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().updateUser(user.uid, {
      password: newPassword,
    });

    // ✅ 2. Cập nhật Firestore
    await db.collection("users").doc(userDoc.id).update({ password: hashedNew });

    res.json({ message: "Đổi mật khẩu thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi khi đổi mật khẩu" });
  }
});


module.exports = router;

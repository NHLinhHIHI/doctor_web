const express = require("express");
const router = express.Router();
const { db } = require("../firebase");
const admin = require('firebase-admin');
const now = admin.firestore.Timestamp.now();
const sevenDaysMillis = 7 * 24 * 60 * 60 * 1000;

const fromDate = new Date(now.toDate().getTime() - sevenDaysMillis);
const toDate = new Date(now.toDate().getTime() + sevenDaysMillis);
router.get("/around", async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: "Thiếu ngày cần truy vấn (query: ?date=yyyy-mm-dd)" });
    }

    // Chuyển date từ chuỗi sang Date object
    const selectedDate = new Date(date); // yyyy-mm-dd
    selectedDate.setHours(0, 0, 0, 0); // bắt đầu ngày

    const endDate = new Date(selectedDate);
    endDate.setHours(23, 59, 59, 999); // kết thúc ngày

    const hisSnap = await db.collection("HisSchedule")
      .where("examinationDate", ">=", admin.firestore.Timestamp.fromDate(selectedDate))
      .where("examinationDate", "<=", admin.firestore.Timestamp.fromDate(endDate))
      .get();

    const result = [];

    for (const doc of hisSnap.docs) {
      const data = doc.data();
      const {
        doctorID,
        patientID,
        scheduleID,
        shift,
        status,
        timeSlot,
        examinationDate
      } = data;

      let patientInfo = null;
      try {
        const patientDoc = await db.collection("users").doc(patientID).get();
        if (patientDoc.exists) {
          patientInfo = patientDoc.data();
        }
      } catch (err) {
        console.error(`Error fetching user ${patientID}:`, err);
      }

      let doctorName = "";
      try {
        const userDoc = await db.collection("users").doc(doctorID).get();
        if (userDoc.exists) {
          doctorName = userDoc.data().name || "";
        }
      } catch (err) {
        console.error(`Error fetching doctor ${doctorID}:`, err);
      }

      result.push({
        docID: doc.id,
        doctorName,
        doctorID,
        patientId: patientID,
        scheduleID,
        shift,
        status,
        timeSlot,
        examinationDate: examinationDate.toDate().toLocaleDateString("en-US"),
        patientInfo
      });
    }

    res.status(200).json({ records: result });
  } catch (error) {
    console.error("Error in /hisSchedule/around:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/medical-history/:patientId", async (req, res) => {
  try {
    const patientId = req.params.patientId;

    const examSnap = await db.collection("examinations")
      .where("patientId", "==", patientId)
      .get();

    if (examSnap.empty) {
      return res.status(404).json({ message: "No medical history found." });
    }

    // ✅ Lấy thông tin bệnh nhân 1 lần duy nhất
    let patientInfo = null;
    try {
      const patientDoc = await db.collection("users").doc(patientId).get();
      if (patientDoc.exists) {
        patientInfo = patientDoc.data();
      }
    } catch (err) {
      console.error(`Error fetching user ${patientId}:`, err);
    }

    const medicalHistory = [];

    for (const doc of examSnap.docs) {
      const data = doc.data();

      // Format ngày
      const examDate = data.examinationDate.toDate();
      const formattedDate = examDate.toLocaleDateString("en-GB");

      // Tên bác sĩ
      // let doctorName = "Không rõ";
      // try {
      //   const doctorDoc = await db.collection("users").doc(data.doctorId).get();
      //   if (doctorDoc.exists) {
      //     doctorName = `Dr. ${doctorDoc.data().name}`;
      //   }
      // } catch (error) {
      //   console.error(`Không thể lấy thông tin bác sĩ ${data.doctorId}:`, error);
      // }

      // Gộp đơn thuốc
      let prescription = "Không có đơn thuốc";
      if (Array.isArray(data.medications) && data.medications.length > 0) {
        const prescriptionLines = data.medications.map((med) => {
          const name = med.medicineName || "Không rõ thuốc";
          const dosage = med.dosage ? ` (${med.dosage})` : "";
          const frequency = med.frequency || "";
          const quantity = med.quantity ? `, SL: ${med.quantity}` : "";
          const usageNotes = med.usageNotes ? ` - Ghi chú: ${med.usageNotes}` : "";
          return `${name}${dosage} - ${frequency}${quantity}${usageNotes}`;
        });
        prescription = prescriptionLines.join("\n");
      }

      // ✅ Chỉ đẩy medicalHistory thôi
      medicalHistory.push({
        date: formattedDate,
        diagnosis: data.diagnosis || "Không rõ",
        // doctor: doctorName,
        prescription,
        reExamDate: data.reExamDate ? data.reExamDate.toDate().toLocaleDateString("en-GB") : "Không có",
        notes: data.notes || ""
      });
    }

    // ✅ Trả về patientInfo và medicalHistory cùng cấp
    res.status(200).json({
      patientInfo,
      medicalHistory
    });
  } catch (error) {
    console.error("Lỗi khi lấy medical history:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
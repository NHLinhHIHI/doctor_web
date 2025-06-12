// routes/schedule.js
const express = require("express");
const router = express.Router();
const { db } = require("../firebase");

// POST /schedule/add
router.post("/add", async (req, res) => {
  try {
    const { date, morningRooms, afternoonRooms } = req.body;

    if (!date) {
      return res.status(400).json({ message: "Missing date" });
    }

    const scheduleRef = db.collection("Schedule").doc();
    await scheduleRef.set({ date });

    // Add morning shifts
    if (Array.isArray(morningRooms)) {
      for (const room of morningRooms) {
        await scheduleRef.collection("Morning").add({
          room,
          slot: 10,
        });
      }
    }

    // Add afternoon shifts
    if (Array.isArray(afternoonRooms)) {
      for (const room of afternoonRooms) {
        await scheduleRef.collection("Afternoon").add({
          room,
          slot: 10,
        });
      }
    }

    return res.status(200).json({ message: "Lịch đã được thêm" });
  } catch (error) {
    console.error("Add schedule error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});
router.get("/all", async (req, res) => {
    try {
      const schedulesSnapshot = await db.collection("Schedule").get();
      const schedules = [];
  
      for (const doc of schedulesSnapshot.docs) {
        const data = doc.data();
        const scheduleId = doc.id;
  
        const morningSnap = await db.collection("Schedule").doc(scheduleId).collection("Morning").get();
        const afternoonSnap = await db.collection("Schedule").doc(scheduleId).collection("Afternoon").get();
  
        const morningRooms = morningSnap.docs.map(roomDoc => roomDoc.data().room);
        const afternoonRooms = afternoonSnap.docs.map(roomDoc => roomDoc.data().room);
  
        schedules.push({
          date: data.date,
          morningRooms,
          afternoonRooms
        });
      }
  
      return res.status(200).json(schedules);
    } catch (error) {
      console.error("Fetch schedule error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  // POST /schedule/register
router.post("/register", async (req, res) => {
    try {
      const { date, shift, room, doctorID } = req.body;
  
      if (!date || !shift || !room || !doctorID) {
        return res.status(400).json({ message: "Thiếu thông tin đăng ký" });
      }
  
      // Tìm schedule theo ngày
      const schedulesSnapshot = await db
        .collection("Schedule")
        .where("date", "==", date)
        .get();
  
      if (schedulesSnapshot.empty) {
        return res.status(404).json({ message: "Không tìm thấy lịch cho ngày này" });
      }
  
      const scheduleDoc = schedulesSnapshot.docs[0];
      const scheduleId = scheduleDoc.id;
  
      // Tìm ca làm trong Morning hoặc Afternoon
      const shiftCollection = db
        .collection("Schedule")
        .doc(scheduleId)
        .collection(shift);
  
      const shiftSnapshot = await shiftCollection
        .where("room", "==", room)
        .get();
  
      if (shiftSnapshot.empty) {
        return res.status(404).json({ message: "Không tìm thấy phòng này trong ca làm" });
      }
  
      const shiftDoc = shiftSnapshot.docs[0];
      const shiftDocRef = shiftCollection.doc(shiftDoc.id);
  
      // Thêm subcollection doctorID với status
      await shiftDocRef
        .collection("doctorID")
        .add({
          doctorID,
          status: "waiting"
        });
  
      return res.status(200).json({ message: "Đăng ký thành công" });
  
    } catch (error) {
      console.error("Lỗi khi đăng ký lịch:", error);
      return res.status(500).json({ message: "Lỗi server khi đăng ký ca" });
    }
  });
  
module.exports = router;

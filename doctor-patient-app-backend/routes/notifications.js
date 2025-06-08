// routes/notifications.js
const express = require("express");
const { db } = require("../firebase");
const admin = require('firebase-admin');

const router = express.Router();


// Tạo thông báo mới từ lịch làm việc
router.post("/notify-cancel", async (req, res) => {
  try {
    const { date, shift, room, note } = req.body;

    if (!date || !shift || !room || !note) {
      return res.status(400).json({ message: "Thiếu thông tin hủy (ngày, ca, phòng hoặc ghi chú)" });
    }

    const schedulesSnapshot = await db
      .collection("Schedule")
      .where("date", "==", date)
      .get();

    if (schedulesSnapshot.empty) {
      return res.status(404).json({ message: "Không tìm thấy lịch cho ngày này" });
    }

    const scheduleDoc = schedulesSnapshot.docs[0];
    const scheduleId = scheduleDoc.id;

    const shiftCollection = db.collection("Schedule").doc(scheduleId).collection(shift);
    const roomSnapshot = await shiftCollection.where("room", "==", room).get();

    if (roomSnapshot.empty) {
      return res.status(404).json({ message: "Không tìm thấy lịch cho phòng này." });
    }

    const roomDoc = roomSnapshot.docs[0];
    const roomDocID = roomDoc.id;

    const doctorRegsSnapshot = await shiftCollection
      .doc(roomDocID)
      .collection("doctorID")
      .get();

    const notifyBatch = db.batch();
    const notificationRef = db.collection("notifications");

    for (const doc of doctorRegsSnapshot.docs) {
      const reg = doc.data();

      // ✅ Chỉ bác sĩ đã được duyệt (done)
      if (reg.status !== "done") continue;

      const doctorID = reg.doctorID;

      let patientId = null;

      const hisSnap = await db.collection("HisSchedule")
        .where("scheduleID", "==", scheduleId)
        .where("room", "==", room)
        .where("doctorID", "==", doctorID)
        .get();

      if (!hisSnap.empty) {
        patientId = hisSnap.docs[0].data().patientID || null;
      }

      const notificationData = {
        dateCancel: date,
        note: note, // ✅ sử dụng ghi chú người dùng nhập
        status: "room_cancelled",
        doctorID,
        room,
        scheduleId,
        shift,
        ...(patientId && { patientId })
      };

      const newNotifyDoc = notificationRef.doc();
      notifyBatch.set(newNotifyDoc, notificationData);
    }

    await notifyBatch.commit();

    return res.status(200).json({ message: "Thông báo hủy phòng đã được tạo" });
  } catch (error) {
    console.error("Lỗi khi gửi thông báo hủy:", error);
    return res.status(500).json({ message: "Lỗi server khi thông báo hủy ca" });
  }
});


// Lấy tất cả thông báo (nếu cần sau này)
  router.get("/", async (req, res) => {
    try {
      const snapshot = await db.collection("notifications").orderBy("createdAt", "desc").get();

      const notifications = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      res.json(notifications);
    } catch (err) {
      console.error("Lỗi khi lấy thông báo:", err);
      res.status(500).json({ message: "Không lấy được thông báo." });
    }
  });
  // router.get("/notifications", async (req, res) => {
  //     try {
  //       const snapshot = await getDocs(collection(db, "notifications"));
  //       const notifications = [];
    
  //       for (const docSnap of snapshot.docs) {
  //         const data = docSnap.data();
  //         const doctorId = data.doctorId;
    
  //         const userDoc = await getDoc(doc(db, "users", doctorId));
  //         const userData = userDoc.exists() ? userDoc.data() : {};
    
  //         notifications.push({
  //           id: doctorId,
  //           name: userData.name || "Không rõ",
  //           avatar: userData.img || "/images/logo.png",
  //           date: data.date,
  //           shift: data.shift,
  //           startTime: data.startTime,
  //           endTime: data.endTime,
  //           createdAt: data.createdAt
  //         });
  //       }
    
  //       res.json(notifications);
  //     } catch (err) {
  //       console.error("Lỗi lấy notifications:", err);
  //       res.status(500).json({ message: "Lỗi server" });
  //     }
  //   });
  // Trong file routes/notifications.js (hoặc tương tự)
// Express route
router.get("/getnotiID", async (req, res) => {
  try {
    const doctorID = req.query.doctorID;
    if (!doctorID) return res.status(400).json({ message: "Missing doctorID" });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const snapshot = await db.collection("notifications")
      .where("doctorID", "==", doctorID)
      .where("createdAt", ">=", sevenDaysAgo)
      .orderBy("createdAt", "desc")
      .get();

    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;

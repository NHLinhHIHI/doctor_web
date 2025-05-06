// routes/notifications.js
const express = require("express");
const { db } = require("../firebase");
const router = express.Router();


// Tạo thông báo mới từ lịch làm việc
router.post("/", async (req, res) => {
  const {
    doctorID,
    name,
    email,
    date,
    shift,
    startTime,
    endTime,
    role,
    createdAt,
  } = req.body;

  // Kiểm tra dữ liệu cần thiết
  if (!doctorID || !name || !email || !date || !shift || !startTime || !endTime || !createdAt) {
    return res.status(400).json({ message: "Thiếu dữ liệu bắt buộc." });
  }

  try {
    await db.collection("notifications").add({
      doctorID,
      role: "schedule",
      name,
      email,
      date,
      shift,
      startTime,
      endTime,
      createdAt: new Date(createdAt),
    });

    res.status(201).json({ message: "Tạo thông báo thành công." });
  } catch (err) {
    console.error("Lỗi khi tạo thông báo:", err);
    res.status(500).json({ message: "Tạo thông báo thất bại." });
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
  router.post("/approve-schedule", async (req, res) => {
    try {
      const {
        doctorID,
        date,
        shift,
        startTime,
        endTime,
        room,
        slot,
        notiId
      } = req.body;
  
      const shiftMap = {
        "Ca sáng": "Morning",
        "Ca Chiều": "Afternoon"
      };
  
      const shiftCollection = shiftMap[shift];
      if (!shiftCollection) {
        return res.status(400).json({ message: "Shift không hợp lệ." });
      }
  
      const scheduleRef = doc(db, "Schedule", doctorID);
      const shiftDoc = doc(db, "Schedule", doctorID, shiftCollection, `${Date.now()}`);
  
      await setDoc(shiftDoc, {
        doctorID,
        date: new Date(date),
        shift,
        startTime,
        endTime,
        room,
        slot,
      });
  
      // Xóa thông báo sau khi phê duyệt
      await deleteDoc(doc(db, "notifications", notiId));

    } catch (error) {
      console.error("Lỗi khi phê duyệt:", error);
      res.status(500).json({ message: "Lỗi server." });
    }
  });
module.exports = router;

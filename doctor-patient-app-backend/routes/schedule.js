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
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset giờ về 00:00

    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 30); // +30 ngày

    const schedulesSnapshot = await db.collection("Schedule").get();
    const schedules = [];

    for (const doc of schedulesSnapshot.docs) {
      const data = doc.data();
      const scheduleDate = new Date(data.date);

      // Lọc ngày: chỉ lấy từ hôm nay đến 30 ngày sau
      if (scheduleDate >= today && scheduleDate <= maxDate) {
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
          status: "waiting".trim()
        });
  
      return res.status(200).json({ message: "Đăng ký thành công" });
  
    } catch (error) {
      console.error("Lỗi khi đăng ký lịch:", error);
      return res.status(500).json({ message: "Lỗi server khi đăng ký ca" });
    }
  });

 // POST /schedule/update
router.post("/update", async (req, res) => {
  try {
    const { date, shift, room } = req.body;

    if (!date || !shift || !room) {
      return res.status(400).json({ message: "Thiếu thông tin cập nhật" });
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

    const shiftRef = db
      .collection("Schedule")
      .doc(scheduleId)
      .collection(shift);

    const roomSnapshot = await shiftRef.where("room", "==", room).get();

    if (!roomSnapshot.empty) {
      return res.status(409).json({ message: "Phòng này đã tồn tại trong ca" });
    }

    await shiftRef.add({
      room,
      slot: 10,
    });

    return res.status(200).json({ message: "Đã thêm phòng vào ca thành công" });
  } catch (error) {
    console.error("Lỗi khi cập nhật phòng:", error);
    return res.status(500).json({ message: "Lỗi server khi cập nhật ca" });
  }
});

    
// DELETE /schedule/delete
router.delete("/delete", async (req, res) => {
      try {
      const { date, shift, room } = req.body;
      
      less
      Copy
      Edit
      if (!date || !shift || !room) {
        return res.status(400).json({ message: "Thiếu thông tin xóa" });
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
      
      const shiftRef = db
        .collection("Schedule")
        .doc(scheduleId)
        .collection(shift);
      
      const roomSnapshot = await shiftRef.where("room", "==", room).get();
      
      if (roomSnapshot.empty) {
        return res.status(404).json({ message: "Không tìm thấy phòng cần xóa" });
      }
      
      const roomDocId = roomSnapshot.docs[0].id;
      
      // Xóa tất cả subcollection doctorID nếu có
      const doctorSubSnap = await shiftRef.doc(roomDocId).collection("doctorID").get();
      const batch = db.batch();
      
      doctorSubSnap.forEach(doc => {
        batch.delete(shiftRef.doc(roomDocId).collection("doctorID").doc(doc.id));
      });
      
      batch.delete(shiftRef.doc(roomDocId));
      await batch.commit();
      
      return res.status(200).json({ message: "Đã xóa phòng khỏi ca thành công" });
      } catch (error) {
      console.error("Lỗi khi xóa phòng:", error);
      return res.status(500).json({ message: "Lỗi server khi xóa ca làm" });
      }
      });
  router.get("/done", async (req, res) => {
    try {
      const schedulesSnapshot = await db.collection("Schedule").get();
      const result = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const maxDate = new Date();
      maxDate.setDate(today.getDate() + 30);

  
      for (const scheduleDoc of schedulesSnapshot.docs) {
        const scheduleId = scheduleDoc.id;
        const { date } = scheduleDoc.data();
        const scheduleDate = new Date(date);
        if (scheduleDate < today || scheduleDate > maxDate) continue;
  
        for (const shift of ["Morning", "Afternoon"]) {
          const shiftSnapshot = await db.collection("Schedule").doc(scheduleId).collection(shift).get();
  
          for (const roomDoc of shiftSnapshot.docs) {
            const { room } = roomDoc.data();
  
            const doctorRegs = await db
              .collection("Schedule")
              .doc(scheduleId)
              .collection(shift)
              .doc(roomDoc.id)
              .collection("doctorID")
              .where("status", "==", "done")  // <== CHỈ LẤY DONE
              .get();
  
            for (const regDoc of doctorRegs.docs) {
              const { doctorID } = regDoc.data();
              const userDoc = await db.collection("users").doc(doctorID).get();
  
              if (userDoc.exists) {
                const { name, img } = userDoc.data();
                result.push({
                  doctorID,
                  name,
                  image: img,
                  date,
                  shift,
                  room,
                });
              }
            }
          }
        }
      }
  
      return res.status(200).json(result);
    } catch (err) {
      console.error("Error fetching done doctors:", err);
      return res.status(500).json({ message: "Lỗi server khi lấy dữ liệu bác sĩ đã duyệt" });
    }
  });
  
  // GET /schedule/waiting
  router.get("/waiting1", async (req, res) => {
    try {
      const schedulesSnapshot = await db.collection("Schedule").get();
      const result = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const maxDate = new Date();
      maxDate.setDate(today.getDate() + 30);
  
      for (const scheduleDoc of schedulesSnapshot.docs) {
        const scheduleId = scheduleDoc.id;
        const { date } = scheduleDoc.data();
        const scheduleDate = new Date(date);
        if (scheduleDate < today || scheduleDate > maxDate) continue;
  
        for (const shift of ["Morning", "Afternoon"]) {
          const shiftSnapshot = await db.collection("Schedule").doc(scheduleId).collection(shift).get();
  
          for (const roomDoc of shiftSnapshot.docs) {
            const { room } = roomDoc.data();
  
            const doctorRegs = await db
              .collection("Schedule")
              .doc(scheduleId)
              .collection(shift)
              .doc(roomDoc.id)
              .collection("doctorID")
              .where("status", "==", "waiting")
              .get();
  
            for (const regDoc of doctorRegs.docs) {
              const { doctorID } = regDoc.data(); // chuẩn ID
              const userDoc = await db.collection("users").doc(doctorID).get();
  
              if (userDoc.exists) {
                const { name, img } = userDoc.data();
                result.push({
                  doctorID,
                  name,
                  image: img,
                  date,
                  shift: shift === "Morning" ? "Morning" : "Afternoon",
                  room,
                });
              }
            }
          }
        }
      }
    return res.status(200).json(result);
  } catch (err) {
    console.error("Error fetching waiting doctors:", err);
    return res.status(500).json({ message: "Lỗi server khi lấy dữ liệu bác sĩ chờ duyệt" });
  }
});
// POST /schedule/approve
router.post("/approve", async (req, res) => {
  try {
    const { date, shift, room, doctorID } = req.body;

    if (!date || !shift || !room || !doctorID) {
      return res.status(400).json({ message: "Thiếu thông tin phê duyệt" });
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

    // Tìm phòng trong ca làm
    const shiftCollection = db
      .collection("Schedule")
      .doc(scheduleId)
      .collection(shift);

    const shiftSnapshot = await shiftCollection
      .where("room", "==", room)
      .get();

    if (shiftSnapshot.empty) {
      return res.status(404).json({ message: "Không tìm thấy phòng trong ca làm" });
    }

    const roomDoc = shiftSnapshot.docs[0];
    const roomDocRef = shiftCollection.doc(roomDoc.id);

    // Lấy tất cả bác sĩ đăng ký
    const doctorRegsSnapshot = await roomDocRef.collection("doctorID").get();

    const batch = db.batch();

    doctorRegsSnapshot.forEach(doc => {
      const regData = doc.data();
      const regRef = roomDocRef.collection("doctorID").doc(doc.id);

      if (regData.doctorID === doctorID) {
        // Cập nhật bác sĩ được duyệt
        batch.update(regRef, { status: "done" });
      } else if (regData.status === "waiting") {
        // Cập nhật các bác sĩ còn lại thành cancel
        batch.update(regRef, { status: "cancel" });
      }
    });

    await batch.commit();

    return res.status(200).json({ message: "Đã duyệt thành công ca làm" });

  } catch (error) {
    console.error("Lỗi khi duyệt lịch:", error);
    return res.status(500).json({ message: "Lỗi server khi duyệt ca làm" });
  }
});
router.post("/cancel", async (req, res) => {
  try {
    const { date, shift, room, doctorID } = req.body;

    if (!date || !shift || !room || !doctorID) {
      return res.status(400).json({ message: "Thiếu thông tin phê duyệt" });
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

    // Tìm phòng trong ca làm
    const shiftCollection = db
      .collection("Schedule")
      .doc(scheduleId)
      .collection(shift);

    const shiftSnapshot = await shiftCollection
      .where("room", "==", room)
      .get();

    if (shiftSnapshot.empty) {
      return res.status(404).json({ message: "Không tìm thấy phòng trong ca làm" });
    }

    const roomDoc = shiftSnapshot.docs[0];
    const roomDocRef = shiftCollection.doc(roomDoc.id);

    // Lấy tất cả bác sĩ đăng ký
    const doctorRegsSnapshot = await roomDocRef.collection("doctorID").get();

    const batch = db.batch();

    let found = false;
    doctorRegsSnapshot.forEach(doc => {
      const regData = doc.data();
      const regRef = roomDocRef.collection("doctorID").doc(doc.id);

      if (regData.doctorID === doctorID) {
        batch.update(regRef, { status: "cancel" });
        found = true;
      }
    });

    if (!found) {
      return res.status(404).json({ message: "Không tìm thấy đăng ký của bác sĩ" });
    }

    await batch.commit();

    return res.status(200).json({ message: "Đã hủy đăng ký thành công" });

  } catch (error) {
    console.error("Lỗi khi hủy lịch:", error);
    return res.status(500).json({ message: "Lỗi server khi hủy ca làm" });
  }
});


  
module.exports = router;
// đầu tiên không cho bác sĩ đăng khí 2 phòng trong 1 ca // done 
// sau đó hiện 1 nút cancel cho bác sĩ nào đã đăng ký và trạng thái là cancel và thời gian cancel lúc nhấn //done 
//lịch thì lấy từ hôm nay đến 1 tháng sau //song
//
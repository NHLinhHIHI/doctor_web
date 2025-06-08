const express = require("express");
const router = express.Router();
const { db } = require("../firebase");
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

// Cấu hình gửi mail bằng Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'LINH.NH18886@sinhvien.hoasen.edu.vn',
    pass: 'mfzg jvaj lkvn nmoz', // Mật khẩu ứng dụng Gmail (không phải mật khẩu thường)
  }
});

// POST /api/schedule/create
router.post('/create', async (req, res) => {
  try {
    const { date, MorningRooms = [], AfternoonRooms = [] } = req.body;

    if (!date) {
      return res.status(400).json({ error: 'Missing date' });
    }

    const scheduleRef = db.collection('Schedule').doc();
    await scheduleRef.set({ date });

    // Chuẩn bị object để set vào document
    const scheduleData = {};

    MorningRooms.forEach(room => {
      const key = `Morning${room}`;
      scheduleData[key] = {
        room,
        slot: '10',
        shift: 'Morning',
        doctorIDs: [],
        doctorIDaccecp: null


      };
    });

    AfternoonRooms.forEach(room => {
      const key = `Afternoon${room}`;
      scheduleData[key] = {
        room,
        slot: '10',
        shift: 'Afternoon',
        doctorIDs: [],
        doctorIDaccecp: null
      };
    });

    // // Ghi dữ liệu, merge để không mất dữ liệu cũ (nếu cần)
    await scheduleRef.set(scheduleData, { merge: true });

    res.status(200).json({ message: 'Schedule created/updated successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/schedule/register
router.post('/register', async (req, res) => {
  try {
    const { date, room, shift, doctorID } = req.body;

    if (!date || !shift || !room || !doctorID) {
      return res.status(400).json({ message: "Thiếu thông tin đăng ký" });
    }

    const shiftNormalized = shift.trim().charAt(0).toUpperCase() + shift.trim().slice(1).toLowerCase(); // 'Morning' hoặc 'Afternoon'
    const slotRoomKey = `${shiftNormalized}${room}`;


    // Tìm document theo ngày
    const querySnapshot = await db.collection('Schedule')
      .where('date', '==', date)
      .get();

    if (querySnapshot.empty) {
      return res.status(404).json({ message: 'Không tìm thấy lịch theo ngày' });
    }

    const docRef = querySnapshot.docs[0].ref;

    // Tạo key dynamic để update
    const doctorIDsPath = `${slotRoomKey}.doctorIDs`;
    const historyPath = `${slotRoomKey}.history`;

    // Thêm doctorID nếu chưa có
    await docRef.update({
      [doctorIDsPath]: admin.firestore.FieldValue.arrayUnion(doctorID),
      [historyPath]: admin.firestore.FieldValue.arrayUnion({
        doctorID,
        registerAt: admin.firestore.Timestamp.now(),
        action: 'waiting'
      })
    });
    await db.collection("notifications").add({
      doctorID,
      date,
      shift,
      room,
      action: "Đợi duyệt",
      createdAt: admin.firestore.Timestamp.now()
    });

    res.status(200).json({ message: 'Đăng ký lịch thành công' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});
// POST /api/schedule/accept
router.post("/approve", async (req, res) => {
  try {
    const { doctorID, date, shift, room } = req.body;

    const snapshot = await db.collection("Schedule").where("date", "==", date).get();
    if (snapshot.empty) return res.status(404).json({ error: "Schedule not found" });

    const scheduleDoc = snapshot.docs[0];
    const scheduleRef = scheduleDoc.ref;
    const data = scheduleDoc.data();

    const shiftNormalized = shift.trim().charAt(0).toUpperCase() + shift.trim().slice(1).toLowerCase();
    const slotKey = `${shiftNormalized}${room}`;


    const slot = data[slotKey];

    if (!slot || !Array.isArray(slot.history)) {
      return res.status(400).json({ error: "Invalid slot or missing history" });
    }

    let updatedHistory = [];
    for (const entry of slot.history) {
      if (entry.doctorID === doctorID && entry.action === "waiting") {
        updatedHistory.push({ ...entry, action: "done" });
      } else if (entry.action === "waiting") {
        updatedHistory.push({ ...entry, action: "cancel", cancelAt: admin.firestore.Timestamp.now() });
      } else {
        updatedHistory.push(entry);
      }
    }

    await scheduleRef.update({
      [`${slotKey}.history`]: updatedHistory,
      [`${slotKey}.doctorIDaccecp`]: doctorID,
    });
    await db.collection("notifications").add({
      doctorID,
      date,
      shift,
      room,
      action: "Đã được duyệt",
      createdAt: admin.firestore.Timestamp.now()
    });


    res.status(200).json({ message: "Approved successfully" });
  } catch (error) {
    console.error("Approve error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// GET /api/schedule/:date
// router.get('/:date', async (req, res) => {
//   try {
//     const { date } = req.params;
//     const doc = await db.collection('Schedule').doc(date).get();

//     if (!doc.exists) {
//       return res.status(404).json({ message: 'No schedule found for this date' });
//     }

//     res.status(200).json(doc.data());
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });
// GET /api/schedule/all

router.get('/getall', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Đặt về 00:00

    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 30);
    maxDate.setHours(0, 0, 0, 0); // Cũng đặt về 00:00

    const schedulesSnapshot = await db.collection("Schedule").get();
    const schedules = [];

    for (const doc of schedulesSnapshot.docs) {
      const data = doc.data();

      // Chuyển chuỗi "YYYY-MM-DD" thành đối tượng Date
      const scheduleDate = new Date(`${data.date}T00:00:00`);

      if (scheduleDate >= today && scheduleDate <= maxDate) {
        const MorningRooms = [];
        const AfternoonRooms = [];

        for (const key in data) {
          if (key.startsWith('Morning') && data[key].room) {
            MorningRooms.push(data[key].room);
          } else if (key.startsWith('Afternoon') && data[key].room) {
            AfternoonRooms.push(data[key].room);
          }
        }

        schedules.push({
          date: data.date,
          MorningRooms,
          AfternoonRooms
        });
      }
    }

    res.status(200).json(schedules);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});


router.get('/waiting', async (req, res) => {
  try {
    const schedulesSnapshot = await db.collection("Schedule").get();
    const result = [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 30);

    for (const scheduleDoc of schedulesSnapshot.docs) {
      const scheduleData = scheduleDoc.data();
      const { date, ...slots } = scheduleData; // Lưu ý: các slot nằm trực tiếp trong document

      const scheduleDate = new Date(date);
      scheduleDate.setHours(0, 0, 0, 0);

      if (scheduleDate < today || scheduleDate > maxDate) continue;

      for (const slotKey in slots) {
        const slot = slots[slotKey];
        const { history = [] } = slot;

        for (const reg of history) {
          if (reg.action === "waiting") {
            const doctorID = reg.doctorID;
            const userDoc = await db.collection("users").doc(doctorID).get();

            if (userDoc.exists) {
              const { name, img } = userDoc.data();

              result.push({
                doctorID,
                name,
                image: img || "",
                date,
                shift: slot.shift || (slotKey.includes("morning") ? "Morning" : "Afternoon"),
                room: slot.room || slotKey.slice(-3),
                slot: slot.slot || "",
                status: reg.action,
                scheduleId: scheduleDoc.id,
                slotKey,
              });
            }
          }
        }

      }
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching waiting doctors:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router.post("/cancel", async (req, res) => {
  try {
    const { doctorID, date, shift, room } = req.body;

    const snapshot = await db.collection("Schedule").where("date", "==", date).get();
    if (snapshot.empty) return res.status(404).json({ error: "Schedule not found" });

    const scheduleDoc = snapshot.docs[0];
    const scheduleRef = scheduleDoc.ref;
    const data = scheduleDoc.data();

    const shiftNormalized = shift.trim().charAt(0).toUpperCase() + shift.trim().slice(1).toLowerCase();
    const slotKey = `${shiftNormalized}${room}`;

    const slot = data[slotKey];

    if (!slot || !Array.isArray(slot.history)) {
      return res.status(400).json({ error: "Invalid slot or missing history" });
    }

    const updatedHistory = slot.history.map(entry => {
      if (entry.doctorID === doctorID && entry.action === "waiting") {
        return {
          ...entry,
          action: "cancel",
          cancelAt: admin.firestore.Timestamp.now()
        };
      }
      return entry;
    });

    await scheduleRef.update({
      [`${slotKey}.history`]: updatedHistory
    });
    await db.collection("notifications").add({
      doctorID,
      date,
      shift,
      room,
      action: "Đã bị từ chối",
      createdAt: admin.firestore.Timestamp.now()
    });

    res.status(200).json({ message: "Canceled successfully" });
  } catch (error) {
    console.error("Cancel error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// GET /schedule2/done
router.get('/done', async (req, res) => {
  try {
    const schedulesSnapshot = await db.collection("Schedule").get();
    const result = [];

    for (const scheduleDoc of schedulesSnapshot.docs) {
      const scheduleData = scheduleDoc.data();
      const date = scheduleData.date;

      for (const key in scheduleData) {
        const slot = scheduleData[key];

        if (
          slot &&
          typeof slot === 'object' &&
          slot.doctorIDaccecp &&
          slot.room &&
          slot.shift
        ) {
          const doctorID = slot.doctorIDaccecp;
          const shift = slot.shift;
          const room = slot.room;

          const userDoc = await db.collection("users").doc(doctorID).get();

          if (userDoc.exists) {
            const { name, img } = userDoc.data();
            result.push({
              doctorID,
              name,
              image: img || "",
              date,
              shift,
              room
            });
          }
        }
      }
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching approved doctors:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// POST /api/schedule/reopen
router.post("/reopen", async (req, res) => {
  try {
    const { date, shift, room } = req.body;

    const shiftNormalized = shift.trim().charAt(0).toUpperCase() + shift.trim().slice(1).toLowerCase();
    const slotKey = `${shiftNormalized}${room}`;

    const snapshot = await db.collection("Schedule").where("date", "==", date).get();
    if (snapshot.empty) return res.status(404).json({ error: "Schedule not found" });

    const scheduleRef = snapshot.docs[0].ref;

    await scheduleRef.set({
      [slotKey]: {
        room,
        slot: "8",
        shift: shiftNormalized,
        doctorIDs: [],
        doctorIDaccecp: null,
        isclose: false
      }
    }, { merge: true });

    res.status(200).json({ message: "Shift reopened successfully" });
  } catch (error) {
    console.error("Reopen error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// POST /api/schedule/close
router.post("/close", async (req, res) => {
  try {
    const { date, shift, room, note } = req.body;

    const shiftNormalized = shift.trim().charAt(0).toUpperCase() + shift.trim().slice(1).toLowerCase();
    const slotKey = `${shiftNormalized}${room}`;

    const snapshot = await db.collection("Schedule").where("date", "==", date).get();
    if (snapshot.empty) return res.status(404).json({ error: "Schedule not found" });

    const scheduleRef = snapshot.docs[0].ref;
    const scheduleDoc = snapshot.docs[0];
    const scheduleId = scheduleDoc.id;
    const data = snapshot.docs[0].data();
    const slot = data[slotKey];

    if (!slot || slot.isclose === true) {
      return res.status(400).json({ error: "Slot is already closed or doesn't exist" });
    }

    await scheduleRef.update({
      [`${slotKey}.doctorIDaccecp`]: admin.firestore.FieldValue.delete(),
      [`${slotKey}.shift`]: admin.firestore.FieldValue.delete(),
      [`${slotKey}.room`]: admin.firestore.FieldValue.delete(),
      [`${slotKey}.isclose`]: true,
      [`${slotKey}.note`]: note
    });
    const userSnap = await db.collection("users").doc(slot.doctorIDaccecp).get();


    if (userSnap.exists) {
      const doctorEmail = userSnap.data().email;

      const mailOptions = {
        from: 'LINH.NH18886@sinhvien.hoasen.edu.vn',
        to: doctorEmail,
        subject: 'Thông báo hủy ca làm việc',
        text: `Ca làm ngày ${date} (${shift}, phòng ${room}) của bạn đã bị hủy. Lý do: ${note}. Vui lòng đăng ký ca khác nếu cần.`
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.error("Gửi email thất bại:", error);
        } else {
          console.log("Email đã gửi:", info.response);
        }
      });
    }
    const patientIDs = [];

    const hisSnap = await db.collection("HisSchedule")
      .where("scheduleID", "==", scheduleId)
      .where("doctorID", "==", slot.doctorIDaccecp)
      .get();

    if (!hisSnap.empty) {
      for (const doc of hisSnap.docs) {
        const patientID = doc.data().patientID || null;
        if (patientID) {
          patientIDs.push(patientID);

          // Cập nhật trạng thái 'cancel' cho lịch sử
          await doc.ref.update({
            status: "cancel"
          });
          await db.collection("notifications").add({
            doctorID: slot.doctorIDaccecp,
            patientIDs:[patientID],
            date,
            shift,
            room,
            action: "Do " + note + " Vui lòng đăng kí ca làm khác",
            createdAt: admin.firestore.Timestamp.now()
          });
          const patientSnap = await db.collection("users").doc(patientID).get();
          if (patientSnap.exists) {
            const patientEmail = patientSnap.data().email;

            const mailOptions = {
              from: 'LINH.NH18886@sinhvien.hoasen.edu.vn',
              to: patientEmail,
              subject: 'Thông báo hủy lịch hẹn khám',
              text: `Lịch khám với bác sĩ vào ngày ${date} (${shift}, phòng ${room}) đã bị hủy do: ${note}. Vui lòng đặt lại lịch hẹn mới. Xin lỗi vì sự bất tiện này.`
            };

            transporter.sendMail(mailOptions, function (error, info) {
              if (error) {
                console.error("Gửi email cho bệnh nhân thất bại:", error);
              } else {
                console.log("Email đã gửi cho bệnh nhân:", info.response);
              }
            });
          }}
        }
      }



      res.status(200).json({ message: "Shift closed successfully" });
    } catch (error) {
      console.error("Close error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });





module.exports = router;

//mfzg jvaj lkvn nmoz
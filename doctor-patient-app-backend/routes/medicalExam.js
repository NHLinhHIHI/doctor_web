// routes/medicalExam.js
const express = require('express');
const router = express.Router();
const { db } = require('../firebase');
const { Timestamp } = require('firebase-admin/firestore');
const admin = require('firebase-admin');

// GET - Lấy danh sách bệnh nhân đang chờ trong ngày với timeSlot và examinationDate
router.get('/waiting-patients', async (req, res) => {
  try {
    const { doctorId, date } = req.query;   // Lọc lịch hẹn trong ngày từ tham số date hoặc ngày hiện tại
    let filterDate = new Date();
    if (date) {
      filterDate = new Date(date);
    }

    // Đảm bảo filterDate là hợp lệ
    if (isNaN(filterDate.getTime())) {
      console.error(`Giá trị date không hợp lệ: ${date}, sử dụng ngày hiện tại thay thế`);
      filterDate = new Date();
    }

    // Tạo thời gian bắt đầu và kết thúc của ngày (sử dụng múi giờ của server)
    const todayStart = new Date(filterDate);
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date(filterDate);
    todayEnd.setHours(23, 59, 59, 999);

    console.log('Lọc lịch hẹn từ:', todayStart.toISOString(), 'đến:', todayEnd.toISOString());// Truy vấn không cần index: lấy tất cả lịch hẹn của bác sĩ có trạng thái chờ, lọc bằng JS
    let query = db.collection('HisSchedule')
      .where('doctorID', '==', doctorId)
      .where('status', '==', 'wait');
    // Sẽ lọc lại bằng JS sau khi lấy dữ liệu

    const snapshot = await query.get();


    const waitingPatients = [];

    // Lấy thông tin chi tiết của từng bệnh nhân
    for (const doc of snapshot.docs) {
      const appointment = {
        id: doc.id,
        ...doc.data()
      };      // Lọc theo examinationDate (Timestamp) để chỉ lấy lịch trong ngày được chọn
      if (appointment.examinationDate) {
        // Xử lý cả trường hợp Firestore Timestamp và Date object thông thường
        let appointmentDate;

        // Kiểm tra nếu là Firestore Timestamp
        if (appointment.examinationDate.toDate && typeof appointment.examinationDate.toDate === 'function') {
          appointmentDate = appointment.examinationDate.toDate();
        }
        // Kiểm tra nếu là timestamp dạng số
        else if (typeof appointment.examinationDate === 'number') {
          appointmentDate = new Date(appointment.examinationDate);
        }
        // Kiểm tra nếu đã là Date
        else if (appointment.examinationDate instanceof Date) {
          appointmentDate = appointment.examinationDate;
        }
        // Trường hợp khác (có thể là string)
        else {
          try {
            appointmentDate = new Date(appointment.examinationDate);
          } catch (e) {
            console.error(`Không thể chuyển đổi examinationDate sang Date: ${appointment.examinationDate}`, e);
            // Bỏ qua lịch hẹn này nếu không xác định được ngày
            continue;
          }
        }

        // Kiểm tra tính hợp lệ của appointmentDate
        if (isNaN(appointmentDate.getTime())) {
          console.error(`Ngày không hợp lệ từ examinationDate: ${appointment.examinationDate} cho lịch hẹn ${appointment.id}`);
          // Đặt một timeSlot mặc định nếu không thể xác định được ngày
          appointment.timeSlot = String(appointment.timeSlot || '00:00');
        } else {
          // Kiểm tra xem lịch hẹn có trong ngày được chọn không
          const appointmentDay = appointmentDate.toISOString().split('T')[0]; // yyyy-mm-dd
          const filterDay = filterDate.toISOString().split('T')[0];

          if (appointmentDay !== filterDay) {
            console.log(`Bỏ qua lịch hẹn ${appointment.id} vì không đúng ngày ${filterDay}`);
            continue;
          }

          // Đảm bảo có thông tin timeSlot để hiển thị giờ hẹn
          if (!appointment.timeSlot) {
            // Nếu không có timeSlot, tạo timeSlot từ examinationDate
            const hours = appointmentDate.getHours().toString().padStart(2, '0');
            const minutes = appointmentDate.getMinutes().toString().padStart(2, '0');
            appointment.timeSlot = `${hours}:${minutes}`;
            console.log(`Tạo timeSlot từ examinationDate: ${appointment.timeSlot} cho lịch hẹn ${appointment.id}`);
          } else {
            // Đảm bảo timeSlot là chuỗi
            appointment.timeSlot = String(appointment.timeSlot);
            console.log(`Sử dụng timeSlot có sẵn: ${appointment.timeSlot} (${typeof appointment.timeSlot}) cho lịch hẹn ${appointment.id}`);
          }
        }
        console.log('Appointment data:', appointment.id, {
          patientId: appointment.patientID,
          timeSlot: appointment.timeSlot,
          examinationDate: appointment.examinationDate
            ? (appointment.examinationDate.toDate
              ? appointment.examinationDate.toDate().toISOString()
              : new Date(appointment.examinationDate).toISOString())
            : null,
          status: appointment.status
        });
        // Đảm bảo có ID bệnh nhân (parentId hoặc patientId)
        const patientId = appointment.parentId || appointment.patientID;

        if (!patientId) {
          console.log(`Bỏ qua lịch hẹn ${appointment.id} vì không có ID bệnh nhân`);
          continue;
        }

        // Lấy thông tin bệnh nhân
        try {
          const patientDoc = await db.collection('users').doc(patientId).get();
          if (patientDoc.exists) {
            // Đảm bảo luôn có parentId và patientId cho frontend sử dụng
            appointment.parentId = patientId;
            appointment.patientId = patientId;

            appointment.patient = {
              id: patientDoc.id,
              ...patientDoc.data()
            };
            // Kiểm tra nếu user có Role là patient thì lấy đầy đủ thông tin từ subcollection Profile/NormalProfile
            if (patientDoc.data().Role === 'patient' || patientDoc.data().Role === 'Patient') {
              try {
                // Kiểm tra trường hợp data mới (array) trực tiếp từ user document
                if (patientDoc.data().ProfileNormal && Array.isArray(patientDoc.data().ProfileNormal)) {

                  // PatientNormal array structure: [Name, DoB, Phone, Gender, CCCD, Address]
                  if (patientDoc.data().ProfileNormal.length > 0) {
                    appointment.patient.fullName = patientDoc.data().ProfileNormal[0] || appointment.patient.fullName;
                  }
                  if (patientDoc.data().ProfileNormal.length > 1) {
                    appointment.patient.DoB = patientDoc.data().ProfileNormal[1] || appointment.patient.DoB;
                  }
                  if (patientDoc.data().ProfileNormal.length > 2) {
                    appointment.patient.phone = patientDoc.data().ProfileNormal[2] || appointment.patient.phone;
                  }
                  if (patientDoc.data().ProfileNormal.length > 3) {
                    appointment.patient.gender = patientDoc.data().ProfileNormal[3] || appointment.patient.gender;
                  }
                  if (patientDoc.data().ProfileNormal.length > 4) {
                    appointment.patient.CCCD = patientDoc.data().ProfileNormal[4] || appointment.patient.CCCD;
                  }
                  if (patientDoc.data().ProfileNormal.length > 5) {
                    appointment.patient.address = patientDoc.data().ProfileNormal[5] || appointment.patient.address;
                  }
                } else {
                  // Fallback to original subcollection access
                  const normalProfileDoc = await db.collection('users').doc(patientId).doc('ProfileNormal').get();
                  if (normalProfileDoc.exists) {
                    const normalProfileData = normalProfileDoc.data();
                    // Log để debug

                    // Lấy tất cả thông tin từ NormalProfile
                    // Tên bệnh nhân
                    if (normalProfileData.Name) {
                      appointment.patient.fullName = normalProfileData.Name;
                    }

                    // Ngày sinh
                    if (normalProfileData.DoB) {
                      appointment.patient.DoB = normalProfileData.DoB;
                    }

                    // Giới tính
                    if (normalProfileData.Gender) {
                      appointment.patient.gender = normalProfileData.Gender;
                    }

                    // Địa chỉ
                    if (normalProfileData.Address) {
                      appointment.patient.address = normalProfileData.Address;
                    }

                    // CCCD (ID card)
                    if (normalProfileData.CCCD) {
                      appointment.patient.CCCD = normalProfileData.CCCD;
                    }

                    // Số điện thoại
                    if (normalProfileData.Phone) {
                      appointment.patient.phone = normalProfileData.Phone;
                    }
                  } else {
                    console.log(`Không tìm thấy NormalProfile cho bệnh nhân ${patientId}`);
                  }
                }
                // Lấy thông tin từ HealthProfile trong user document nếu là mảng              if (patientDoc.data().HealthProfile && Array.isArray(patientDoc.data().HealthProfile)) {

                appointment.patient.healthProfile = {};
                // HealthProfile array structure: [HeartRate, Height, Eye, Weight, medicalHistory]
                if (patientDoc.data().HealthProfile.length > 0) {
                  appointment.patient.healthProfile.heartRate = patientDoc.data().HealthProfile[0] || '';
                }
                if (patientDoc.data().HealthProfile.length > 1) {
                  appointment.patient.healthProfile.height = patientDoc.data().HealthProfile[1] || '';
                }
                if (patientDoc.data().HealthProfile.length > 2) {
                  appointment.patient.healthProfile.Eye = patientDoc.data().HealthProfile[2] || '';
                }
                // Removed rightEye field in the new structure
                if (patientDoc.data().HealthProfile.length > 3) {
                  appointment.patient.healthProfile.weight = patientDoc.data().HealthProfile[3] || '';
                } if (patientDoc.data().HealthProfile.length > 4) {
                  appointment.patient.healthProfile.medicalHistory = patientDoc.data().HealthProfile[4] || '';
                }
              }

              catch (profileError) {
                console.error(`Lỗi khi lấy thông tin profile cho bệnh nhân ${patientId}:`, profileError);
              }
            }
          } else {
            console.log(`Không tìm thấy bệnh nhân với ID ${patientId}`);
          }
        } catch (error) {
          console.error(`Lỗi khi lấy thông tin bệnh nhân ${patientId}:`, error);
        }
        waitingPatients.push(appointment);
      }    // Sắp xếp bệnh nhân theo thời gian khám (timeSlot)
      
    }
    waitingPatients.sort((a, b) => {
        const timeA = String(a.timeSlot || '00:00');
        const timeB = String(b.timeSlot || '00:00');

        // Tách giờ và phút từ chuỗi, chuyển sang dạng số
        const [hoursA, minutesA] = timeA.split(':').map(Number);
        const [hoursB, minutesB] = timeB.split(':').map(Number);

        // So sánh giờ trước
        if (hoursA !== hoursB) {
          return hoursA - hoursB; // Trả về hiệu số của giờ
        }

        // Nếu giờ bằng nhau thì so sánh phút
        return minutesA - minutesB; // Trả về hiệu số của phút
      });
      console.log(`Đã lọc và sắp xếp ${waitingPatients.length} bệnh nhân đang chờ`);
      console.log('Danh sách ID đã sắp xếp theo thứ tự:', waitingPatients.map(patient => patient.id));
      res.json({
        success: true,
        date: filterDate.toISOString().split('T')[0], // Trả về ngày đã lọc
        waitingPatients
      });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách bệnh nhân đang chờ:", error);

    // Kiểm tra xem header đã được gửi chưa trước khi gửi lỗi
    if (res.headersSent) {
      console.error("Lỗi sau khi header đã được gửi đi:", error);
      return;
    }
    

    // Gửi response lỗi và KẾT THÚC hàm
    res.status(500).json({
      success: false,
      error: "Lỗi server khi lấy danh sách bệnh nhân đang chờ: " + error.message
    });
  }
});

// POST - Lưu thông tin khám bệnh và đơn thuốc
router.post('/', async (req, res) => {
  try {
    const {
      appointmentId,
      patientId,
      doctorId,
      diagnosis,
      symptoms,
      notes,
      reExamDate,
      medications
    } = req.body;

    // 1. Validate đầu vào
    if (!doctorId || !diagnosis) {
      return res.status(400).json({
        success: false,
        error: "Thiếu thông tin bác sĩ hoặc chẩn đoán."
      });
    }

    if (!medications || !Array.isArray(medications) || medications.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Cần có ít nhất một loại thuốc."
      });
    }

    const validMedications = medications.filter(med => med.medicineName && med.medicineName.trim() !== "");
    if (validMedications.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Không có thuốc nào có tên hợp lệ."
      });
    }

    // 2. Tạo document mới trong collection "examinations"
    const examinationRef = db.collection('examinations').doc();
    const examinationData = {
      appointmentId: appointmentId || "", // Có thể không có nếu là khám trực tiếp
      patientId: patientId, // ID của bệnh nhân
      doctorId: doctorId, // ID của bác sĩ
      diagnosis: diagnosis, // Chẩn đoán
      symptoms: symptoms || "", // Triệu chứng lúc khám
      notes: notes || "", // Ghi chú thêm
      examinationDate: Timestamp.now(), // Ngày giờ khám
      reExamDate: reExamDate ? Timestamp.fromDate(new Date(reExamDate)) : null, // Ngày tái khám (nếu có)
      medications: medications // Lưu trực tiếp mảng medications
    };

    await examinationRef.set(examinationData);

    // 3. (Tùy chọn) Cập nhật trạng thái của lịch hẹn (nếu có appointmentId)
    if (appointmentId) {
      const appointmentRef = db.collection('HisSchedule').doc(appointmentId);
      await appointmentRef.update({ status: 'completed' });
    }

    // 4. Trả về response thành công
    res.status(201).json({
      success: true,
      message: "Đã lưu kết quả khám và đơn thuốc thành công.",
      examinationId: examinationRef.id
    });

  } catch (error) {
    console.error("Lỗi khi lưu kết quả khám:", error);
    return res.status(500).json({
      success: false,
      error: "Lỗi server khi lưu kết quả khám: " + error.message
    });
  }
});

// GET - Lấy thông tin khám bệnh theo ID
router.get('/:examinationId', async (req, res) => {
  try {
    const { examinationId } = req.params;

    // Get examination document
    const examinationRef = db.collection('examinations').doc(examinationId);
    const examinationDoc = await examinationRef.get();

    if (!examinationDoc.exists) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy bản ghi khám bệnh"
      });
    }

    const examination = examinationDoc.data();

    // Get prescriptions from the subcollection
    const prescriptionsSnapshot = await examinationRef.collection('prescription').get();

    const prescriptions = [];
    prescriptionsSnapshot.forEach(doc => {
      prescriptions.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Return combined data
    res.json({
      success: true,
      examination: {
        id: examinationDoc.id,
        ...examination
      },
      prescriptions
    });

  } catch (error) {
    console.error("Lỗi khi lấy thông tin khám bệnh:", error);
    res.status(500).json({
      success: false,
      error: "Lỗi server khi lấy thông tin khám bệnh: " + error.message
    });
  }
});

// GET - Danh sách các lần khám của một bệnh nhân
router.get('/examination-history/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    if (!patientId) {
      return res.status(400).json({
        success: false,
        error: "ID bệnh nhân không được cung cấp"
      });
    }

    console.log(`Đang lấy lịch sử khám của bệnh nhân ID: ${patientId}`);



    // Lấy các bản ghi khám từ collection examinations
    // Lấy tất cả bản ghi khám của bệnh nhân mà không cần orderBy (không cần index)
    const examinationsSnapshot = await db.collection('examinations')
      .where('patientId', '==', patientId)
      .get();

    const examinations = [];

    for (const doc of examinationsSnapshot.docs) {
      const examination = {
        id: doc.id,
        name: doc.data().name || '', // Tên khám (nếu có)
        ...doc.data()
      };

      // Chuyển đổi Timestamp sang Date
      if (examination.examinationDate && examination.examinationDate.toDate) {
        examination.examinationDate = examination.examinationDate.toDate();
      }

      if (examination.reExamDate && examination.reExamDate.toDate) {
        examination.reExamDate = examination.reExamDate.toDate();
      }

      // Lấy thông tin bác sĩ
      if (examination.doctorId) {
        try {
          const doctorDoc = await db.collection('users').doc(examination.doctorId).get();
          if (doctorDoc.exists) {
            const doctorData = doctorDoc.data();
            examination.doctorName = doctorData.displayName || doctorData.name || 'Không xác định';
            examination.doctorSpecialty = doctorData.specialty || '';
          } else {
            examination.doctorName = 'Bác sĩ không tồn tại';
            examination.doctorSpecialty = '';
            console.warn(`Lịch sử khám: Không tìm thấy bác sĩ với ID ${examination.doctorId} trong collection 'users'.`);
          }
        } catch (error) {
          console.error(`Lỗi khi lấy thông tin bác sĩ ${examination.doctorId} cho lịch sử khám: ${error}`);
          examination.doctorName = 'Lỗi truy vấn thông tin BS';
          examination.doctorSpecialty = '';
        }
      } else {
        examination.doctorName = 'Không có thông tin bác sĩ';
        examination.doctorSpecialty = '';
        console.warn(`Lịch sử khám: Thiếu doctorId cho bản ghi khám ID ${examination.id}.`);
      }

      // Đơn thuốc (medications) giờ đã là một trường trực tiếp của examination document.
      // Đảm bảo nó là một mảng, nếu không có thì là mảng rỗng.
      examination.medications = Array.isArray(examination.medications) ? examination.medications : [];

      // Xóa logic cũ lấy prescriptions từ subcollection (nếu còn)
      delete examination.prescriptions; // Xóa trường prescriptions cũ nếu có

      examinations.push(examination);
    }
    // Sắp xếp lại theo thời gian khám (mới nhất lên đầu) trong trường hợp không dùng orderBy trong truy vấn
    examinations.sort((a, b) => {
      // Nếu không có ngày khám, đặt ngày đó về thời điểm xa nhất trong quá khứ
      const dateA = a.examinationDate ? new Date(a.examinationDate) : new Date(0);
      const dateB = b.examinationDate ? new Date(b.examinationDate) : new Date(0);
      return dateB - dateA; // Sắp xếp giảm dần (mới nhất lên đầu)
    });

    console.log("---------- EXAMINATION HISTORY - RESPONSE DATA ----------");
    console.log(`Number of examinations found: ${examinations.length}`);
    if (examinations.length > 0) {
      console.log("First examination:", {
        id: examinations[0].id,
        examinationDate: examinations[0].examinationDate,
        diagnosis: examinations[0].diagnosis,
        doctorName: examinations[0].doctorName,
      });

      // Check if medications array exists and was renamed to prescriptions
      console.log("Medications data:", examinations[0].medications ?
        `Found ${examinations[0].medications.length} medications` :
        "No medications found");
    }

    res.json({
      success: true,
      examinations
    });

  } catch (error) {
    console.error(`Lỗi khi lấy lịch sử khám: ${error}`);
    res.status(500).json({
      success: false,
      error: `Lỗi khi lấy lịch sử khám: ${error.message}`
    });
  }
});

// GET - Kiểm tra cấu trúc dữ liệu bệnh nhân cho mục đích debug
router.get('/check-patient-structure/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;

    if (!patientId) {
      return res.status(400).json({
        success: false,
        error: "Thiếu ID bệnh nhân"
      });
    }

    // Lấy thông tin người dùng từ Firestore
    const patientDoc = await db.collection('users').doc(patientId).get();

    if (!patientDoc.exists) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy bệnh nhân"
      });
    }

    const patientData = patientDoc.data();

    // Check for ProfileNormal and HealthProfile in main document
    const hasProfileNormalArray = Array.isArray(patientData.ProfileNormal);
    const hasHealthProfileArray = Array.isArray(patientData.HealthProfile);

    // Check subcollections for fallback
    let subcollectionProfiles = { normalProfile: null, healthProfile: null };

    try {
      const normalProfileDoc = await db.collection('users').doc(patientId).collection('Profile').doc('NormalProfile').get();
      if (normalProfileDoc.exists) {
        subcollectionProfiles.normalProfile = normalProfileDoc.data();
      }

      const healthProfileDoc = await db.collection('users').doc(patientId).collection('Profile').doc('HealthProfile').get();
      if (healthProfileDoc.exists) {
        subcollectionProfiles.healthProfile = healthProfileDoc.data();
      }
    } catch (error) {
      console.error("Lỗi khi lấy subcollection:", error);
    }

    res.json({
      success: true,
      patientId,
      dataStructure: {
        mainDocument: {
          hasProfileNormalArray,
          profileNormalValue: patientData.ProfileNormal || null,
          hasHealthProfileArray,
          healthProfileValue: patientData.HealthProfile || null,
          role: patientData.Role || null,
        },
        subcollections: subcollectionProfiles
      }
    });

  } catch (error) {
    console.error("Lỗi khi kiểm tra cấu trúc dữ liệu bệnh nhân:", error);
    res.status(500).json({
      success: false,
      error: "Lỗi server: " + error.message
    });
  }
});


module.exports = router;
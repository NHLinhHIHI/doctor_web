const express = require("express");
const router = express.Router();
const { db } = require("../firebase");

router.get("/list/all", async (req, res) => {
  try {
    let patientsSnapshot = await db
      .collection("users")
      .where("Role", "==", "patient")
      .get();

    const patients = [];

    for (const doc of patientsSnapshot.docs) {
      const patientData = doc.data();
      const id = doc.id;

      // Skip nếu không phải patient thật sự
      if (patientData.Role !== "patient" && patientData.role !== "patient") continue;

      // Normal Profile
      let normalProfileData = {};
      let hasNormalProfile = false;
      try {
        const normalDoc = await db.collection("users").doc(id).collection("Profile").doc("NormalProfile").get();
        if (normalDoc.exists) {
          normalProfileData = normalDoc.data();
          hasNormalProfile = true;
        }
      } catch (err) {
        console.error(`NormalProfile Error (${id}):`, err);
      }

      // Health Profile
      let healthProfileData = {};
      let hasHealthProfile = false;
      try {
        const healthDoc = await db.collection("users").doc(id).collection("Profile").doc("HealthProfile").get();
        if (healthDoc.exists) {
          healthProfileData = healthDoc.data();
          hasHealthProfile = true;
        }
      } catch (err) {
        console.error(`HealthProfile Error (${id}):`, err);
      }

      // BMI
      let bmi = null;
      if (healthProfileData.Height && healthProfileData.Weight) {
        const h = parseFloat(healthProfileData.Height);
        const w = parseFloat(healthProfileData.Weight);
        if (!isNaN(h) && !isNaN(w) && h > 0) {
          const hM = h > 3 ? h / 100 : h;
          bmi = (w / (hM * hM)).toFixed(1);
        }
      }

      // Allergies
      let allergiesData = [];
      try {
        const allergiesDoc = await db.collection("users").doc(id).collection("MedicalData").doc("Allergies").get();
        if (allergiesDoc.exists) {
          const aData = allergiesDoc.data();
          allergiesData = aData.items || [];
        }
      } catch (err) {
        console.error(`Allergies Error (${id}):`, err);
      }

      // Medical Exams
      let medicalExams = [];
      try {
        const examSnap = await db.collection("users").doc(id).collection("MedicalExams").orderBy("date", "desc").limit(10).get();
        examSnap.forEach(exam => {
          const d = exam.data();
          medicalExams.push({
            id: exam.id,
            date: d.date,
            diagnosis: d.diagnosis || "Không có chẩn đoán",
            doctor: d.doctorName || "Không xác định",
            prescription: d.prescriptions || [],
            notes: d.notes || "Không có ghi chú"
          });
        });
      } catch (err) {
        console.error(`MedicalExams Error (${id}):`, err);
      }

      // Appointments
      let upcomingAppointments = [];
      try {
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const appointmentsSnap = await db.collection("appointments").where("patientId", "==", id).get();

        const filtered = [];
        appointmentsSnap.forEach(a => {
          const data = a.data();
          if (data.date && data.date >= today) {
            filtered.push({
              id: a.id,
              date: data.date,
              time: data.time || "Chưa xác định",
              doctor: data.doctorName || "Chưa xác định",
              department: data.department || "Khoa khám bệnh",
              status: data.status || "Đã đặt lịch"
            });
          }
        });

        upcomingAppointments = filtered.sort((a, b) => {
          if (a.date === b.date) return a.time.localeCompare(b.time);
          return a.date.localeCompare(b.date);
        });
      } catch (err) {
        console.error(`Appointments Error (${id}):`, err);
      }

      // Lab Results
      let labResults = [];
      try {
        const labSnap = await db.collection("users").doc(id).collection("LabResults").orderBy("date", "desc").limit(5).get();
        labSnap.forEach(lab => {
          const l = lab.data();
          labResults.push({
            id: lab.id,
            date: l.date || "Không có ngày",
            testName: l.testName || "Không có tên xét nghiệm",
            result: l.result || "Không có kết quả",
            notes: l.notes || "Không có ghi chú"
          });
        });
      } catch (err) {
        console.error(`LabResults Error (${id}):`, err);
      }

      // Tạo đối tượng patient
      const patient = {
        id: id,
        name: patientData.ProfileNormal?.[0] || normalProfileData.Name || patientData.name || "Không có tên",
        gender: patientData.ProfileNormal?.[3] || normalProfileData.Gender || "Không xác định",
        birthDate: patientData.ProfileNormal?.[1] || normalProfileData.DoB || "",
        phone: patientData.ProfileNormal?.[2] || normalProfileData.Phone || patientData.phone || "",
        cccd: patientData.ProfileNormal?.[4] || "",
        address: patientData.ProfileNormal?.[5] || normalProfileData.Address || "",
        email: patientData.email || "",
        profileImage: patientData.profileImage || null,
        ProfileNormal: patientData.ProfileNormal || null,

        vitalSigns: {
          height: healthProfileData.Height || "N/A",
          weight: healthProfileData.Weight || "N/A",
          heartRate: healthProfileData.HearthRate || healthProfileData.HeartRate || "N/A",
          leftEye: healthProfileData.LeftEye || "N/A",
          rightEye: healthProfileData.RightEye || "N/A",
          bmi: bmi || "N/A",
          bloodPressure: healthProfileData.BloodPressure || "N/A",
          temperature: healthProfileData.Temperature || "N/A",
          respiratoryRate: healthProfileData.RespiratoryRate || "N/A",
          bloodType: healthProfileData.BloodType || "N/A"
        },

        allergies: allergiesData,
        examinations: medicalExams,
        upcomingAppointments: upcomingAppointments,
        labResults: labResults,

        hasNormalProfile,
        hasHealthProfile,

        lastVisit: patientData.lastVisit || null
      };

      patients.push(patient);
    }

    return res.json({
      success: true,
      patients
    });

  } catch (error) {
    console.error("Lỗi server khi lấy danh sách bệnh nhân:", error);
    return res.status(500).json({
      success: false,
      error: "Lỗi server khi lấy danh sách bệnh nhân: " + error.message
    });
  }
});

// Route để lấy thông tin chi tiết của một bệnh nhân cụ thể
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    // Lấy thông tin cơ bản của bệnh nhân từ collection users
    const patientDoc = await db.collection("users").doc(id).get();

    if (!patientDoc.exists) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy bệnh nhân với ID đã cung cấp"
      });
    }

    const patientData = patientDoc.data();
    
    // Kiểm tra nếu đúng là bệnh nhân - kiểm tra cả hai trường role và Role
    if (patientData.role !== "patient" && patientData.Role !== "patient") {
      return res.status(403).json({
        success: false,
        error: "ID đã cung cấp không phải là của bệnh nhân"
      });
    }
    
    // Lấy hồ sơ thông tin cá nhân (NormalProfile)
    let normalProfileData = {};
    let hasNormalProfile = false;
    
    try {
      const normalProfileDoc = await db
        .collection("users")
        .doc(id)
        .collection("Profile")
        .doc("NormalProfile")
        .get();
        
      if (normalProfileDoc.exists) {
        normalProfileData = normalProfileDoc.data();
        hasNormalProfile = true;
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin NormalProfile:", error);
    }
    
    // Lấy hồ sơ sức khỏe (HealthProfile)
    let healthProfileData = {};
    let hasHealthProfile = false;
    
    try {
      const healthProfileDoc = await db
        .collection("users")
        .doc(id)
        .collection("Profile")
        .doc("HealthProfile")
        .get();
        
      if (healthProfileDoc.exists) {
        healthProfileData = healthProfileDoc.data();
        hasHealthProfile = true;
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin HealthProfile:", error);
    }
    
    // Tính BMI
    let bmi = null;
    if (healthProfileData.Height && healthProfileData.Weight) {
      const heightValue = parseFloat(healthProfileData.Height);
      const weightValue = parseFloat(healthProfileData.Weight);
      if (!isNaN(heightValue) && !isNaN(weightValue) && heightValue > 0) {
        const heightInM = heightValue > 3 ? heightValue / 100 : heightValue; // Giả sử Height > 3 là cm
        bmi = (weightValue / (heightInM * heightInM)).toFixed(1);
      }
    }
    
    // Lấy dữ liệu dị ứng (nếu có)
    let allergiesData = [];
    try {
      const allergiesDoc = await db
        .collection("users")
        .doc(id)
        .collection("MedicalData")
        .doc("Allergies")
        .get();
        
      if (allergiesDoc.exists) {
        const data = allergiesDoc.data();
        allergiesData = data.items || [];
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin về dị ứng:", error);
    }
    
    // Lấy lịch sử khám bệnh
    let medicalExams = [];
    try {
      const examsSnapshot = await db
        .collection("users")
        .doc(id)
        .collection("MedicalExams")
        .orderBy("date", "desc") // Sắp xếp theo ngày giảm dần (mới nhất trước)
        .limit(10) // Giới hạn 10 lần khám gần nhất
        .get();
        
      if (!examsSnapshot.empty) {
        examsSnapshot.forEach(doc => {
          const examData = doc.data();
          medicalExams.push({
            id: doc.id,
            date: examData.date,
            diagnosis: examData.diagnosis || "Không có chẩn đoán",
            doctor: examData.doctorName || "Không xác định",
            prescription: examData.prescriptions || [],
            notes: examData.notes || "Không có ghi chú"
          });
        });
      }
    } catch (error) {
      console.error("Lỗi khi lấy lịch sử khám bệnh:", error);
    }
    
    // Lấy lịch hẹn sắp tới
    let upcomingAppointments = [];
    try {
      const now = new Date();
      const todayDateString = now.toISOString().split('T')[0];
      
      // Sửa lại truy vấn để tránh sử dụng chỉ mục tổng hợp
      // Chỉ dùng một where clause và không orderBy
      const appointmentsSnapshot = await db
        .collection("appointments")
        .where("patientId", "==", id)
        .get();
      
      if (!appointmentsSnapshot.empty) {
        // Lọc các lịch hẹn trong tương lai và sắp xếp chúng trong bộ nhớ
        const filteredAppointments = [];
        appointmentsSnapshot.forEach(doc => {
          const aptData = doc.data();
          // Chỉ lấy các lịch hẹn từ ngày hiện tại trở đi
          if (aptData.date && aptData.date >= todayDateString) {
            filteredAppointments.push({
              id: doc.id,
              date: aptData.date,
              time: aptData.time || "Chưa xác định",
              doctor: aptData.doctorName || "Chưa xác định",
              department: aptData.department || "Khoa khám bệnh",
              status: aptData.status || "Đã đặt lịch"
            });
          }
        });
        
        // Sắp xếp lịch hẹn trong bộ nhớ (không phải trong Firestore)
        upcomingAppointments = filteredAppointments.sort((a, b) => {
          // Sắp xếp theo ngày tăng dần
          if (a.date === b.date) {
            // Nếu cùng ngày, sắp xếp theo giờ
            return a.time.localeCompare(b.time);
          }
          return a.date.localeCompare(b.date);
        });
      }
    } catch (error) {
      console.error("Lỗi khi lấy lịch hẹn:", error);
    }
    
    // Lấy kết quả xét nghiệm
    let labResults = [];
    try {
      const labResultsSnapshot = await db
        .collection("users")
        .doc(id)
        .collection("LabResults")
        .orderBy("date", "desc")
        .limit(5) // Giới hạn 5 kết quả mới nhất
        .get();
      
      if (!labResultsSnapshot.empty) {
        labResultsSnapshot.forEach(doc => {
          const labData = doc.data();
          labResults.push({
            id: doc.id,
            date: labData.date || "Không có ngày",
            testName: labData.testName || "Không có tên xét nghiệm",
            result: labData.result || "Không có kết quả",
            notes: labData.notes || "Không có ghi chú"
          });
        });
      }
    } catch (error) {
      console.error("Lỗi khi lấy kết quả xét nghiệm:", error);
    }
      // Chuẩn bị dữ liệu để trả về
    const patient = {
      id: id,
      name: patientData.ProfileNormal && Array.isArray(patientData.ProfileNormal) && patientData.ProfileNormal.length > 0 
          ? patientData.ProfileNormal[0] 
          : (normalProfileData.Name || patientData.name || "Không có tên"),
      gender: patientData.ProfileNormal && Array.isArray(patientData.ProfileNormal) && patientData.ProfileNormal.length > 3 
          ? patientData.ProfileNormal[3] 
          : (normalProfileData.Gender || "Không xác định"),
      birthDate: patientData.ProfileNormal && Array.isArray(patientData.ProfileNormal) && patientData.ProfileNormal.length > 1 
          ? patientData.ProfileNormal[1] 
          : (normalProfileData.DoB || ""),
      phone: patientData.ProfileNormal && Array.isArray(patientData.ProfileNormal) && patientData.ProfileNormal.length > 2 
          ? patientData.ProfileNormal[2] 
          : (normalProfileData.Phone || patientData.phone || ""),
      cccd: patientData.ProfileNormal && Array.isArray(patientData.ProfileNormal) && patientData.ProfileNormal.length > 4 
          ? patientData.ProfileNormal[4] 
          : "",
      address: patientData.ProfileNormal && Array.isArray(patientData.ProfileNormal) && patientData.ProfileNormal.length > 5 
          ? patientData.ProfileNormal[5] 
          : (normalProfileData.Address || ""),
      email: patientData.email || "", // Email từ users
      profileImage: patientData.profileImage || null, // Ảnh đại diện từ users
      
      // Save the original ProfileNormal array for frontends that can work with it directly
      ProfileNormal: patientData.ProfileNormal || null,
      
      vitalSigns: {
        height: healthProfileData.Height || "N/A",
        weight: healthProfileData.Weight || "N/A",
        heartRate: healthProfileData.HearthRate || healthProfileData.HeartRate || "N/A",
        leftEye: healthProfileData.LeftEye || "N/A",
        rightEye: healthProfileData.RightEye || "N/A",
        bmi: bmi || "N/A",
        bloodPressure: healthProfileData.BloodPressure || "N/A",
        temperature: healthProfileData.Temperature || "N/A",
        respiratoryRate: healthProfileData.RespiratoryRate || "N/A",
        bloodType: healthProfileData.BloodType || "N/A"
      },
      
      // Dữ liệu đã truy vấn
      allergies: allergiesData,
      examinations: medicalExams,
      upcomingAppointments: upcomingAppointments,
      labResults: labResults,
      
      // Cờ trạng thái hồ sơ
      hasNormalProfile,
      hasHealthProfile,
      
      // Thông tin bổ sung
      lastVisit: patientData.lastVisit || null,
    };
    
    return res.json({
      success: true,
      patient
    });
    
  } catch (error) {
    console.error("Lỗi server khi lấy thông tin chi tiết bệnh nhân:", error);
    return res.status(500).json({
      success: false,
      error: "Lỗi server khi lấy thông tin chi tiết bệnh nhân: " + error.message
    });
  }
});

// ... (các routes khác của patient.js)
module.exports = router;
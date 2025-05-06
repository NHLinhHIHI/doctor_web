import React, { useState, useEffect } from 'react';
import './medicalExam.css';
import { FaPlus, FaTrash, FaPrint, FaSave, FaUndo, FaStethoscope, FaUserInjured, FaArrowRight, FaSearch } from 'react-icons/fa';
import 'E:/workspace/DoAnChuyenNganhA/doctor_web/doctor-patient-app-backend/routes/medicalExam.js'


const MedicalExam = () => {
  // State để hiển thị form khám bệnh hoặc danh sách chờ
  const [showPatientList, setShowPatientList] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [waitingPatients, setWaitingPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  // State cho thông tin bệnh nhân
  const [patientInfo, setPatientInfo] = useState({
    name: '',
    age: '',
    gender: '',
    symptoms: ''
  });

  // State cho chẩn đoán
  const [diagnosis, setDiagnosis] = useState('');

  // State cho đơn thuốc
  const [medications, setMedications] = useState([
    { name: '', dosage: '', quantity: '', frequency: '' }
  ]);

  // State cho ghi chú
  const [notes, setNotes] = useState('');
  
  // Lấy danh sách bệnh nhân đang chờ từ Firestore
  // useEffect(() => {
  //   const fetchWaitingPatients = async () => {
  //     try {
  //       setLoading(true);
        
  //       // Lấy dữ liệu từ collection "examinations"
  //       const examinationsRef = collection(db, "examinations");
        
  //       // Lấy danh sách các cuộc hẹn khám cho ngày hiện tại
  //       const today = new Date();
  //       const formattedDate = today.toLocaleDateString('vi-VN');
        
  //       const examinationsSnapshot = await getDocs(examinationsRef);
        
  //       // Chuyển đổi Firestore Documents thành dữ liệu sử dụng
  //       const patientsData = examinationsSnapshot.docs.map(doc => {
  //         const data = doc.data();
  //         return {
  //           id: doc.id,
  //           name: data.patientName || "Bệnh nhân",
  //           age: data.age || 30,
  //           gender: data.gender || "Nam",
  //           symptoms: data.symptoms || "Chưa có triệu chứng",
  //           waitingSince: data.appointmentTime || "08:00",
  //           docRef: doc.ref
  //         };
  //       });
        
  //       setWaitingPatients(patientsData);
  //       setLoading(false);
  //     } catch (error) {
  //       console.error('Lỗi khi lấy danh sách bệnh nhân chờ:', error);
  //       setLoading(false);
  //     }
  //   };
    
  //   fetchWaitingPatients();
  // }, []);

  // Xử lý tìm kiếm bệnh nhân
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Lọc danh sách bệnh nhân theo từ khóa tìm kiếm
  const filteredPatients = waitingPatients.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Xử lý chọn bệnh nhân để khám
  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setPatientInfo({
      name: patient.name,
      age: patient.age.toString(),
      gender: patient.gender,
      symptoms: patient.symptoms
    });
    setShowPatientList(false);
  };

  // Quay lại danh sách bệnh nhân
  const handleBackToList = () => {
    setShowPatientList(true);
    resetForm();
  };

  // Xử lý thay đổi thông tin bệnh nhân
  const handlePatientInfoChange = (e) => {
    const { name, value } = e.target;
    setPatientInfo({
      ...patientInfo,
      [name]: value
    });
  };

  // Xử lý thay đổi thông tin thuốc
  const handleMedicationChange = (index, e) => {
    const { name, value } = e.target;
    const updatedMedications = [...medications];
    updatedMedications[index] = {
      ...updatedMedications[index],
      [name]: value
    };
    setMedications(updatedMedications);
  };

  // Thêm một loại thuốc mới
  const addMedication = () => {
    setMedications([
      ...medications,
      { name: '', dosage: '', quantity: '', frequency: '' }
    ]);
  };

  // Xóa một loại thuốc
  const removeMedication = (index) => {
    if (medications.length === 1) return; // Giữ ít nhất 1 loại thuốc
    const updatedMedications = [...medications];
    updatedMedications.splice(index, 1);
    setMedications(updatedMedications);
  };

  // Lưu đơn thuốc vào Firebase Firestore
  // const savePrescription = async () => {
  //   try {
  //     // Lấy thông tin bác sĩ từ localStorage
  //     const doctor = JSON.parse(localStorage.getItem('user')) || { id: 'unknown' };
      
  //     // ID cho collection "examinations"
  //     const examinationId = selectedPatient?.id || `jUS8mz8pXMNaED61VZvb_${Date.now()}`;
      
  //     // 1. Tạo hoặc cập nhật document trong collection "examinations"
  //     const examinationRef = doc(db, "examinations", examinationId);
  //     await setDoc(examinationRef, {
  //       patientId: `${selectedPatient?.id || "unknown"}`,
  //       doctorId: doctor.id,
  //       symptoms: patientInfo.symptoms,
  //       diagnosis: diagnosis,
  //       examinationDate: Timestamp.now(),
  //       notes: notes,
  //       reExamDate: Timestamp.fromDate(new Date(new Date().setDate(new Date().getDate() + 2))) // 2 ngày sau 
  //     }, { merge: true });

  //     // 2. Tạo document mới trong collection "prescription" 
  //     const prescriptionData = {
  //       appointmentId: "",
  //       diagnosis: diagnosis,
  //       doctorId: doctor.id,
  //       examinationDate: Timestamp.now(),
  //       notes: notes,
  //       patientId: `${selectedPatient?.id || "unknown"}`,
  //     };
      
  //     const prescriptionRef = collection(db, "prescription");
  //     const newPrescriptionDoc = await addDoc(prescriptionRef, prescriptionData);
      
  //     // 3. Thêm từng loại thuốc vào prescription
  //     const medicationsCollection = collection(newPrescriptionDoc, "medications");
      
  //     // Thêm mỗi loại thuốc vào collection con "medications"
  //     for (const medication of medications) {
  //       if (medication.name.trim() !== '') {
  //         await addDoc(medicationsCollection, {
  //           idMedicine: medication.name,
  //           quality: medication.quantity,
  //           usage: medication.frequency
  //         });
  //       }
  //     }
      
  //     alert('Đã lưu đơn thuốc thành công!');
      
  //     // Cập nhật danh sách bệnh nhân chờ (xóa bệnh nhân đã khám)
  //     const updatedWaitingList = waitingPatients.filter(patient => patient.id !== selectedPatient.id);
  //     setWaitingPatients(updatedWaitingList);
      
  //     // Quay lại danh sách chờ
  //     handleBackToList();
      
  //   } catch (error) {
  //     console.error('Lỗi khi lưu đơn thuốc:', error);
  //     alert('Đã xảy ra lỗi khi lưu đơn thuốc!');
  //   }
  // };

  // In đơn thuốc
  const printPrescription = () => {
    window.print();
  };

  // Reset form
  const resetForm = () => {
    setPatientInfo({
      name: '',
      age: '',
      gender: '',
      symptoms: ''
    });
    setDiagnosis('');
    setMedications([{ name: '', dosage: '', quantity: '', frequency: '' }]);
    setNotes('');
    setSelectedPatient(null);
  };

  return (
    <div className="medical-exam-container">
      {showPatientList ? (
        // Hiển thị danh sách bệnh nhân chờ
        <div className="waiting-patients-container">
          <h2><FaUserInjured className="section-icon" /> Danh sách bệnh nhân chờ khám</h2>
          
          <div className="search-container">
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Tìm kiếm bệnh nhân..."
                value={searchTerm}
                onChange={handleSearch}
                className="search-input"
              />
            </div>
            <div className="patient-count">
              {filteredPatients.length} bệnh nhân đang chờ
            </div>
          </div>
          
          <div className="waiting-list">
            <div className="patient-list-header">
              <div className="patient-name-header">Tên bệnh nhân</div>
              <div className="patient-age-header">Tuổi</div>
              <div className="patient-gender-header">Giới tính</div>
              <div className="patient-symptoms-header">Triệu chứng</div>
              <div className="patient-waiting-time-header">Thời gian chờ</div>
              <div className="patient-action-header"></div>
            </div>
            
            {loading ? (
              <div className="loading-message">Đang tải dữ liệu bệnh nhân...</div>
            ) : filteredPatients.length > 0 ? (
              filteredPatients.map(patient => (
                <div className="patient-list-item" key={patient.id}>
                  <div className="patient-name">{patient.name}</div>
                  <div className="patient-age">{patient.age}</div>
                  <div className="patient-gender">{patient.gender}</div>
                  <div className="patient-symptoms">{patient.symptoms}</div>
                  <div className="patient-waiting-time">{patient.waitingSince}</div>
                  <div className="patient-action">
                    <button 
                      className="examine-btn" 
                      onClick={() => handleSelectPatient(patient)}
                    >
                      Khám <FaArrowRight />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-patients">Không có bệnh nhân nào trong danh sách chờ</div>
            )}
          </div>
        </div>
      ) : (
        // Hiển thị form khám bệnh
        <>
          <div className="medical-exam-header">
            <h2>Khám Bệnh</h2>
            <button className="back-to-list-btn" onClick={handleBackToList}>
              Quay lại danh sách
            </button>
          </div>

          {/* Thông tin bệnh nhân */}
          <div className="patient-info-section">
            <div className="form-row">
              <div className="form-group full-width">
                <label className="form-label">Thông tin bệnh nhân</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Tên bệnh nhân"
                  value={patientInfo.name}
                  onChange={handlePatientInfoChange}
                  className="form-control"
                />
              </div>
            </div>

            <div className="patient-age-gender-row">
              <div className="form-group age-group">
                <span className="floating-label">Tuổi</span>
                <input
                  type="text"
                  id="age"
                  name="age"
                  placeholder="Tuổi"
                  value={patientInfo.age}
                  onChange={handlePatientInfoChange}
                  className="form-control age-input"
                />
              </div>

              <div className="form-group gender-group">
                <span className="floating-label">Giới tính</span>
                <select
                  id="gender"
                  name="gender"
                  value={patientInfo.gender}
                  onChange={handlePatientInfoChange}
                  className="form-control gender-select"
                >
                  <option value="">Chọn giới tính</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>

              <div className="form-group full-width">
                <span className="floating-label">Triệu chứng</span>
                <input
                  type="text"
                  id="symptoms"
                  name="symptoms"
                  placeholder="Triệu chứng"
                  value={patientInfo.symptoms}
                  onChange={handlePatientInfoChange}
                  className="form-control"
                />
              </div>
            </div>
          </div>

          {/* Chẩn đoán của bác sĩ */}
          <div className="diagnosis-section">
            <h3>
              <FaStethoscope className="section-icon" /> Chẩn đoán
            </h3>
            <div className="form-row">
              <div className="form-group full-width">
                <textarea
                  placeholder="Nhập chẩn đoán của bác sĩ"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="form-control"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Đơn thuốc */}
          <div className="prescription-section">
            <h3>Đơn thuốc</h3>
            
            <div className="medication-header">
              <div className="medication-name">Tên thuốc</div>
              <div className="medication-dosage">Liều lượng</div>
              <div className="medication-quantity">Số lượng</div>
              <div className="medication-frequency">Lần/ngày</div>
              <div className="medication-action"></div>
            </div>

            {medications.map((medication, index) => (
              <div className="medication-row" key={index}>
                <div className="medication-name">
                  <input
                    type="text"
                    name="name"
                    placeholder="Tên thuốc"
                    value={medication.name}
                    onChange={(e) => handleMedicationChange(index, e)}
                    className="form-control"
                  />
                </div>
                <div className="medication-dosage">
                  <input
                    type="text"
                    name="dosage"
                    placeholder="Liều lượng"
                    value={medication.dosage}
                    onChange={(e) => handleMedicationChange(index, e)}
                    className="form-control"
                  />
                </div>
                <div className="medication-quantity">
                  <input
                    type="text"
                    name="quantity"
                    placeholder="Số lượng"
                    value={medication.quantity}
                    onChange={(e) => handleMedicationChange(index, e)}
                    className="form-control"
                  />
                </div>
                <div className="medication-frequency">
                  <input
                    type="text"
                    name="frequency"
                    placeholder="Lần/ngày"
                    value={medication.frequency}
                    onChange={(e) => handleMedicationChange(index, e)}
                    className="form-control"
                  />
                </div>
                <div className="medication-action">
                  <button 
                    className="remove-btn"
                    onClick={() => removeMedication(index)}
                    disabled={medications.length === 1}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}

            <div className="add-medication">
              <button className="add-btn" onClick={addMedication}>
                <FaPlus /> Thêm thuốc
              </button>
            </div>
          </div>

          {/* Ghi chú */}
          <div className="notes-section">
            <h3>Ghi chú</h3>
            <textarea
              placeholder="Ghi chú bổ sung"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="form-control"
              rows={3}
            />
          </div>

          {/* Các nút chức năng */}
          <div className="action-buttons">
            <button className="save-btn" onClick={savePrescription}>
              <FaSave /> Lưu đơn thuốc
            </button>
            <button className="print-btn" onClick={printPrescription}>
              <FaPrint /> In đơn thuốc
            </button>
            <button className="reset-btn" onClick={resetForm}>
              <FaUndo /> Làm mới
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default MedicalExam;
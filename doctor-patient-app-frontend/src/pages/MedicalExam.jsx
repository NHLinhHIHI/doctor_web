// MedicalExam.js - Đã tinh gọn
import React, { useState, useEffect, useCallback } from 'react'; // Thêm useCallback
import './medicalExam.css';
import './medicalExamSplit.css';
import './healthProfile.css';
import { FaPlus, FaTrash, FaPrint, FaSave, FaUndo, FaStethoscope, FaUserInjured, FaArrowRight, FaSearch, FaUserMd, FaHistory, FaSyncAlt } from 'react-icons/fa';
// import { db } from '../firebase'; // Không còn cần truy cập trực tiếp Firestore từ frontend
// import { collection, query, where, getDocs, doc, orderBy, Timestamp, onSnapshot, addDoc, setDoc, writeBatch, collectionGroup, getDoc } from "firebase/firestore"; // Không còn cần các hàm Firestore
import axios from 'axios';
import PatientRecord from '../components/PatientRecord';

// API endpoint configuration
const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000',
  ENDPOINTS: {
    MEDICAL_EXAM: '/api/medicalExam',
    WAITING_PATIENTS: '/api/medicalExam/waiting-patients',
    SEARCH_MEDICINE: '/medicine/name-medicine', // Giả định endpoint này vẫn là của backend medicine service
  }
};

const MedicalExam = () => {
  // State variables
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [waitingPatients, setWaitingPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showPatientRecord, setShowPatientRecord] = useState(false);

  // State for patient info
  const [patientInfo, setPatientInfo] = useState({
    name: '',
    DoB: '',
    gender: '',
    address: '',
    cccd: '',
    phone: '',
    symptomsInitial: '',
    healthProfile: {
      heartRate: '',
      height: '',
      leftEye: '',
      rightEye: '', // Giữ lại để tránh lỗi nếu có nơi nào đó vẫn dùng, dù backend chỉ trả về 'Eye'
      weight: '',
      medicalHistory: ''
    }
  });

  // State for examination form
  const [symptomsCurrent, setSymptomsCurrent] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [medications, setMedications] = useState([
    { medicineName: '', dosage: '', quantity: '', frequency: '', usageNotes: '' }
  ]);
  const [notes, setNotes] = useState('');
  const [reExamDate, setReExamDate] = useState('');
  // State cho chức năng tìm kiếm thuốc
  const [medicineSearchTerm, setMedicineSearchTerm] = useState('');
  const [medicineSearchResults, setMedicineSearchResults] = useState([]);
  const [isSearchingMedicine, setIsSearchingMedicine] = useState(false);
  const [activeMedicationIndex, setActiveMedicationIndex] = useState(0); // Để biết đang nhập vào dòng thuốc nào

  // Get current doctor info
  const getCurrentDoctor = () => {
    const doctorData = localStorage.getItem('user');
    if (doctorData) {
      return JSON.parse(doctorData);
    }
    // Trả về một ID và tên demo nếu không tìm thấy user trong localStorage
    return { id: "MW0d0z8l4maWvBZZytpZ29g5JJ23", name: "Bác sĩ Demo" };
  };

  const currentDoctor = getCurrentDoctor();

  // Define fetchWaitingPatients at component level so it can be used throughout the component
  const fetchWaitingPatients = useCallback(async () => {
    try {
      const apiUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WAITING_PATIENTS}`;
      console.log(`Fetching waiting patients from: ${apiUrl} for doctorId: ${currentDoctor.id}`);
      const response = await axios.get(apiUrl, {
        params: { doctorId: currentDoctor.id, date: new Date().toISOString().split('T')[0] } // Thêm ngày hiện tại để lọc ở backend
      });

      if (response.data.success) {
        // Data from API is already formatted as expected
        setWaitingPatients(response.data.waitingPatients);
        console.log(`Fetched ${response.data.waitingPatients.length} waiting patients.`);
      } else {
        setWaitingPatients([]);
        console.error("API did not return success for waiting patients:", response.data.error);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách bệnh nhân chờ từ API:", error);
      alert("Không thể tải danh sách bệnh nhân chờ. Vui lòng thử lại sau.");
      setWaitingPatients([]); // Clear list on error
    }
  }, [currentDoctor.id]); // Dependency array cho useCallback

  // Fetch waiting patients list on component mount and when doctorId changes
  useEffect(() => {
    fetchWaitingPatients();
    // Có thể thêm polling nếu muốn tự động làm mới danh sách (ví dụ mỗi 30 giây)
    // const pollingInterval = setInterval(fetchWaitingPatients, 30000); // Poll every 30 seconds
    // return () => clearInterval(pollingInterval);
  }, [fetchWaitingPatients]); // Dependency array chỉ cần fetchWaitingPatients

  // Fetch medicine search results
  useEffect(() => {
    const fetchMedicineSearch = async () => {
      if (!medicineSearchTerm.trim()) {
        setMedicineSearchResults([]);
        return;
      }

      setIsSearchingMedicine(true);
      try {
        const response = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SEARCH_MEDICINE}`, {
          params: { q: medicineSearchTerm }
        });
        setMedicineSearchResults(response.data || []);
      } catch (error) {
        console.error("Lỗi khi tìm kiếm thuốc:", error);
        setMedicineSearchResults([]);
      } finally {
        setIsSearchingMedicine(false);
      }
    };

    const debounceTimeout = setTimeout(() => {
      fetchMedicineSearch();
    }, 500); // debounce 500ms

    return () => clearTimeout(debounceTimeout);
  }, [medicineSearchTerm]);


  // Event handlers
  const handleSearch = (e) => setSearchTerm(e.target.value);

  const filteredPatients = waitingPatients.filter(patient =>
    patient.patientName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectAppointment = (appointment) => {
    setSelectedAppointment(appointment);

    // Dữ liệu bệnh nhân đã được định dạng chuẩn từ API backend
    const patientData = appointment.patient || {};
    const healthProfileData = patientData.healthProfile || {};

    setPatientInfo({
      name: appointment.patientName || patientData.fullName || patientData.displayName || '',
      DoB: appointment.patientDoB || patientData.DoB || '',
      gender: appointment.patientGender || patientData.gender || '',
      address: appointment.patientAddress || patientData.address || '',
      cccd: appointment.patientCCCD || patientData.CCCD || '',
      phone: appointment.patientPhone || patientData.phone || patientData.phoneNumber || '',
      symptomsInitial: appointment.symptom || '', // Sử dụng symptom từ appointment object
      healthProfile: {
        heartRate: healthProfileData.heartRate || '',
        height: healthProfileData.height || '',
        leftEye: healthProfileData.Eye || healthProfileData.leftEye || '', // Backend trả về Eye
        rightEye: healthProfileData.rightEye || '', // Giữ lại để tương thích nếu frontend vẫn dùng
        weight: healthProfileData.weight || '',
        medicalHistory: healthProfileData.medicalHistory || ''
      }
    });
    setSymptomsCurrent(appointment.symptom || ''); // symptom là initial symptoms từ appointment
    setDiagnosis(''); // Reset chẩn đoán khi chọn bệnh nhân mới
    setMedications([{ medicineName: '', dosage: '', quantity: '', frequency: '', usageNotes: '' }]); // Reset đơn thuốc
    setNotes(''); // Reset ghi chú
    setReExamDate(''); // Reset ngày tái khám
  };

  const resetForm = () => {
    setSelectedAppointment(null);
    setPatientInfo({
      name: '',
      DoB: '',
      gender: '',
      address: '',
      cccd: '',
      phone: '',
      symptomsInitial: '',
      healthProfile: {
        heartRate: '',
        height: '',
        leftEye: '',
        rightEye: '',
        weight: '',
        medicalHistory: ''
      }
    });
    setSymptomsCurrent('');
    setDiagnosis('');
    setMedications([{ medicineName: '', dosage: '', quantity: '', frequency: '', usageNotes: '' }]);
    setNotes('');
    setReExamDate('');
  };

  const handleSelectSearchedMedicine = (medicine) => {
    const updatedMedications = [...medications];

    // Cập nhật thông tin vào dòng thuốc đang hoạt động (active)
    updatedMedications[activeMedicationIndex] = {
      ...updatedMedications[activeMedicationIndex], // Giữ lại các giá trị cũ nếu có
      medicineName: medicine.name || '', // Giả định field trong DB là 'name'
      usageNotes: medicine.usage || '',  // Giả định field trong DB là 'usage'
      isFromDatabase: true, // Đánh dấu thuốc này là từ database
      medicineId: medicine.id // Lưu lại ID của thuốc từ database
    };

    setMedications(updatedMedications);

    // Xóa kết quả tìm kiếm và từ khóa sau khi đã chọn
    setMedicineSearchTerm('');
    setMedicineSearchResults([]);
  };

  const handleMedicationChange = (index, e) => {
    const { name, value } = e.target;
    const updatedMedications = [...medications];

    // Ngăn sửa thuốc từ DB
    if (updatedMedications[index].isFromDatabase &&
      (name === 'medicineName' || name === 'usageNotes')) {
      console.log('Không thể chỉnh sửa thông tin thuốc từ database');
      return;
    }

    // Ghi nhận dòng đang nhập + từ khóa tìm thuốc
    if (name === "medicineName") {
      setActiveMedicationIndex(index);
      setMedicineSearchTerm(value);
    }

    updatedMedications[index] = { ...updatedMedications[index], [name]: value };
    setMedications(updatedMedications);
  };

  const addMedication = () => {
    setMedications([...medications, { medicineName: '', dosage: '', quantity: '', frequency: '', usageNotes: '' }]);
  };

  const removeMedication = (index) => {
    if (medications.length === 1) return;
    const updatedMedications = medications.filter((_, i) => i !== index);
    setMedications(updatedMedications);
  };

  // Function to save examination data using the backend API
  const saveExamination = async () => {
    // Validate required fields
    if (!selectedAppointment) {
      alert("Vui lòng chọn một bệnh nhân từ danh sách chờ.");
      return;
    }

    if (!diagnosis.trim()) {
      alert("Vui lòng nhập chẩn đoán.");
      return;
    }

    // Validate medications
    const validMedications = medications.filter(med => med.medicineName && med.medicineName.trim() !== '');
    if (validMedications.length === 0) {
      alert("Vui lòng nhập ít nhất một loại thuốc.");
      return;
    }

    setIsSaving(true);
    const formattedMedications = validMedications.map(med => ({
      medicineName: med.medicineName.trim(),
      dosage: med.dosage || "",
      quantity: med.quantity || "",
      frequency: med.frequency || "",
      usageNotes: med.usageNotes || "",
      ...(med.isFromDatabase && {
        medicineId: med.medicineId,
        isFromDatabase: true
      })
    }));

    try {
      // Prepare data for API call
      const examinationData = {
        appointmentId: selectedAppointment ? selectedAppointment.id : "",
        patientId: selectedAppointment ? selectedAppointment.patientId : `new_patient_${Date.now()}`, // Fallback ID if no selectedAppointment
        doctorId: currentDoctor.id,
        diagnosis: diagnosis || "",
        symptoms: symptomsCurrent || "",
        notes: notes || "",
        reExamDate: reExamDate || null,
        medications: formattedMedications
      };

      console.log("Sending data to API:", examinationData);

      // Make API request
      const apiUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MEDICAL_EXAM}`;
      const response = await axios.post(apiUrl, examinationData, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log("API response:", response.data);

      if (response.data.success || response.status === 201) {
        // Update UI after successful save
        if (selectedAppointment) {
          // Remove the completed appointment from the waiting list
          setWaitingPatients(prev => prev.filter(p => p.id !== selectedAppointment.id));
        }

        // Show success message and reset form
        alert('Đã lưu kết quả khám và đơn thuốc thành công!');
        resetForm();
      } else {
        throw new Error(response.data.error || "Không thể lưu đơn thuốc");
      }
    } catch (error) {
      console.error('Lỗi khi lưu kết quả khám:', error);

      let errorMessage = "Đã xảy ra lỗi khi lưu kết quả khám.";
      if (error.response) {
        console.error("API error response:", error.response.data);
        errorMessage = `Lỗi từ server: ${error.response.data.error || error.response.statusText}`;
      } else if (error.request) {
        console.error("API request error (no response):", error.request);
        errorMessage = "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng và thử lại sau.";
      }
      alert(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const printPrescription = () => {
    alert("Chức năng in chi tiết sẽ được phát triển sau. Tạm thời sẽ in toàn bộ trang.");
    window.print();
  };

  // Function to view patient's medical record
  const viewPatientRecord = () => {
    if (!selectedAppointment || !selectedAppointment.patientId) {
      alert("Không thể truy cập hồ sơ bệnh nhân. Vui lòng kiểm tra ID bệnh nhân.");
      return;
    }
    // Show the patient record modal
    setShowPatientRecord(true);
    console.log(`Opening patient record for: ${selectedAppointment.patientId}`);
  };

  // Function to close the patient record modal
  const closePatientRecord = () => {
    setShowPatientRecord(false);
    // Sau khi đóng modal, làm mới danh sách bệnh nhân chờ
    fetchWaitingPatients();
  };

  // Render the split view with both waiting list and examination form
  return (
    <>
      <div className="medical-exam-split-container">
        {/* Left sidebar: Waiting patients list */}
        <div className="waiting-patients-sidebar">
          <div className="sidebar-header">
            <h3><FaUserInjured /> Danh sách bệnh nhân</h3>
            <div className="sidebar-search-integrated">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên..."
                value={searchTerm}
                onChange={handleSearch}
                className="search-input"
              />
            </div>
            <div className="patient-count" title={`${filteredPatients.length} bệnh nhân đang chờ khám`}>
              <span className="count-number">{filteredPatients.length}</span>
            </div>
          </div>
          {/* Patient list */}
          <div className="waiting-patients-list">
            {filteredPatients.length > 0 ? (
              filteredPatients.map(appointment => (
                <div
                  className={`patient-list-item ${selectedAppointment && selectedAppointment.id === appointment.id ? 'selected' : ''}`}
                  key={appointment.id}
                  onClick={() => handleSelectAppointment(appointment)}
                >
                  <div className="patient-name">{appointment.patientName}</div>
                  <div className="patient-time">{appointment.appointmentTimeSlot}</div> {/* Thêm hiển thị thời gian */}
                </div>
              ))
            ) : (
              <div className="no-patients">
                <p>Không có bệnh nhân nào trong danh sách chờ.</p>
                <button className="refresh-btn" onClick={fetchWaitingPatients}>
                  <FaSyncAlt /> Làm mới danh sách
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main content: Examination form */}
        <div className="examination-form-container">
          {/* Form header */}
          <div className="medical-exam-header">
            <h2>
              <FaStethoscope />
              {!selectedAppointment
                ? 'Chọn bệnh nhân để bắt đầu khám'
                : `Khám bệnh: ${patientInfo.name}`}
            </h2>
          </div>
          {/* Show empty state when no patient selected */}
          {!selectedAppointment ? (
            <div className="empty-exam-state">
              <FaUserInjured className="empty-state-icon" />
              <p>Chọn một bệnh nhân từ danh sách bên trái để bắt đầu khám</p>
            </div>
          ) : (
            <>
              {/* Patient information section */}
              <div className="section patient-info-display">
                <h3>Thông tin bệnh nhân</h3>
                <div className="patient-info-fields">
                  <p><strong>Tên:</strong> {patientInfo.name || "Chưa có thông tin"}</p>
                  <p><strong>Ngày sinh:</strong> {patientInfo.DoB || "N/A"}</p>
                  <p><strong>Giới tính:</strong> {patientInfo.gender || "Không xác định"}</p>
                  <p><strong>CCCD:</strong> {patientInfo.cccd || "N/A"}</p>
                  <p><strong>Số điện thoại:</strong> {patientInfo.phone || "N/A"}</p>
                  <p className="full-width"><strong>Địa chỉ:</strong> {patientInfo.address || "N/A"}</p>
                  <p className="full-width"><strong>Triệu chứng ban đầu:</strong> {patientInfo.symptomsInitial || "Không ghi nhận"}</p>
                </div>
                <button className="view-record-btn" onClick={viewPatientRecord}>
                  <FaHistory /> Xem hồ sơ bệnh án
                </button>
              </div>
              {/* Thông tin sức khỏe từ HealthProfile */}
              <div className="section health-profile-display">
                <h3>Thông tin sức khỏe</h3>
                <div className="health-profile-fields">
                  <p><strong>Chiều cao:</strong> {patientInfo.healthProfile.height || "N/A"} {patientInfo.healthProfile.height ? "cm" : ""}</p>
                  <p><strong>Cân nặng:</strong> {patientInfo.healthProfile.weight || "N/A"} {patientInfo.healthProfile.weight ? "kg" : ""}</p>
                  <p><strong>Nhịp tim:</strong> {patientInfo.healthProfile.heartRate || "N/A"} {patientInfo.healthProfile.heartRate ? "bpm" : ""}</p>
                  <p><strong>Thị lực:</strong> {patientInfo.healthProfile.leftEye || "N/A"}</p>
                  <p className="full-width"><strong>Tiền sử bệnh:</strong> {patientInfo.healthProfile.medicalHistory || "Không có thông tin"}</p>
                </div>
              </div>

              {/* Symptoms section */}
              <div className="section">
                <h3>Triệu chứng (lúc khám)</h3>
                <textarea
                  placeholder="Mô tả triệu chứng chi tiết lúc khám..."
                  value={symptomsCurrent}
                  onChange={(e) => setSymptomsCurrent(e.target.value)}
                  className="form-control"
                  rows={3}
                />
              </div>

              {/* Diagnosis section */}
              <div className="section">
                <h3>Chẩn đoán</h3>
                <textarea
                  placeholder="Nhập chẩn đoán của bác sĩ"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="form-control"
                  rows={3}
                />
              </div>

              {/* Prescription section */}
              <div className="section prescription-section">
                <h3>Đơn thuốc</h3>

                {/* Search Medicine Input (Always visible, tied to active medication row) */}
                <div className="medicine-search-container">
                  

                  
                </div>

                <div className="medication-header">
                  <div>Tên thuốc</div>
                  <div>Liều/lần</div>
                  <div>Số lượng</div>
                  <div>Tần suất/Cách dùng</div>
                  <div>Ghi chú thuốc</div>
                  <div></div>
                </div>
                {medications.map((med, index) => (
                  <div
                    className={`medication-row ${med.isFromDatabase ? 'database-medicine' : ''} ${index === activeMedicationIndex ? 'active-medication' : ''}`}
                    key={index}
                    onClick={() => setActiveMedicationIndex(index)}
                  >
                    <div className="input-wrapper">

  <input
    type="text"
    name="medicineName"
    placeholder="Tên thuốc"
    value={med.medicineName}
    onChange={(e) => handleMedicationChange(index, e)}
    onFocus={() => setActiveMedicationIndex(index)}
    className="form-control"
    readOnly={med.isFromDatabase}
  />

  {/* 🔽 Gợi ý autocomplete hiển thị ngay dưới input này */}
  {index === activeMedicationIndex && medicineSearchTerm.trim() !== '' && (
    <div className="autocomplete-results">
      {medicineSearchResults.length > 0 ? (
        medicineSearchResults.map((med) => (
          <div
            key={med.id}
            className="autocomplete-item"
            onClick={() => handleSelectSearchedMedicine(med)}
          >
            <strong>{med.name}</strong> – {med.usage || 'Không có hướng dẫn'}
          </div>
        ))
      ) : !isSearchingMedicine ? (
        <div className="no-results">
          <p>Không tìm thấy thuốc "<strong>{medicineSearchTerm}</strong>"</p>
          <button
            onClick={() => {
              const updatedMedications = [...medications];
              updatedMedications[activeMedicationIndex] = {
                ...updatedMedications[activeMedicationIndex],
                medicineName: medicineSearchTerm.trim(),
                isFromDatabase: false,
              };
              setMedications(updatedMedications);
              setMedicineSearchTerm('');
              setMedicineSearchResults([]);
            }}
          >
            Thêm thủ công
          </button>
        </div>
      ) : (
        <p>Đang tìm kiếm...</p>
      )}
    </div>
  )}
</div>

                    <input
                      type="text"
                      name="dosage"
                      placeholder="VD: 1 viên"
                      value={med.dosage}
                      onChange={(e) => handleMedicationChange(index, e)}
                      className="form-control"
                    />
                    <input
                      type="text"
                      name="quantity"
                      placeholder="VD: 10 viên"
                      value={med.quantity}
                      onChange={(e) => handleMedicationChange(index, e)}
                      className="form-control"
                    />
                    <input
                      type="text"
                      name="usageNotes"
                      placeholder="VD: Sáng 1, Tối 1"
                      value={med.usageNotes}
                      onChange={(e) => handleMedicationChange(index, e)}
                      className="form-control"
                    />
                    <input
                      type="text"
                      name="frequency"
                      placeholder="VD: Sau ăn no"
                      value={med.frequency}//frequency
                      onChange={(e) => handleMedicationChange(index, e)}
                      className="form-control"
                      
                    />
                    <button
                      className="remove-btn"
                      onClick={() => removeMedication(index)}
                      disabled={medications.length === 1}
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}

                <button className="add-btn" onClick={addMedication}><FaPlus /> Thêm thuốc</button>
              </div>

              {/* Notes and re-examination section */}
              <div className="section notes-reexam-section">
                <div className="notes-group">
                  <h3>Ghi chú chung</h3>
                  <textarea
                    placeholder="Ghi chú bổ sung (dặn dò, lời khuyên...)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="form-control"
                    rows={3}
                  />
                </div>
                <div className="reexam-group">
                  <h3>Ngày tái khám (nếu có)</h3>
                  <input
                    type="date"
                    value={reExamDate}
                    onChange={(e) => setReExamDate(e.target.value)}
                    className="form-control"
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="action-buttons">
                <button className="save-btn" onClick={saveExamination} disabled={isSaving}>
                  {isSaving ? 'Đang lưu...' : <><FaSave /> Lưu Kết Quả</>}
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
      </div>

      {/* Patient Record Modal */}
      {showPatientRecord && selectedAppointment && (
        <PatientRecord
          patientId={selectedAppointment.patientId}
          onClose={closePatientRecord}
        />
      )}
    </>
  );
};

export default MedicalExam;
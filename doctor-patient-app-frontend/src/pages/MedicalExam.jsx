// MedicalExam.js
import React, { useState, useEffect } from 'react';
import './medicalExam.css';
import './medicalExamSplit.css';
import './healthProfile.css';
import { FaPlus, FaTrash, FaPrint, FaSave, FaUndo, FaStethoscope, FaUserInjured, FaArrowRight, FaSearch, FaUserMd, FaHistory, FaSyncAlt} from 'react-icons/fa';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, orderBy, Timestamp, onSnapshot, addDoc, setDoc, writeBatch, collectionGroup, getDoc } from "firebase/firestore";
import axios from 'axios';
import PatientRecord from '../components/PatientRecord';

// API endpoint configuration
const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000',
  ENDPOINTS: {
    MEDICAL_EXAM: '/api/medicalExam',
    WAITING_PATIENTS: '/api/medicalExam/waiting-patients',
    SEARCH_MEDICINE: '/medicine/name-medicine',
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
      rightEye: '',
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
  const [allMedicines, setAllMedicines] = useState([])
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
   // return { id: "MW0d0z8l4maWvBZZytpZ29g5JJ23", name: "Bác sĩ Demo" };
  };

  const currentDoctor = getCurrentDoctor();
  // Define fetchWaitingPatients at component level so it can be used throughout the component
  const fetchWaitingPatients = async () => {
    try {
      const apiUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WAITING_PATIENTS}`;
      const response = await axios.get(apiUrl, {
        params: { doctorId: currentDoctor.id }
      });

      if (response.data.success) {
        // Format the data to match the component's expected structure
        const formattedPatientsPromises = response.data.waitingPatients.map(async appointment => {
          // Extract patient data from the API response
          const patient = appointment.patient || {};
          const appointmentDate = appointment.timeSlot ?
            new Date(appointment.timeSlot.seconds * 1000) : new Date();

          // Lấy thông tin từ dữ liệu bệnh nhân từ API backend
          let patientName =  patient.fullName || patient.displayName || patient.name || "Không có tên";
          let patientDoB = patient.DoB || "N/A";
          let patientGender = patient.gender || "N/A";
          let patientAddress = patient.address || "N/A";
          let patientCCCD = patient.CCCD || "N/A";
          let patientPhone = patient.phone || patient.phoneNumber || "N/A";

          // Tạo đối tượng để lưu trữ thông tin sức khỏe từ Health Profile
          const healthProfileData = patient.healthProfile || {};

          console.log(`Dữ liệu bệnh nhân từ API:`, patient);

          return {
            id: appointment.id,
            patientId: appointment.parentId,
            patientName: patientName,
            patientDoB: patientDoB,
            patientGender: patientGender,
            patientAddress: patientAddress,
            patientCCCD: patientCCCD,
            patientPhone: patientPhone,
            symptomsInitial: appointment.symptom || "",
            appointmentDate: appointmentDate,
            appointmentTimeSlot: appointmentDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            status: appointment.status,
            scheduleId: appointment.scheduleId || appointment.id,
            patient: {
              ...patient,
              healthProfile: healthProfileData
            }
          };
        });

        // Giải quyết tất cả promises để lấy danh sách bệnh nhân đã được định dạng
        const formattedPatients = await Promise.all(formattedPatientsPromises);
        setWaitingPatients(formattedPatients);
      } else {
        setWaitingPatients([]);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách bệnh nhân chờ:", error);

      // Fallback to direct Firestore query if API fails
      console.log("API failed. Attempting fallback to direct Firestore method...");

      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999)); 
      try {
        const appointmentsRef = collection(db, "HisSchedule");
        const appointmentQuery = query(
          appointmentsRef,
          where("doctorID", "==", currentDoctor.id),
          where("status", "==", "wait"),
          where("examinationDate", ">=", Timestamp.fromDate(startOfDay)),
          where("examinationDate", "<=", Timestamp.fromDate(endOfDay)),
          //orderBy("timeOrder", "asc") // sắp xếp luôn trong query nếu được
        );

        const appointmentSnapshot = await getDocs(appointmentQuery);
        const appointments = [];
        const patientsPromises = [];

        appointmentSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.parentId) {
            const patientPromise = getDocs(query(collection(db, "users"), where("uid", "==", data.parentId)))
              .then(async patientSnapshot => {
                if (!patientSnapshot.empty) {
                  const patientData = patientSnapshot.docs[0].data();
                  // Khởi tạo dữ liệu bệnh nhân từ thông tin cơ bản
                  let patientName = patientData.displayName || patientData.name || patientData.fullName || "Không có tên";
                  let patientDoB = "N/A";
                  let patientGender = patientData.gender || "N/A";
                  let patientAddress = "N/A";
                  let patientCCCD = "N/A";
                  let patientPhone = patientData.phoneNumber || "N/A";

                  // Khởi tạo đối tượng để lưu trữ thông tin sức khỏe
                  let healthProfile = {
                    heartRate: '',
                    height: '',
                    leftEye: '',
                    rightEye: '',
                    weight: '',
                    medicalHistory: ''
                  };

                  // Luôn cố gắng lấy thông tin từ subcollection Profile/NormalProfile nếu có ID
                  try {
                    console.log(`Fallback: Đang tìm thông tin bệnh nhân từ Profile/NormalProfile cho ID: ${data.parentId}`);
                    const normalProfileDoc = await getDoc(doc(db, "users", data.parentId, "Profile", "NormalProfile"));
                    if (normalProfileDoc.exists()) {
                      // Process normal profile data...
                      const normalProfileData = normalProfileDoc.data();

                      // Update fields with available data
                      if (normalProfileData.Name) patientName = normalProfileData.Name;
                      if (normalProfileData.DoB) patientDoB = normalProfileData.DoB;
                      if (normalProfileData.Gender) patientGender = normalProfileData.Gender;
                      if (normalProfileData.Address) patientAddress = normalProfileData.Address;
                      if (normalProfileData.CCCD) patientCCCD = normalProfileData.CCCD;
                      if (normalProfileData.Phone) patientPhone = normalProfileData.Phone;
                    }

                    // Lấy thông tin từ HealthProfile
                    const healthProfileDoc = await getDoc(doc(db, "users", data.parentId, "Profile", "HealthProfile"));
                    if (healthProfileDoc.exists()) {
                      const healthProfileData = healthProfileDoc.data();

                      // Update health profile fields
                      if (healthProfileData.HeartRate) healthProfile.heartRate = healthProfileData.HeartRate;
                      if (healthProfileData.Height) healthProfile.height = healthProfileData.Height;
                      if (healthProfileData.LeftEye) healthProfile.leftEye = healthProfileData.LeftEye;
                      if (healthProfileData.RightEye) healthProfile.rightEye = healthProfileData.RightEye;
                      if (healthProfileData.Weight) healthProfile.weight = healthProfileData.Weight;
                      if (healthProfileData.medicalHistory) healthProfile.medicalHistory = healthProfileData.medicalHistory;
                    }
                  } catch (profileError) {
                    console.error(`Fallback: Lỗi khi lấy thông tin profile:`, profileError);
                  }

                  let appointmentTime = new Date();
                  try {
                    if (data.timeOrder instanceof Timestamp) {
                      appointmentTime = data.timeOrder.toDate();
                    }
                  } catch (error) {
                    console.error("Lỗi khi xử lý timeOrder:", error);
                  }

                  appointments.push({
                    id: doc.id,
                    patientId: data.parentId,
                    patientName: patientName,
                    patientDoB: patientDoB,
                    patientGender: patientGender,
                    patientAddress: patientAddress,
                    patientCCCD: patientCCCD,
                    patientPhone: patientPhone,
                    symptomsInitial: data.symptom || "",
                    appointmentDate: appointmentTime,
                    appointmentTimeSlot: appointmentTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                    status: data.status,
                    scheduleId: data.scheduleId || doc.id,
                    patient: {
                      healthProfile: healthProfile
                    }
                  });
                }
              })
              .catch(error => {
                console.error("Lỗi khi lấy thông tin bệnh nhân:", error);
              });
            patientsPromises.push(patientPromise);
          }
        });

        await Promise.all(patientsPromises);

        appointments.sort((a, b) => a.appointmentDate - b.appointmentDate);
        setWaitingPatients(appointments);
      } catch (fallbackError) {
        console.error("Fallback method also failed:", fallbackError);
      }
    }
  };
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


  // Fetch waiting patients list
  useEffect(() => {
    let isMounted = true;

    // Call the fetchWaitingPatients function to get the data
    fetchWaitingPatients();

    return () => {
      isMounted = false;
      // clearInterval(pollingInterval);
    };
  }, [currentDoctor.id]);
  
  // Event handlers
  const handleSearch = (e) => setSearchTerm(e.target.value);

  const filteredPatients = waitingPatients.filter(patient =>
    patient.patientName?.toLowerCase().includes(searchTerm.toLowerCase())
  ); const handleSelectAppointment = async (appointment) => {
    setSelectedAppointment(appointment);

    // Check patient data structure for debugging if we have issues
    if (appointment.patientId) {
      try {
        const structureData = await checkPatientDataStructure(appointment.patientId);
        console.log('Patient data structure check result:', structureData);
      } catch (error) {
        console.error('Error checking patient structure:', error);
      }
    }
    const handleSelectSearchedMedicine = (medicine) => {
      const updatedMedications = [...medications];

      // Cập nhật thông tin vào dòng thuốc đang hoạt động (active)
      updatedMedications[activeMedicationIndex] = {
        ...updatedMedications[activeMedicationIndex], // Giữ lại các giá trị cũ nếu có
        medicineName: medicine.name || '', // Giả định field trong DB là 'name'
        usageNotes: medicine.usage || '',   // Giả định field trong DB là 'usage'
        isFromDatabase: true, // Đánh dấu thuốc này là từ database
        medicineId: medicine.id // Lưu lại ID của thuốc từ database
      };

      setMedications(updatedMedications);

      // Xóa kết quả tìm kiếm và từ khóa sau khi đã chọn
      setMedicineSearchTerm('');
      setMedicineSearchResults([]);
    };
    // Handle patient data from the new array structure
    // PatientNormal array structure: [Name, DoB, Phone, Gender, CCCD, Address]
    // HealthProfile array structure: [HeartRate, Height, Eye, Weight, medicalHistory]

    let patientName = appointment.patientName || '';
    let patientDoB = appointment.patientDoB || '';
    let patientGender = appointment.patientGender || '';
    let patientAddress = appointment.patientAddress || '';
    let patientCCCD = appointment.patientCCCD || '';
    let patientPhone = appointment.patientPhone || '';
    let initialSymptoms = appointment.symptomsInitial || '';

    let healthProfile = {
      heartRate: '',
      height: '',
      leftEye: '', // This will be replaced with 'eye' in the new structure
      weight: '',
      medicalHistory: ''
    };

    // Handle ProfileNormal array
    if (appointment.patient && appointment.patient.ProfileNormal && Array.isArray(appointment.patient.ProfileNormal)) {
      console.log('Using ProfileNormal array:', appointment.patient.ProfileNormal);
      if (appointment.patient.ProfileNormal.length > 0) {
        patientName = appointment.patient.ProfileNormal[0] || patientName;
      }
      if (appointment.patient.ProfileNormal.length > 1) {
        patientDoB = appointment.patient.ProfileNormal[1] || patientDoB;
      }
      if (appointment.patient.ProfileNormal.length > 2) {
        patientPhone = appointment.patient.ProfileNormal[2] || patientPhone;
      }
      if (appointment.patient.ProfileNormal.length > 3) {
        patientGender = appointment.patient.ProfileNormal[3] || patientGender;
      }
      if (appointment.patient.ProfileNormal.length > 4) {
        patientCCCD = appointment.patient.ProfileNormal[4] || patientCCCD;
      }
      if (appointment.patient.ProfileNormal.length > 5) {
        patientAddress = appointment.patient.ProfileNormal[5] || patientAddress;
      }
    }
    // Handle HealthProfile array
    if (appointment.patient && appointment.patient.HealthProfile && Array.isArray(appointment.patient.HealthProfile)) {
      console.log('Using HealthProfile array:', appointment.patient.HealthProfile);
      if (appointment.patient.HealthProfile.length > 0) {
        healthProfile.heartRate = appointment.patient.HealthProfile[0] || healthProfile.heartRate;
      }
      if (appointment.patient.HealthProfile.length > 1) {
        healthProfile.height = appointment.patient.HealthProfile[1] || healthProfile.height;
      }
      if (appointment.patient.HealthProfile.length > 2) {
        // Using Eye field instead of leftEye in the new structure
        healthProfile.leftEye = appointment.patient.HealthProfile[2] || healthProfile.leftEye;
      }
      if (appointment.patient.HealthProfile.length > 3) {
        healthProfile.weight = appointment.patient.HealthProfile[3] || healthProfile.weight;
      }
      if (appointment.patient.HealthProfile.length > 4) {
        healthProfile.medicalHistory = appointment.patient.HealthProfile[4] || healthProfile.medicalHistory;
      }
    } else if (appointment.patient && appointment.patient.healthProfile) {
      // Fallback to old structure
      healthProfile = {
        heartRate: appointment.patient.healthProfile.heartRate || '',
        height: appointment.patient.healthProfile.height || '',
        leftEye: appointment.patient.healthProfile.Eye || appointment.patient.healthProfile.leftEye || '',
        weight: appointment.patient.healthProfile.weight || '',
        medicalHistory: appointment.patient.healthProfile.medicalHistory || ''
      };
    }

    setPatientInfo({
      name: patientName,
      DoB: patientDoB,
      gender: patientGender,
      address: patientAddress,
      cccd: patientCCCD,
      phone: patientPhone,
      symptomsInitial: initialSymptoms,
      healthProfile: healthProfile
    });
    setSymptomsCurrent(appointment.symptomsInitial || '');
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
      usageNotes: medicine.usage || '',   // Giả định field trong DB là 'usage'
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

    setIsSaving(true);    // Format medications to match backend expectation
    // Move this definition outside the try block to make it accessible in the catch block
    const formattedMedications = validMedications.map(med => ({
      medicineName: med.medicineName.trim(),
      dosage: med.dosage || "",
      quantity: med.quantity || "",
      frequency: med.frequency || "",
      usageNotes: med.usageNotes || "",
      // Include database fields if the medicine is from the database
      ...(med.isFromDatabase && {
        medicineId: med.medicineId,
        isFromDatabase: true
      })
    }));

    try {
      // Prepare data for API call
      const examinationData = {
        appointmentId: selectedAppointment ? selectedAppointment.id : "",
        patientId: selectedAppointment ? selectedAppointment.patientId : `new_patient_${Date.now()}`,
        doctorId: currentDoctor.id,
        diagnosis: diagnosis || "",
        symptoms: symptomsCurrent || "",
        notes: notes || "",
        reExamDate: reExamDate || null,
        medications: formattedMedications
      };

      // Log request data for debugging
      console.log("Sending data to API:", examinationData);

      // Make API request
      const apiUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MEDICAL_EXAM}`;
      const response = await axios.post(apiUrl, examinationData, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      // Log success response
      console.log("API response:", response.data);

      if (response.data.success || response.status === 201) {
        // Update UI after successful save
        if (selectedAppointment) {
          setWaitingPatients(prev => prev.filter(p => p.id !== selectedAppointment.id));
        }

        // Show success message and reset form
        alert('Đã lưu kết quả khám và đơn thuốc thành công!');
        resetForm();
      } else {
        throw new Error(response.data.error || "Không thể lưu đơn thuốc");
      }
    } catch (error) {
      // Handle API errors
      console.error('Lỗi khi lưu kết quả khám:', error);

      let errorMessage = "Đã xảy ra lỗi khi lưu kết quả khám.";

      if (error.response) {
        console.error("API error response:", error.response.data);
        errorMessage = `Lỗi từ server: ${error.response.data.error || error.response.statusText}`;
      } else if (error.request) {
        console.error("API request error (no response):", error.request);
        errorMessage = "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng và thử lại sau.";
      }

      // Fallback to direct Firestore method if API fails
      console.log("API failed. Attempting fallback to direct Firestore method...");

      try {
        // Create a batch to handle multiple write operations
        const batch = writeBatch(db);

        // Create examination document
        const examinationRef = doc(collection(db, "examinations"));
        const examinationData = {
          appointmentId: selectedAppointment ? selectedAppointment.id : "",
          diagnosis: diagnosis || "",
          doctorId: currentDoctor.id,
          examinationDate: Timestamp.now(),
          notes: notes || "",
          patientId: selectedAppointment ? selectedAppointment.patientId : `new_patient_${Date.now()}`,
          reExamDate: reExamDate ? Timestamp.fromDate(new Date(reExamDate)) : null,
          symptoms: symptomsCurrent || "",
          medications: formattedMedications // Save medications as an array
        };

        batch.set(examinationRef, examinationData);

        // Update appointment status if an appointment was selected
        if (selectedAppointment && selectedAppointment.scheduleId) {
          const appointmentRef = doc(db, "HisSchedule", selectedAppointment.scheduleId);
          batch.update(appointmentRef, { status: "completed" });
        }

        // Commit the batch
        await batch.commit();

        // Update UI after successful save
        if (selectedAppointment) {
          setWaitingPatients(prev => prev.filter(p => p.id !== selectedAppointment.id));
        }

        // Show success message and reset form
        alert('Đã lưu kết quả khám và đơn thuốc thành công (sử dụng phương thức fallback)');
        resetForm();

      } catch (fallbackError) {
        console.error("Fallback method also failed:", fallbackError);
        alert(`${errorMessage}\n\nPhương pháp dự phòng cũng thất bại: ${fallbackError.message}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const printPrescription = () => {
    alert("Chức năng in chi tiết sẽ được phát triển sau. Tạm thời sẽ in toàn bộ trang.");
    window.print();
  };  // Function to view patient's medical record
  const viewPatientRecord = () => {
    if (!selectedAppointment || !selectedAppointment.patientId) {
      alert("Không thể truy cập hồ sơ bệnh nhân. Vui lòng kiểm tra ID bệnh nhân.");
      return;
    }

    // Automatically refresh the waiting patients list when viewing the profile
     fetchWaitingPatients();

    // Show the patient record modal
    setShowPatientRecord(true);
    console.log(`Opening patient record for: ${selectedAppointment.patientId}`);
  };
  // Function to close the patient record modal
  const closePatientRecord = () => {
    setShowPatientRecord(false);

     fetchWaitingPatients();
    // Refresh the waiting patients list when closing the profile
  };

  // Debug function to check patient data structure
  const checkPatientDataStructure = async (patientId) => {
    try {
      console.log('Checking data structure for patient:', patientId);
      const apiUrl = `${API_CONFIG.BASE_URL}/api/medicalExam/check-patient-structure/${patientId}`;
      const response = await axios.get(apiUrl);

      if (response.data.success) {
        console.log('Patient data structure:', response.data.dataStructure);
        return response.data.dataStructure;
      } else {
        console.error('Error checking patient structure:', response.data.error);
        return null;
      }
    } catch (error) {
      console.error('Exception when checking patient structure:', error);
      return null;
    }
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
          </div>          {/* Patient list */}
          <div className="waiting-patients-list">
            {filteredPatients.length > 0 ? (
              filteredPatients.map(appointment => (
                <div
                  className={`patient-list-item ${selectedAppointment && selectedAppointment.id === appointment.id ? 'selected' : ''}`}
                  key={appointment.id}
                  onClick={() => handleSelectAppointment(appointment)}
                >
                  <div className="patient-name">{appointment.patientName}</div>
                </div>
              ))
            ) : (
              <div className="no-patients">
                <p>Đang tải danh sách chờ</p>
                <button className="refresh-btn" onClick={() => fetchWaitingPatients()}>
                  <FaSyncAlt /> Làm mới danh sách
                </button>``
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
                  {/* <p><strong>Ngày sinh:</strong> {patientInfo.DoB || "N/A"}</p> */}
                  <p><strong>Giới tính:</strong> {patientInfo.gender || "Không xác định"}</p>
                  <p><strong>CCCD:</strong> {patientInfo.cccd || "N/A"}</p>
                  <p><strong>Số điện thoại:</strong> {patientInfo.phone || "N/A"}</p>
                  <p className="full-width"><strong>Địa chỉ:</strong> {patientInfo.address || "N/A"}</p>
                  <p className="full-width"><strong>Triệu chứng ban đầu:</strong> {patientInfo.symptomsInitial || "Không ghi nhận"}</p>
                </div>
                <button className="view-record-btn" onClick={viewPatientRecord}>
                  <FaHistory /> Xem hồ sơ bệnh án
                </button>
              </div>              {/* Thông tin sức khỏe từ HealthProfile */}
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

                {/* ===== KHỐI TÌM KIẾM THUỐC MỚI ===== */}
                <div className="medicine-search-container">
                  <FaSearch className="search-icon" />
                  {/* <input
                    type="text"
                    placeholder="Tìm kiếm thuốc trong danh mục..."                    className="form-control medicine-search-input"
                    value={medicineSearchTerm}
                    onChange={(e) => setMedicineSearchTerm(e.target.value)}
                  /> */}
                  {isSearchingMedicine && <div className="spinner-small"></div>}

                  {/* Hiển thị kết quả tìm kiếm */}
                  {/* {medicineSearchResults.length > 0 && (
                    <div className="medicine-search-results">
                      {medicineSearchResults.map((med) => (
                        
                        <div
                          key={med.id}
                          className="result-item"
                          onClick={() => handleSelectSearchedMedicine(med)}
                        >
                         
                          <div className="result-medicine-name">{med.name}</div>
                          <div className="result-medicine-usage">{med.usage || 'Không có hướng dẫn sử dụng'}</div>
                        </div>
                      ))}
                    </div>
                  )} */}
                 
                    {/* <div className="medicine-search-results"> */}
                      {/* <div className="no-results">
                        <p>Không tìm thấy thuốc "<strong>{medicineSearchTerm}</strong>"</p>
                        <small>Vui lòng thử từ khóa khác hoặc thêm thuốc mới</small>
                        <button 
                          className="add-manual-btn"
                          onClick={() => {
                            // Thêm thuốc thủ công vào dòng thuốc hiện tại
                            const updatedMedications = [...medications];
                            updatedMedications[activeMedicationIndex] = {
                              ...updatedMedications[activeMedicationIndex],
                              medicineName: medicineSearchTerm.trim(),
                              isFromDatabase: false,
                              // Thêm một số giá trị mặc định hợp lý cho thuốc Amoxicillin
                              ...(medicineSearchTerm.toLowerCase().includes('amoxicillin') && {
                                usageNotes: "Điều trị nhiễm trùng",
                                dosage: "500mg",
                                frequency: "3 lần/ngày"
                              })
                            };
                            setMedications(updatedMedications);
                            setMedicineSearchTerm('');
                            setMedicineSearchResults([]);
                          }}
                        >
                          Thêm "{medicineSearchTerm}" thủ công
                        </button>
                      </div> */}
                   {/* </div> */}
                  
                </div>
                {/* ===== KẾT THÚC KHỐI TÌM KIẾM ===== */}


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
                      {med.isFromDatabase && <div className="database-badge" title="Thuốc từ danh mục"></div>}
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
                      name="frequency"
                      placeholder="VD: Sáng 1, Tối 1"
                      value={med.frequency}
                      onChange={(e) => handleMedicationChange(index, e)}
                      className="form-control"
                    />
                    <input
                      type="text"
                      name="usageNotes"
                      placeholder="VD: Sau ăn no"
                      value={med.usageNotes}
                      onChange={(e) => handleMedicationChange(index, e)}
                      className="form-control"
                      readOnly={med.isFromDatabase} // Nếu là thuốc từ database thì không cho chỉnh sửa hướng dẫn
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

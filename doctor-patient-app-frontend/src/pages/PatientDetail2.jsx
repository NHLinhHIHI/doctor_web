import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaUserMd, FaFileMedical } from "react-icons/fa";
import "./patientManager.css";

const PatientDetail2 = ({ patientId }) => {
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("info");
  const calculateBMI = (weightStr, heightStr) => {
  const weight = parseFloat(weightStr);
  const heightCm = parseFloat(heightStr);

  if (!weight || !heightCm) return "Không xác định";

  const heightM = heightCm / 100;
  const bmi = weight / (heightM * heightM);
  return bmi.toFixed(1); // Làm tròn 1 chữ số thập phân
};


  const fetchPatientDetails = async (patientId) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/manager/medical-history/${patientId}`);
      if (!response.ok) throw new Error("Không thể tải dữ liệu");

      const data = await response.json();

      const profile = data.patientInfo?.ProfileNormal || [];
      const health = data.patientInfo?.HealthProfile || [];

      const patientData = {
        patientId,
        name: profile[0] || "Không rõ",
        birthDate: profile[1] || "Không rõ",
        phone: profile[2] || "Không rõ",
        gender: profile[3] || "Không rõ",
        email: data.patientInfo?.Email || "Không rõ",
        address: profile[5] || "Không rõ",
        vitalSigns: {
          heartRate: health[0] || "Không rõ",
          height: health[1] || "Không rõ",
          vision: health[2] || "Không rõ",
          weight: health[3] || "Không rõ",
          healthStatus: health[4] || "Không rõ",
        },
        medicalHistory: data.medicalHistory || [],
      };

          console.log("Dữ liệu patientData đã xử lý:", patientData);  // Log dữ liệu patient đã map xong

      setPatient(patientData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) {
      fetchPatientDetails(patientId);
    }
  }, [patientId]);

  const goBack = () => navigate(-1);

  if (loading) return <div className="loading">Đang tải thông tin bệnh nhân...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!patient) return <div className="error">Không tìm thấy thông tin bệnh nhân</div>;

  return (
    <div className="patient-detail-container">
      <div className="back-button" onClick={goBack}>
        <FaArrowLeft /> Quay lại danh sách
      </div>

      <div className="patient-header">
        <div className="patient-header-left">
          <img src="/images/avatar.png" alt={patient.name} className="patient-detail-avatar" />
          <div className="patient-main-info">
            <h1>{patient.name}</h1>
            <p>Mã hồ sơ: <strong>{patient.patientId}</strong></p>
            <div className="patient-badges">
              <span className="badge">{patient.gender}</span>
              <span className="badge">
                {patient.birthDate} (
                {new Date().getFullYear() - parseInt(patient.birthDate.split('/')[2] || 0)} tuổi)
              </span>
              <span className="badge status-badge">Bệnh nhân thường xuyên</span>
            </div>
          </div>
        </div>
        <div className="patient-header-right">
          <p><strong>SĐT:</strong> {patient.phone}</p>
          <p><strong>Email:</strong> {patient.email}</p>
          <p><strong>Địa chỉ:</strong> {patient.address}</p>
        </div>
      </div>

      <div className="patient-tabs">
        <div
          className={`tab ${activeTab === "info" ? "active" : ""}`}
          onClick={() => setActiveTab("info")}
        >
          <FaUserMd /> Thông tin chung
        </div>
        <div
          className={`tab ${activeTab === "medical" ? "active" : ""}`}
          onClick={() => setActiveTab("medical")}
        >
          <FaFileMedical /> Lịch sử y tế
        </div>
      </div>

      <div className="tab-content">
        {activeTab === "info" && (
          <div className="tab-pane">
            <h3>Thông số sinh tồn</h3>
            <div className="vital-signs-grid">
              <div className="vital-item"><strong>Nhịp tim:</strong> {patient.vitalSigns.heartRate}</div>
              <div className="vital-item"><strong>Chiều cao:</strong> {patient.vitalSigns.height}</div>
              <div className="vital-item"><strong>Tầm nhìn:</strong> {patient.vitalSigns.vision}</div>
              <div className="vital-item"><strong>Cân nặng:</strong> {patient.vitalSigns.weight}</div>
               <div className="vital-item"><strong>Chỉ số BMI:</strong> {
        calculateBMI(patient.vitalSigns.weight, patient.vitalSigns.height)
      }</div>
              <div  className="vital-item"><strong>Trạng thái sức khỏe:</strong> {patient.vitalSigns.healthStatus}</div>
            </div>
          </div>
        )}

        {activeTab === "medical" && (
          <div className="tab-pane">
            <div className="info-section">
            <h3>Lịch sử khám bệnh</h3>
            {patient.medicalHistory.length > 0 ? patient.medicalHistory.map((record, idx) => (
              <div key={idx} className="medical-record">
                <div className="medical-record-header">
                   <div className="medical-record-header"><strong>Ngày:</strong> {record.date}</div>
                  <div className="medical-record-diagnosis"><strong>Chẩn đoán:</strong> {record.diagnosis}</div>

               
                </div>
                              <p><strong>Đơn thuốc:</strong><br /> {record.prescription}</p>
                <p><strong>Ngày tái khám:</strong> {record.reExamDate}</p>
                <p ><strong>Ghi chú :</strong> {record.notes}</p>
              </div>
            )) : <p>Không có lịch sử khám bệnh</p>}
          </div>
          </div>
        )}
      </div>
      
    </div>
  );
};

export default PatientDetail2;

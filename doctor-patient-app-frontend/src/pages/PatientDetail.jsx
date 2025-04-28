import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaFileMedical, FaUserMd, FaCalendarAlt } from "react-icons/fa";
import "./patientDetail.css";

function PatientDetail() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("info");

  useEffect(() => {
    // Kiểm tra xem người dùng có là doctor không
    const userInfo = JSON.parse(localStorage.getItem("user"));
    if (!userInfo || userInfo.role !== "doctor") {
      navigate("/login");
      return;
    }

    // Lấy thông tin bệnh nhân (giả lập)
    fetchPatientDetails(patientId);
  }, [patientId, navigate]);

  const fetchPatientDetails = async (id) => {
    try {
      setLoading(true);
      // Giả lập API call - thay thế bằng API thực tế sau này
      setTimeout(() => {
        const mockPatient = {
          id: id,
          name: id === "A123" ? "Lê Minh Quang" : id === "B456" ? "Nguyễn Văn An" : "Bệnh nhân",
          birthDate: "12/05/1990",
          gender: "Nam",
          address: "123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh",
          phone: "0901234567",
          email: "patient@example.com",
          image: "/images/avatar.png",
          medicalHistory: [
            {
              date: "14/03/2025",
              diagnosis: "Viêm xoang mũi",
              doctor: "Dr. Nguyễn Văn A",
              prescription: "Augmentin 500mg (2 lần/ngày), Paracetamol 500mg khi sốt",
              notes: "Bệnh nhân cần nghỉ ngơi 3 ngày, uống nhiều nước."
            },
            {
              date: "05/01/2025",
              diagnosis: "Cảm cúm",
              doctor: "Dr. Trần Thị B",
              prescription: "Panadol Extra (3 lần/ngày), Vitamin C 500mg",
              notes: "Theo dõi nếu sốt cao trên 39 độ."
            }
          ],
          upcomingAppointments: [
            {
              date: "28/04/2025",
              time: "09:30",
              doctor: "Dr. Nguyễn Văn A",
              department: "Tai Mũi Họng",
              status: "Đã xác nhận"
            }
          ],
          vitalSigns: {
            bloodPressure: "120/80 mmHg",
            heartRate: "75 bpm",
            temperature: "36.5°C",
            respiratoryRate: "16 rpm",
            height: "170 cm",
            weight: "68 kg",
            bmi: "23.5",
            bloodType: "O+"
          },
          allergies: ["Penicillin", "Hải sản"],
          labResults: [
            {
              date: "14/03/2025",
              testName: "Công thức máu",
              result: "Bình thường",
              referenceRange: "WBC: 4.5-11.0 x10^3/μL",
              notes: "Không có bất thường đáng kể"
            },
            {
              date: "14/03/2025",
              testName: "X-quang ngực",
              result: "Bình thường",
              referenceRange: "N/A",
              notes: "Không phát hiện bất thường"
            }
          ]
        };
        setPatient(mockPatient);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error("Error fetching patient details:", error);
      setLoading(false);
    }
  };

  const goBack = () => {
    navigate(-1); // Quay lại trang trước đó
  };

  if (loading) {
    return <div className="loading">Đang tải thông tin bệnh nhân...</div>;
  }

  if (!patient) {
    return <div className="error">Không tìm thấy thông tin bệnh nhân</div>;
  }

  return (
    <div className="patient-detail-container">
      {/* Thanh Hello Doctor riêng - giống DoctorHome */}
      <div className="doctor-topbar">
        <span>Hello, Dr.{JSON.parse(localStorage.getItem("user")).name || "Doctor"}</span>
        <img src="/images/avatar.png" alt="Avatar" className="doctor-avatar" />
      </div>

      {/* Header chứa logo + menu */}
      <header className="doctor-header">
        <div className="logo-section">
          <img src="/images/logo.png" alt="Logo" className="doctor-logo" />
          <span className="hospital-name">HOA BINH HOSPITAL</span>
        </div>
        <nav className="doctor-nav">
          <ul>
            <li>HOME</li>
            <li>ABOUT</li>
            <li>SERVICES</li>
            <li>CONTACT</li>
            <li className="active">DASHBOARD</li>
          </ul>
        </nav>
      </header>

      <div className="patient-detail-content">
        <div className="back-button" onClick={goBack}>
          <FaArrowLeft /> Quay lại danh sách
        </div>

        {/* Patient Header */}
        <div className="patient-header">
          <div className="patient-header-left">
            <img src={patient.image} alt={patient.name} className="patient-detail-avatar" />
            <div className="patient-main-info">
              <h1>{patient.name}</h1>
              <p>Mã hồ sơ: <strong>{patient.id}</strong></p>
              <div className="patient-badges">
                <span className="badge">
                  {patient.gender}
                </span>
                <span className="badge">
                  {patient.birthDate} ({new Date().getFullYear() - parseInt(patient.birthDate.split('/')[2])} tuổi)
                </span>
                <span className="badge status-badge">
                  Bệnh nhân thường xuyên
                </span>
              </div>
            </div>
          </div>
          <div className="patient-header-right">
            <div className="patient-contact-info">
              <p><strong>SĐT:</strong> {patient.phone}</p>
              <p><strong>Email:</strong> {patient.email}</p>
              <p><strong>Địa chỉ:</strong> {patient.address}</p>
            </div>
          </div>
        </div>

        {/* Patient Tabs */}
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
          <div 
            className={`tab ${activeTab === "appointments" ? "active" : ""}`} 
            onClick={() => setActiveTab("appointments")}
          >
            <FaCalendarAlt /> Lịch hẹn
          </div>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === "info" && (
            <div className="tab-pane">
              <div className="info-section vital-signs">
                <h3>Thông số sinh tồn</h3>
                <div className="vital-signs-grid">
                  <div className="vital-item">
                    <h4>Huyết áp</h4>
                    <p>{patient.vitalSigns.bloodPressure}</p>
                  </div>
                  <div className="vital-item">
                    <h4>Nhịp tim</h4>
                    <p>{patient.vitalSigns.heartRate}</p>
                  </div>
                  <div className="vital-item">
                    <h4>Nhiệt độ</h4>
                    <p>{patient.vitalSigns.temperature}</p>
                  </div>
                  <div className="vital-item">
                    <h4>Nhịp thở</h4>
                    <p>{patient.vitalSigns.respiratoryRate}</p>
                  </div>
                  <div className="vital-item">
                    <h4>Chiều cao</h4>
                    <p>{patient.vitalSigns.height}</p>
                  </div>
                  <div className="vital-item">
                    <h4>Cân nặng</h4>
                    <p>{patient.vitalSigns.weight}</p>
                  </div>
                  <div className="vital-item">
                    <h4>BMI</h4>
                    <p>{patient.vitalSigns.bmi}</p>
                  </div>
                  <div className="vital-item">
                    <h4>Nhóm máu</h4>
                    <p>{patient.vitalSigns.bloodType}</p>
                  </div>
                </div>
              </div>

              <div className="info-section allergies">
                <h3>Dị ứng</h3>
                <div className="allergies-list">
                  {patient.allergies.length > 0 ? (
                    patient.allergies.map((allergy, index) => (
                      <div key={index} className="allergy-item">{allergy}</div>
                    ))
                  ) : (
                    <p>Không có dị ứng</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "medical" && (
            <div className="tab-pane">
              <div className="info-section">
                <h3>Lịch sử khám bệnh</h3>
                {patient.medicalHistory.map((record, index) => (
                  <div key={index} className="medical-record">
                    <div className="medical-record-header">
                      <div className="medical-record-date">
                        <strong>Ngày khám:</strong> {record.date}
                      </div>
                      <div className="medical-record-diagnosis">
                        <strong>Chẩn đoán:</strong> {record.diagnosis}
                      </div>
                    </div>
                    <div className="medical-record-details">
                      <p><strong>Bác sĩ:</strong> {record.doctor}</p>
                      <p><strong>Đơn thuốc:</strong> {record.prescription}</p>
                      <p><strong>Ghi chú:</strong> {record.notes}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="info-section">
                <h3>Kết quả xét nghiệm</h3>
                <table className="lab-results-table">
                  <thead>
                    <tr>
                      <th>Ngày</th>
                      <th>Xét nghiệm</th>
                      <th>Kết quả</th>
                      <th>Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patient.labResults.map((lab, index) => (
                      <tr key={index}>
                        <td>{lab.date}</td>
                        <td>{lab.testName}</td>
                        <td>{lab.result}</td>
                        <td>{lab.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "appointments" && (
            <div className="tab-pane">
              <div className="info-section">
                <h3>Lịch hẹn sắp tới</h3>
                {patient.upcomingAppointments.length > 0 ? (
                  <div className="appointments-list">
                    {patient.upcomingAppointments.map((appointment, index) => (
                      <div key={index} className="appointment-item">
                        <div className="appointment-date">
                          <div className="appointment-day">{appointment.date.split('/')[0]}</div>
                          <div className="appointment-month">{appointment.date.split('/')[1]}</div>
                        </div>
                        <div className="appointment-details">
                          <h4>{appointment.time} - {appointment.department}</h4>
                          <p>Bác sĩ: {appointment.doctor}</p>
                          <p className="appointment-status">{appointment.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-data">Không có lịch hẹn sắp tới</p>
                )}
              </div>

              <div className="appointment-actions">
                <button className="action-button primary">Đặt lịch hẹn mới</button>
                <button className="action-button secondary">Xem lịch hẹn trước đây</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PatientDetail;
// src/pages/DoctorHome.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./doctor.css";
import { FaSearch, FaFileAlt, FaSignOutAlt } from "react-icons/fa";
import DoctorSchedule from "./DoctorSchedule";
import MedicalExam from "./MedicalExam";

function DoctorHome() {
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("Khám Bệnh"); // Đổi tab mặc định thành Khám Bệnh

  useEffect(() => {
    // Lấy thông tin doctor từ localStorage
    const userInfo = JSON.parse(localStorage.getItem("user"));
    if (userInfo && userInfo.role === "doctor") {
      setDoctor(userInfo);
      
      // Fetch danh sách bệnh nhân (mẫu)
      fetchPatients();
    } else {
      // Redirect nếu không phải doctor
      window.location.href = "/login";
    }
  }, []);

  const fetchPatients = async () => {
    try {
      // Đây là data mẫu, thay thế bằng API call thực tế
      const dummyPatients = [
        {
          id: "A123",
          name: "Lê Minh Quang",
          dateOfExam: "4/14/2025",
          image: "/images/avatar.png"
        },
        {
          id: "B456",
          name: "Nguyễn Văn An",
          dateOfExam: "4/15/2025",
          image: "/images/avatar.png"
        },
        {
          id: "C789",
          name: "Trần Thị Hương",
          dateOfExam: "4/16/2025",
          image: "/images/avatar.png"
        },
        {
          id: "D012",
          name: "Phạm Văn Bình",
          dateOfExam: "4/17/2025",
          image: "/images/avatar.png"
        }
      ];
      setPatients(dummyPatients);
    } catch (error) {
      console.error("Error fetching patients:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  // Hàm chuyển đến trang chi tiết bệnh nhân
  const viewPatientDetail = (patientId) => {
    navigate(`/patient/${patientId}`);
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!doctor) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="doctor-container">
      {/* Thanh Hello Doctor riêng */}
      <div className="doctor-topbar">
        <span>Hello, Dr.{doctor?.name || "Doctor"}</span>
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

      <div className="doctor-main">
        <aside className="doctor-sidebar">
          <h3>Chức Năng</h3>
          <ul>
            <li 
              className={activeTab === "Khám Bệnh" ? "active" : ""} 
              onClick={() => setActiveTab("Khám Bệnh")}
            >
              Khám Bệnh
            </li>
            <li 
              className={activeTab === "Hồ Sơ" ? "active" : ""} 
              onClick={() => setActiveTab("Hồ Sơ")}
            >
              Hồ Sơ
            </li>
            <li 
              className={activeTab === "Lịch" ? "active" : ""} 
              onClick={() => setActiveTab("Lịch")}
            >
              Lịch Khám Bệnh
            </li>
            <li 
              className={activeTab === "Thông tin" ? "active" : ""} 
              onClick={() => setActiveTab("Thông tin")}
            >
              Thông tin cá nhân
            </li>
          </ul>
          <button className="logout-button" onClick={handleLogout}>
            <FaSignOutAlt /> Đăng xuất
          </button>
        </aside>

        {activeTab === "Hồ Sơ" && (
          <section className="doctor-content">
            <div className="content-header">
              <h2>Hồ Sơ Bệnh Nhân</h2>
              <div className="search-bar">
                <input 
                  type="text" 
                  placeholder="Tìm hồ sơ" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FaSearch className="search-icon" />
              </div>
            </div>

            <div className="patient-cards">
              {filteredPatients.length > 0 ? (
                filteredPatients.map(patient => (
                  <div className="patient-card" key={patient.id}>
                    <div className="card-header">
                      <img src={patient.image} alt={patient.name} />
                      <div className="patient-info">
                        <p><strong>Mã hồ sơ:</strong> {patient.id}</p>
                        <p><strong>Tên:</strong> {patient.name}</p>
                        <p><strong>Ngày khám:</strong> {patient.dateOfExam}</p>
                      </div>
                    </div>
                    <button 
                      className="view-button"
                      onClick={() => viewPatientDetail(patient.id)}
                    >
                      <FaFileAlt /> Xem Thêm
                    </button>
                  </div>
                ))
              ) : (
                <div className="no-results">Không tìm thấy hồ sơ bệnh nhân</div>
              )}
            </div>
          </section>
        )}

        {activeTab === "Lịch" && (
          <section className="doctor-content schedule-content">
            <DoctorSchedule />
          </section>
        )}

        {activeTab === "Khám Bệnh" && (
          <section className="doctor-content">
            <MedicalExam />
          </section>
        )}

        {activeTab === "Thông tin" && (
          <section className="doctor-content">
            <h2>Thông Tin Cá Nhân</h2>
            <div className="doctor-profile">
              <img src="/images/avatar.png" alt="Doctor" className="profile-avatar" />
              <div className="profile-info">
                <p><strong>Tên:</strong> {doctor.name}</p>
                <p><strong>Email:</strong> {doctor.email}</p>
                <p><strong>Chuyên khoa:</strong> {doctor.specialty || "Đa khoa"}</p>
                <p><strong>Số điện thoại:</strong> {doctor.phone || "Chưa cập nhật"}</p>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default DoctorHome;

// src/pages/DoctorHome.jsx
import React from "react";
import "./doctor.css";

function DoctorHome() {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user || user.role !== "doctor") {
    return <h2>Access denied. Doctors only!</h2>;
  }

  return (
    <div className="doctor-container">
      {/* Thanh Hello Doctor riêng */}
      <div className="doctor-topbar">
        <span>Hello, Dr.{user.name}</span>
        <img src="/images/avatar.png" alt="Avatar" className="doctor-avatar" />
      </div>

      {/* Header chứa logo + menu */}
      <header className="doctor-header">
        <img src="/images/logo.png" alt="Logo" className="doctor-logo" />
        <span className="hospital-name">HOA BINH HOSPITAL</span>
        <nav className="doctor-nav">
          <ul>
            <li>HOME</li>
            <li>ABOUT</li>
            <li>SERVICES</li>
            <li>CONTACT</li>
            <li>DASHBOARD</li>
          </ul>
        </nav>
      </header>

      <div className="doctor-main">
        <aside className="doctor-sidebar">
          <h3>Chức Năng</h3>
          <ul>
            <li className="active">Hồ Sơ</li>
            <li>Lịch</li>
            <li>Khám Bệnh</li>
            <li>Thông tin cá nhân</li>
          </ul>
          <div className="logout-icon">↩️</div>
        </aside>

        <section className="doctor-content">
          <h2>Hồ Sơ Bệnh Nhân</h2>
          <div className="search-bar">
            <input type="text" placeholder="Tìm hồ sơ" />
            <button>🔍</button>
          </div>

          <div className="patient-cards">
            <div className="patient-card">
              <div className="card-header">
                <img src="/images/avatar.png" alt="Patient" />
                <div>
                  <p><strong>Mã hồ sơ:</strong> A123</p>
                  <p><strong>Tên:</strong> Lê Minh Quang</p>
                  <p><strong>Ngày khám:</strong> 4/4/2025</p>
                </div>
              </div>
              <div className="view-button">Xem Thêm</div>
            </div>

            {/* Các card trống */}
            <div className="patient-card empty-card"></div>
            <div className="patient-card empty-card"></div>
            <div className="patient-card empty-card"></div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default DoctorHome;

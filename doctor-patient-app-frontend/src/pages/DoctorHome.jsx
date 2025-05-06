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
  const [activeTab, setActiveTab] = useState("Hồ Sơ");
  const [editing, setEditing] = useState(false);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const form = e.target;
    const updatedDoctor = {
      name: form.name.value,
      birthDate: form.birthDate.value,
      CCCD: form.CCCD.value,
      specialty: form.specialty.value,
      phone: form.phone.value,
      address: form.address.value,
      experience: form.experience.value,
      note: form.note.value,
      img: form.imgLink.value || doctor.img,
    };

    try {
      const email = doctor.email;
      const res = await fetch(`http://localhost:5000/api/doctor/update/${email}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedDoctor),
      });
      const data = await res.json();
      alert("Cập nhật thành công!");

      const newDoctor = { ...doctor, ...updatedDoctor };
      setDoctor(newDoctor);
      localStorage.setItem("user", JSON.stringify(newDoctor));
      setEditing(false);
    } catch (err) {
      alert("Cập nhật thất bại!");
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64Image = reader.result;
        setDoctor((prev) => ({ ...prev, img: base64Image }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const password = e.target.oldPassword.value;
    const newPassword = e.target.newPassword.value;

    try {
      const res = await fetch("http://localhost:5000/api/doctor/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: doctor.email, password, newPassword }),
      });

      if (res.ok) {
        alert("Đổi mật khẩu thành công!");
        e.target.reset();
      } else {
        const error = await res.json();
        alert(error.message || "Đổi mật khẩu thất bại!");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi server khi đổi mật khẩu.");
    }
  };

  useEffect(() => {
    // Lấy thông tin doctor từ localStorage
    const userInfo = JSON.parse(localStorage.getItem("user"));
    if (userInfo && userInfo.role === "doctor") {
      setDoctor(userInfo);
      fetchPatients();
    } else {
      // Redirect nếu không phải doctor
      window.location.href = "/";
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
    window.location.href = "/";
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
        <img
          src={doctor?.img || "/images/avatar.png"}
          alt="Avatar"
          className="doctor-avatar"
        />
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
              className={activeTab === "Khám Bệnh" ? "active" : ""}
              onClick={() => setActiveTab("Khám Bệnh")}
            >
              Khám Bệnh
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

            <div className="doctor-profile-container">
              <div className="doctor-profile">
                <label>
                  <img
                    src={doctor.img || "/images/avatar.png"}
                    alt="Doctor"
                    className="profile-avatar"
                    onClick={() => document.getElementById("avatarInput").click()}
                  />
                  <input
                    id="avatarInput"
                    type="file"
                    style={{ display: "none" }}
                    onChange={handleImageUpload}
                    accept="image/*"
                  />
                </label>

                {!editing && (
                  <div className="profile-info">
                    <p><strong>Tên:</strong> {doctor.name}</p>
                    <p><strong>Ngày sinh:</strong> {doctor.birthDate}</p>
                    <p><strong>Email:</strong> {doctor.email}</p>
                    <p><strong>CCCD:</strong> {doctor.CCCD}</p>
                    <p><strong>Chuyên khoa:</strong> {doctor.specialty}</p>
                    <p><strong>SĐT:</strong> {doctor.phone}</p>
                    <p><strong>Địa chỉ:</strong> {doctor.address}</p>
                    <p><strong>Kinh nghiệm:</strong> {doctor.experience}</p>
                    <p><strong>Ghi chú:</strong> {doctor.note}</p>
                  </div>
                )}
              </div>

              {editing ? (
                <form onSubmit={handleProfileUpdate} className="edit-form">
                  <input name="name" defaultValue={doctor.name} required />
                  <input name="birthDate" defaultValue={doctor.birthDate} />
                  <input name="CCCD" defaultValue={doctor.CCCD} />
                  <input name="specialty" defaultValue={doctor.specialty} />
                  <input name="phone" defaultValue={doctor.phone} />
                  <input name="address" defaultValue={doctor.address} />
                  <input name="experience" defaultValue={doctor.experience} />
                  <textarea name="note" defaultValue={doctor.note}></textarea>
                  <input name="imgLink" placeholder="Hoặc dán link ảnh đại diện..." />
                  <button type="submit">Lưu</button>
                </form>
              ) : (
                <button className="edit-profile-btn" onClick={() => setEditing(true)}>✏️ Chỉnh sửa</button>
              )}
            </div>

            <h3>🔒 Đổi mật khẩu</h3>
            <form onSubmit={handleChangePassword} className="password-form">
              <input type="password" name="oldPassword" placeholder="Mật khẩu cũ" required />
              <input type="password" name="newPassword" placeholder="Mật khẩu mới" required />
              <button type="submit">Đổi mật khẩu</button>
            </form>
          </section>
        )}


      </div>
    </div>
  );
}

export default DoctorHome;

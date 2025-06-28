import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStethoscope, FaHeartbeat, FaUsers, FaAward, FaPhone, FaMapMarkerAlt, FaClock, FaArrowRight, FaSignOutAlt } from 'react-icons/fa';
import './doctor.css';

function DoctorHomePage() {
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Lấy thông tin user từ localStorage nếu có
    const userInfo = JSON.parse(localStorage.getItem("user"));
    if (userInfo) {
      setUser(userInfo);
      if (userInfo.role === "doctor") {
        setDoctor(userInfo);
      } else {
        setDoctor(null);
      }
    } else {
      setUser(null);
      setDoctor(null);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setDoctor(null);
    navigate("/login");
  };
  
  const navigateToDashboard = () => {
    if (user) {
      // User is already logged in, navigate to the appropriate dashboard
      if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "doctor") {
        navigate("/doctor"); 
      }
    } else {
      // User not logged in, navigate to login page
      navigate("/login");
    }
  };

  const stats = [
    { number: '50+', label: 'Bác Sĩ Chuyên Khoa', icon: <FaStethoscope /> },
    { number: '10,000+', label: 'Bệnh Nhân Hài Lòng', icon: <FaUsers /> },
    { number: '25+', label: 'Năm Kinh Nghiệm', icon: <FaAward /> },
    { number: '24/7', label: 'Dịch Vụ Khẩn Cấp', icon: <FaHeartbeat /> }
  ];

  const services = [
    {
      title: 'Khám Bệnh Tổng Quát',
      description: 'Dịch vụ khám bệnh toàn diện với đội ngũ bác sĩ chuyên môn',
      icon: <FaStethoscope />
    },
    {
      title: 'Chẩn Đoán Hình Ảnh',
      description: 'Hệ thống máy móc hiện đại: X-quang, CT, MRI, siêu âm',
      icon: <FaHeartbeat />
    },
    {
      title: 'Phẫu Thuật',
      description: 'Phẫu thuật các chuyên khoa với công nghệ tiên tiến',
      icon: <FaUsers />
    },
    {
      title: 'Cấp Cứu 24/7',
      description: 'Dịch vụ cấp cứu khẩn cấp hoạt động 24 giờ',
      icon: <FaAward />
    }
  ];

  return (
    <div className="doctor-container">      <div className="doctor-topbar">
        {user ? (
          <>
            <span>Hello, {user.role === "doctor" ? "Dr." : ""}{user?.name || user?.role || "User"}</span>
            <img
              src={user?.img || "/images/avatar.png"}
              alt="Avatar"
              className="doctor-avatar"
            />
          </>
        ) : null}
      </div>      <header className="doctor-header">
        <div className="logo-section">
          <img src="/images/logo.png" alt="Logo" className="doctor-logo" />
          <span className="hospital-name">HOA BINH HOSPITAL</span>
        </div>
        <nav className="doctor-nav">
          <ul>
            <li className="active" onClick={() => navigate('/')}>HOME</li>
            <li onClick={() => navigate('/about')}>ABOUT</li>
            <li onClick={() => navigate('/services')}>SERVICES</li>
            <li onClick={() => navigate('/contact')}>CONTACT</li>
            <li onClick={navigateToDashboard}>
              {user ? 'DASHBOARD' : 'LOGIN'}
            </li>
            {user && (
              <li onClick={handleLogout} className="logout-item">
                <FaSignOutAlt className="logout-icon" /> LOGOUT
              </li>
            )}
          </ul>
        </nav>
      </header>

      <div className="doctor-main">
        <section className="doctor-content home-content">
          {/* Hero Section */}
          <div className="hero-section">
            <div className="hero-content">
              <div className="hero-text">
                <h1>Chào mừng đến với HOA BINH HOSPITAL</h1>
                <p>Nơi bạn tin tưởng gửi gắm sức khỏe với đội ngũ y bác sĩ chuyên môn cao và trang thiết bị hiện đại</p>
                <div className="hero-buttons">
                  <button className="primary-btn" onClick={() => navigate('/login')}>
                    Vào Dashboard
                  </button>
                  <button className="secondary-btn" onClick={() => navigate('/services')}>
                    Xem Dịch Vụ
                  </button>
                </div>
              </div>
              <div className="hero-image">
                <img src="https://hiephoibenhvientu.com.vn/wp-content/uploads/2018/09/bvhoabinh1.jpg" alt="Bệnh viện Hoa Bình" />
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="stats-section">
            <div className="stats-grid">
              {stats.map((stat, index) => (
                <div key={index} className="stat-card">
                  <div className="stat-icon">{stat.icon}</div>
                  <div className="stat-number">{stat.number}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Services Preview */}
          <div className="services-preview">
            <div className="section-header">
              <h2>Dịch Vụ Y Tế</h2>
              <p>Chúng tôi cung cấp đầy đủ các dịch vụ y tế chất lượng cao</p>
            </div>
            <div className="services-grid">
              {services.map((service, index) => (
                <div key={index} className="service-card">
                  <div className="service-icon">{service.icon}</div>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                  <button className="learn-more-btn">
                    Tìm Hiểu Thêm <FaArrowRight />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* About Preview */}
          <div className="about-preview">
            <div className="about-content">
              <div className="about-text">
                <h2>Về HOA BINH HOSPITAL</h2>
                <p>Với hơn 25 năm kinh nghiệm trong lĩnh vực y tế, HOA BINH HOSPITAL tự hào là một trong những bệnh viện hàng đầu tại TP.HCM.</p>
                <p>Chúng tôi cam kết mang đến dịch vụ y tế chất lượng cao với đội ngũ bác sĩ chuyên môn, trang thiết bị hiện đại và môi trường chăm sóc tận tâm.</p>
                <button className="about-btn" onClick={() => navigate('/about')}>
                  Tìm Hiểu Thêm
                </button>
              </div>
              <div className="about-image">
                <img src="https://hiephoibenhvientu.com.vn/wp-content/uploads/2018/09/bvhoabinh1.jpg" alt="Bệnh viện Hoa Bình" />
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="contact-info">
            <div className="contact-grid">
              <div className="contact-card">
                <div className="contact-icon">
                  <FaPhone />
                </div>
                <h3>Điện Thoại</h3>
                <p>028.3843.9843</p>
                <p>Hotline: 1900.1234</p>
              </div>
              <div className="contact-card">
                <div className="contact-icon">
                  <FaMapMarkerAlt />
                </div>
                <h3>Địa Chỉ</h3>
                <p>123 Đường ABC, Quận 1</p>
                <p>Thành phố Hồ Chí Minh</p>
              </div>
              <div className="contact-card">
                <div className="contact-icon">
                  <FaClock />
                </div>
                <h3>Giờ Làm Việc</h3>
                <p>Thứ 2 - Thứ 7: 7:00 - 20:00</p>
                <p>Chủ Nhật: 8:00 - 17:00</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default DoctorHomePage; 
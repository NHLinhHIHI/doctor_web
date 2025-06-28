import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './about.css';
import { 
  FaUserMd, 
  FaHospital, 
  FaAward, 
  FaUsers, 
  FaCalendarAlt, 
  FaHeartbeat, 
  FaGlobe, 
  FaStethoscope, 
  FaPhoneAlt, 
  FaEnvelope, 
  FaMapMarkerAlt, 
  FaClock, 
  FaStar, 
  FaFacebookF, 
  FaTwitter, 
  FaInstagram, 
  FaLinkedinIn,
  FaMedkit,
  FaSignOutAlt,
} from 'react-icons/fa';

const About = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Animation for timeline items
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
        }
      });
    }, { threshold: 0.3 });
    
    timelineItems.forEach(item => {
      observer.observe(item);
    });
    
    return () => {
      timelineItems.forEach(item => {
        observer.unobserve(item);
      });
    };
  }, []);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("user"));
    if (userInfo) {
      setUser(userInfo);
    } else {
      setUser(null);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
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

  return (
    <div className="about-page">
      {/* Top bar for logged in user */}
      {user && (
        <div className="doctor-topbar">
          <span>Hello, {user.role === "doctor" ? "Dr." : ""}{user?.name || user?.role || "User"}</span>
          <img src={user?.img || "/images/avatar.png"} alt="Avatar" className="doctor-avatar" />
        </div>
      )}
      
      {/* Header */}
      <header className="doctor-header">
        <div className="logo-section">
          <img src="/images/logo.png" alt="Logo" className="doctor-logo" />
          <span className="hospital-name">HOA BINH HOSPITAL</span>
        </div>
        <nav className="doctor-nav">
          <ul>
            <li onClick={() => navigate('/')}>HOME</li>
            <li className="active" onClick={() => navigate('/about')}>ABOUT</li>
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
      
     
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Chăm Sóc Sức Khỏe Tận Tâm</h1>
          <p>Bệnh viện Hoa Bình - Đối tác đáng tin cậy cho sức khỏe của bạn và gia đình</p>
        </div>
      </section>

      {/* About Us Summary */}
      <section className="about-summary-section">
        <div className="container">
          <div className="about-summary-grid"> {/* <-- Sửa ở đây */}
            <div className="about-summary-content">
              <div className="section-subtitle">VỀ CHÚNG TÔI</div>
              <h2 className="section-title-left">
                Bệnh Viện Hoa Bình - 25 Năm Chăm Sóc Sức Khỏe Cộng Đồng
              </h2>
              <p className="about-summary-text">
                Được thành lập vào năm 1999, Bệnh viện Hoa Bình đã trải qua 25 năm phát triển để trở thành một trong những cơ sở y tế đa khoa uy tín hàng đầu. Với đội ngũ y bác sĩ giàu kinh nghiệm cùng cơ sở vật chất hiện đại, chúng tôi cam kết mang đến dịch vụ chăm sóc sức khỏe chất lượng cao, đáp ứng nhu cầu đa dạng của người dân.
              </p>
              <div className="about-features">
                <div className="about-feature-item">
                  <div className="feature-icon"><FaUserMd /></div>
                  <div className="feature-text">
                    <h3>Đội ngũ chuyên môn cao</h3>
                    <p>Bác sĩ giàu kinh nghiệm, được đào tạo trong và ngoài nước</p>
                  </div>
                </div>
                <div className="about-feature-item">
                  <div className="feature-icon"><FaMedkit /></div>
                  <div className="feature-text">
                    <h3>Trang thiết bị hiện đại</h3>
                    <p>Ứng dụng công nghệ tiên tiến trong chẩn đoán và điều trị</p>
                  </div>
                </div>
                <div className="about-feature-item">
                  <div className="feature-icon"><FaHeartbeat /></div>
                  <div className="feature-text">
                    <h3>Chăm sóc tận tâm</h3>
                    <p>Đặt bệnh nhân lên hàng đầu, chăm sóc toàn diện</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default About;

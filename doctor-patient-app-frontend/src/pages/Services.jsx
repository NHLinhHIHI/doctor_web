import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStethoscope, FaHeartbeat, FaUsers, FaAward, FaSearch, FaFilter, FaArrowRight, FaSignOutAlt, FaHeart, FaTint, FaBrain, FaEye, FaTooth, FaBaby, FaFemale, FaMale, FaWheelchair, FaUserMd, FaChild, FaHeadSideCough, FaRegSmile } from 'react-icons/fa';
import './services.css';

function DoctorServices() {
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
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
      } else if (user.role === "patient") {
        // Add patient dashboard navigation when implemented
        navigate("/patient-dashboard");
      } else {
        // Default case or unknown role
        navigate("/login");
      }
    } else {
      // User not logged in, navigate to login page
      navigate("/login");
    }
  };

  const services = [
    {
      id: 1,
      title: 'Khám Nội',
      icon: <FaStethoscope />,
      description: 'Chẩn đoán và điều trị các bệnh lý nội khoa: tim mạch, hô hấp, tiêu hóa, nội tiết... cho người lớn.',
      features: [
        'Khám tổng quát',
        'Tư vấn điều trị nội khoa',
        'Theo dõi bệnh mạn tính',
        'Đo huyết áp, điện tim',
      ],
    },
    {
      id: 2,
      title: 'Khám Ngoại',
      icon: <FaUserMd />,
      description: 'Khám, tư vấn và điều trị các bệnh lý ngoại khoa: chấn thương, tiêu hóa, tiết niệu, phẫu thuật nhỏ...',
      features: [
        'Khám chấn thương',
        'Tư vấn phẫu thuật',
        'Chăm sóc hậu phẫu',
        'Tiểu phẫu, cắt chỉ',
      ],
    },
    {
      id: 3,
      title: 'Khám Nhi',
      icon: <FaChild />,
      description: 'Khám và điều trị các bệnh lý cho trẻ em: hô hấp, tiêu hóa, dinh dưỡng, tiêm chủng...',
      features: [
        'Khám tổng quát trẻ em',
        'Tư vấn dinh dưỡng',
        'Theo dõi phát triển',
        'Tiêm chủng',
      ],
    },
    {
      id: 4,
      title: 'Sản Phụ Khoa',
      icon: <FaFemale />,
      description: 'Khám, tư vấn và điều trị các vấn đề về sản phụ khoa: thai sản, phụ khoa, tầm soát ung thư...',
      features: [
        'Khám thai',
        'Siêu âm thai',
        'Tư vấn kế hoạch hóa',
        'Khám phụ khoa',
      ],
    },
    {
      id: 5,
      title: 'Tai - Mũi - Họng',
      icon: <FaHeadSideCough />,
      description: 'Khám và điều trị các bệnh lý về tai, mũi, họng: viêm xoang, viêm họng, viêm tai, dị ứng...',
      features: [
        'Khám tai, mũi, họng',
        'Nội soi tai mũi họng',
        'Tư vấn điều trị',
        'Lấy dị vật',
      ],
    },
    {
      id: 6,
      title: 'Da Liễu',
      icon: <FaRegSmile />,
      description: 'Khám và điều trị các bệnh lý về da: viêm da, dị ứng, mụn, nấm, tư vấn chăm sóc da...',
      features: [
        'Khám da liễu',
        'Tư vấn điều trị mụn',
        'Điều trị dị ứng, nấm',
        'Tư vấn chăm sóc da',
      ],
    },
  ];

  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
            <li onClick={() => navigate('/')}>HOME</li>
            <li onClick={() => navigate('/about')}>ABOUT</li>
            <li className="active" onClick={() => navigate('/services')}>SERVICES</li>
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
        <section className="doctor-content services-content">
          {/* Hero Section */}
          <div className="services-hero">
            <h1>Dịch Vụ Y Tế</h1>
          </div>
         

          {/* Services Grid */}
          <div className="services-grid">
            {filteredServices.map(service => (
              <div key={service.id} className="service-card">
                <div className="service-header">
                  <div className="service-icon">{service.icon}</div>
                </div>
                <div className="service-content">
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                  <div className="service-features">
                    <h4>Bao gồm:</h4>
                    <ul>
                      {service.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default DoctorServices; 
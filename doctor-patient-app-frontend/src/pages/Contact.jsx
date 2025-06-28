import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPhone, FaMapMarkerAlt, FaClock, FaEnvelope, FaSignOutAlt} from 'react-icons/fa';
import './contact.css';

function DoctorContact() {
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Vui lòng nhập họ tên';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'Vui lòng nhập tiêu đề';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Vui lòng nhập nội dung tin nhắn';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert('Tin nhắn đã được gửi thành công! Chúng tôi sẽ liên hệ lại trong thời gian sớm nhất.');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      setErrors({});
    } catch (error) {
      alert('Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const contactInfo = [
    {
      icon: <FaPhone />,
      title: 'Điện Thoại',
      details: [
        '028.3843.9843',
        'Hotline: 1900.1234'
      ]
    },
    {
      icon: <FaEnvelope />,
      title: 'Email',
      details: [
        'info@hoabinhhospital.com',
        'support@hoabinhhospital.com'
      ]
    },
    {
      icon: <FaMapMarkerAlt />,
      title: 'Địa Chỉ',
      details: [
        '1 Hai Bà Trưng, Quận 1',
        'Thành phố Hồ Chí Minh'
      ]
    },
    {
      icon: <FaClock />,
      title: 'Giờ Làm Việc',
      details: [
        'Thứ 2 - Thứ 7: 7:00 - 20:00',
        'Chủ Nhật: 8:00 - 17:00'
      ]
    }
  ];


  const faqs = [
    {
      question: 'Làm thế nào để đặt lịch khám bệnh?',
      answer: 'Bạn có thể đặt lịch khám bệnh qua điện thoại hoặc trực tiếp tại bệnh viện.'
    },
    {
      question: 'Bệnh viện có nhận bảo hiểm y tế không?',
      answer: 'Có, chúng tôi nhận tất cả các loại bảo hiểm y tế và bảo hiểm sức khỏe. Vui lòng liên hệ để biết thêm chi tiết.'
    },
    {
      question: 'Thời gian chờ khám bệnh có lâu không?',
      answer: 'Thời gian chờ khám bệnh phụ thuộc vào số lượng bệnh nhân. Chúng tôi khuyến khích đặt lịch trước để giảm thời gian chờ đợi.'
    },
    {
      question: 'Bệnh viện có dịch vụ cấp cứu 24/7 không?',
      answer: 'Có, chúng tôi có dịch vụ cấp cứu hoạt động 24/7 với đội ngũ bác sĩ và nhân viên y tế chuyên nghiệp.'
    }
  ];

  return (
    <div className="doctor-container">      <div className="doctor-topbar">
        {user ? (
          <>
            <span>Hello, {user.role === "doctor" ? "Dr." : ""}{user?.name || user?.role || "User"}</span>
            <img src={user?.img || "/images/avatar.png"} alt="Avatar" className="doctor-avatar" />
          </>
        ) : null}
      </div><header className="doctor-header">
        <div className="logo-section">
          <img src="/images/logo.png" alt="Logo" className="doctor-logo" />
          <span className="hospital-name">HOA BINH HOSPITAL</span>
        </div>
        <nav className="doctor-nav">
          <ul>
            <li onClick={() => navigate('/')}>HOME</li>
            <li onClick={() => navigate('/about')}>ABOUT</li>
            <li onClick={() => navigate('/services')}>SERVICES</li>
            <li className="active" onClick={() => navigate('/contact')}>CONTACT</li>
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
        <section className="doctor-content contact-content">
          {/* Hero Section */}
          <div className="contact-hero">
            <h1>Liên Hệ</h1>
            <p>Chúng tôi luôn sẵn sàng hỗ trợ và tư vấn cho bạn</p>
          </div>

          {/* Contact Info */}
          <div className="contact-info-section">
            <div className="contact-grid">
              {contactInfo.map((info, index) => (
                <div key={index} className="contact-card">
                  <div className="contact-icon">{info.icon}</div>
                  <h3>{info.title}</h3>
                  {info.details.map((detail, idx) => (
                    <p key={idx}>{detail}</p>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Contact Form and Map */}
          <div className="contact-main">
            <div className="map-section">
              <div className="section-header">
                <h2>Vị Trí Của Chúng Tôi</h2>
                <p>Bệnh viện HOA BINH HOSPITAL</p>
              </div>
              <div className="map-container">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.424098981303!2d106.6983153!3d10.7769!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTDCsDQ2JzM2LjgiTiAxMDbCsDQxJzU3LjQiRQ!5e0!3m2!1svi!2s!4v1234567890"
                  width="100%"
                  height="400"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="HOA BINH HOSPITAL Location"
                ></iframe>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="faq-section">
            <div className="section-header">
              <h2>Câu Hỏi Thường Gặp</h2>
              <p>Những câu hỏi phổ biến về dịch vụ của chúng tôi</p>
            </div>
            <div className="faq-list">
              {faqs.map((faq, index) => (
                <div key={index} className="faq-item">
                  <h3>{faq.question}</h3>
                  <p>{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        
        </section>
      </div>
    </div>
  );
}

export default DoctorContact;
import React from "react";
import "./login.css";

function Login() {
  const handleLogin = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const res = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        throw new Error("Sai email hoặc mật khẩu!");
      }

      const data = await res.json();
       
      if (!data.user) {
        throw new Error("Dữ liệu trả về không hợp lệ!");
      }
      alert(`Welcome, role: ${data.user.role}`);
      

      // ✅ Lưu thông tin user vào localStorage
      localStorage.setItem("user", JSON.stringify(data.user));
console.log("Lưu vào localStorage:", localStorage.getItem("user"));

      // ✅ Điều hướng
      if (data.user.role === "admin") {
  window.location.href = "/admin";
} else if (data.user.role === "doctor") {
  // ✅ Gọi API profile kèm email query
  const profileRes = await fetch(
    `http://localhost:5000/api/doctor/profile?email=${encodeURIComponent(data.user.email)}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Nếu có token:
        // "Authorization": `Bearer ${data.token}`
      },
    }
  );

  if (!profileRes.ok) throw new Error("Không lấy được profile doctor");

  const profile = await profileRes.json();

  // ✅ Gộp thông tin user và profile
  const fullDoctorInfo = {
    ...data.user,
    ...profile,
  };

  // ✅ Lưu vào localStorage
  localStorage.setItem("user", JSON.stringify(fullDoctorInfo));

  // ✅ Chuyển trang
  window.location.href = "/doctor";
}

 else {
  alert("Bạn không có quyền truy cập.");
}
} catch (err) {
console.error(err);
alert("Đăng nhập thất bại!");
}
  };  

  // Hàm đăng nhập nhanh với role doctor
  const handleQuickDoctorLogin = () => {
    // Tạo một đối tượng doctor giả lập 
    const doctorUser = {
      id: "doctor123",
      name: "Nguyễn Văn A",
      email: "doctor@example.com",
      role: "doctor",
      specialty: "Đa khoa",
      phone: "0123456789"
    };

    // Lưu thông tin doctor vào localStorage
    localStorage.setItem("user", JSON.stringify(doctorUser));
    
    // Chuyển hướng đến trang doctor
    window.location.href = "/doctor";
  };

  return (
    <div className="container">
      <div className="left">
        <img src="/images/logo.png" alt="Logo" className="logo" />
        <h2>Bệnh Viện Tư Nhân<br />Hòa Bình</h2>
      </div>
      <div className="right">
        <img src="/images/avatar.png" className="avatar" />
        {/* ✅ Sửa ở đây */}
        <form onSubmit={handleLogin}>
          <input type="email" name="email" placeholder="UserName" required />
          <input type="password" name="password" placeholder="PassWord" required />
          <label><input type="checkbox" name="remember" /> Remember Account</label>
          <button type="submit">Login</button>
          
          {/* Thêm nút đăng nhập nhanh */}
          <button 
            type="button" 
            onClick={handleQuickDoctorLogin} 
            style={{ 
              marginTop: "10px", 
              backgroundColor: "#1bb9b7",
              color: "white"
            }}
          >
            Đăng nhập nhanh với role Doctor
          </button>
          
          <p><a href="#">Forgot PassWord?</a></p>
          <hr />
          <div className="socials">
            <img src="/images/facebook.png" alt="Facebook" />
            <img src="/images/google.png" alt="Google" />
            <img src="/images/zalo.png" alt="Zalo" />
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;

import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./addDoctorForm.css";

function AddDoctorForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    phone: "",
    address: "",
    specialty: "",
    birthDate: "",
    experience: "",
    note: "",
    CCCD: "",
  });

  const navigate = useNavigate();

  const labels = {
    email: "Email",
    password: "Mật khẩu",
    fullName: "Họ và tên",
    phone: "Số điện thoại",
    address: "Địa chỉ",
    specialty: "Chuyên khoa",
    birthDate: "Ngày sinh",
    experience: "Kinh nghiệm (năm)",
    note: "Ghi chú",
    CCCD: "CCCD/CMND",
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/doctor/create-doctor", formData);
      alert("Tạo bác sĩ thành công!");
      navigate("/admin");
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Thêm bác sĩ mới</h2>
      {Object.keys(formData).map((field) => (
        <div key={field} className="form-group">
          <label>{labels[field]}</label>
          <input
            name={field}
            type={field === "password" ? "password" : "text"}
            value={formData[field]}
            onChange={handleChange}
            required
          />
        </div>
      ))}
      <button type="submit">Tạo</button>
    </form>
  );
}

export default AddDoctorForm;

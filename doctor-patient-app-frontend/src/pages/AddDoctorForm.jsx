import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./addDoctorForm.css";
import {notifySuccess, notifyError} from "../utils/toastUtils"; 
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
  let { name, value } = e.target;

  if (name === "phone" || name === "CCCD") {
    value = value.replace(/\D/g, ""); // Chỉ giữ lại số
  }

  setFormData({ ...formData, [name]: value });
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/doctor/create-doctor", formData);
      notifySuccess(" Tạo bác sĩ thành công!");
      navigate("/admin");
    } catch (err) {
      notifyError(" Lỗi: " + err.message);
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
             type={
          field === "password"
            ? "password"
            : field === "birthDate"
            ? "date"
            : field === "experience" || field === "phone" ||
              field === "CCCD"
            ? "number"
            : "text"
        }
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

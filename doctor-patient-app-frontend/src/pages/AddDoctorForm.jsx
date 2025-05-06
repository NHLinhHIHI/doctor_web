import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import "./addDoctorForm.css"; // Tạo file CSS riêng cho form
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/doctor/create-doctor", formData);
      alert("Doctor created successfully!");
      navigate("/admin");
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create Doctor</h2>
      {[
        "email", "password", "fullName", "phone", "address", "specialty",
        "birthDate", "experience", "note", "CCCD"
      ].map((field) => (
        <div key={field}>
          <label>{field}</label>
          <input
            name={field}
            type={field === "password" ? "password" : "text"}
            value={formData[field]}
            onChange={handleChange}
            required
          />
        </div>
      ))}
      <button type="submit">Create</button>
    </form>
  );
}

export default AddDoctorForm;

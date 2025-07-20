import React, { useState } from "react";
import axios from "axios";
import { notifySuccess, } from "../utils/toastUtils";
const MedicineForm = ({ medicine, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: medicine?.name || "",
    dosage: medicine?.dosage || "",
    company: medicine?.company || "",
    usage: medicine?.usage || "",
    medicine: medicine?.medicine || "",
    unit: medicine?.unit || "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (medicine) {
      await axios.put(`http://localhost:5000/medicine/${medicine.id}`, formData);
      notifySuccess(" Cập nhật thuốc thành công!");
    } else {
      await axios.post(`http://localhost:5000/medicine`, formData);
      notifySuccess(" Thêm thuốc mới thành công!");
    }
    onSave();
    
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>{medicine ? "Sửa thuốc" : "Thêm thuốc mới"}</h3>
      <div>
        <label>Tên thuốc: </label>
        <input name="name" value={formData.name} onChange={handleChange} required />
      </div>
      <div>
        <label>Liều Lượng: </label>
        <input name="dosage" value={formData.dosage} onChange={handleChange} required />
      </div>
       <div>
        <label>Công dụng cơ bản: </label>
        <input name="medicine" value={formData.medicine} onChange={handleChange} required />
      </div>
       <div>
        <label>Dạng: </label>
        <input name="unit" value={formData.unit} onChange={handleChange} required />
      </div>
       <div>
        <label>Cách Sử dụng : </label>
        <input name="usage" value={formData.usage} onChange={handleChange} required />
      </div>
      <div>
        <label>Nhà Sản Xuất: </label>
        <input name="company" value={formData.company} onChange={handleChange} required />
      </div>
      <button type="submit">💾 Lưu</button> <button onClick={onClose}>❌ Huỷ</button>
    </form>
  );
};

export default MedicineForm;

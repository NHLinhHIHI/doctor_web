import React, { useState, useEffect } from 'react';
import './medicalExam.css';
import { FaPlus, FaTrash, FaPrint } from 'react-icons/fa';

const MedicalExam = () => {
  // State cho thông tin bệnh nhân
  const [patientInfo, setPatientInfo] = useState({
    name: '',
    age: '',
    gender: '',
    symptoms: ''
  });

  // State cho đơn thuốc
  const [medications, setMedications] = useState([
    { name: '', dosage: '', quantity: '', frequency: '' }
  ]);

  // State cho ghi chú
  const [notes, setNotes] = useState('');
  
  // Xử lý thay đổi thông tin bệnh nhân
  const handlePatientInfoChange = (e) => {
    const { name, value } = e.target;
    setPatientInfo({
      ...patientInfo,
      [name]: value
    });
  };

  // Xử lý thay đổi thông tin thuốc
  const handleMedicationChange = (index, e) => {
    const { name, value } = e.target;
    const updatedMedications = [...medications];
    updatedMedications[index] = {
      ...updatedMedications[index],
      [name]: value
    };
    setMedications(updatedMedications);
  };

  // Thêm một loại thuốc mới
  const addMedication = () => {
    setMedications([
      ...medications,
      { name: '', dosage: '', quantity: '', frequency: '' }
    ]);
  };

  // Xóa một loại thuốc
  const removeMedication = (index) => {
    if (medications.length === 1) return; // Giữ ít nhất 1 loại thuốc
    const updatedMedications = [...medications];
    updatedMedications.splice(index, 1);
    setMedications(updatedMedications);
  };

  // Lưu đơn thuốc
  const savePrescription = () => {
    // Thông tin đơn thuốc để lưu vào cơ sở dữ liệu
    const prescription = {
      patientInfo,
      medications,
      notes,
      date: new Date().toISOString(),
      doctorId: JSON.parse(localStorage.getItem('user')).id || 'unknown'
    };
    
    console.log('Saving prescription:', prescription);
    // TODO: Gửi đơn thuốc lên server
    
    alert('Đã lưu đơn thuốc thành công!');
  };

  // In đơn thuốc
  const printPrescription = () => {
    window.print();
  };

  // Reset form
  const resetForm = () => {
    setPatientInfo({
      name: '',
      age: '',
      gender: '',
      symptoms: ''
    });
    setMedications([{ name: '', dosage: '', quantity: '', frequency: '' }]);
    setNotes('');
  };

  return (
    <div className="medical-exam-container">
      <h2>Khám Bệnh</h2>

      {/* Thông tin bệnh nhân */}
      <div className="patient-info-section">
        <div className="form-row">
          <div className="form-group full-width">
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Tên bệnh nhân"
              value={patientInfo.name}
              onChange={handlePatientInfoChange}
              className="form-control"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <input
              type="text"
              id="age"
              name="age"
              placeholder="Tuổi"
              value={patientInfo.age}
              onChange={handlePatientInfoChange}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <select
              id="gender"
              name="gender"
              value={patientInfo.gender}
              onChange={handlePatientInfoChange}
              className="form-control"
            >
              <option value="">Giới tính</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </select>
          </div>

          <div className="form-group full-width">
            <input
              type="text"
              id="symptoms"
              name="symptoms"
              placeholder="Triệu chứng"
              value={patientInfo.symptoms}
              onChange={handlePatientInfoChange}
              className="form-control"
            />
          </div>
        </div>
      </div>

      {/* Đơn thuốc */}
      <div className="prescription-section">
        <h3>Đơn thuốc</h3>
        
        <div className="medication-header">
          <div className="medication-name">Tên thuốc</div>
          <div className="medication-dosage">Liều lượng</div>
          <div className="medication-quantity">Số lượng</div>
          <div className="medication-frequency">Lần/ngày</div>
          <div className="medication-action"></div>
        </div>

        {medications.map((medication, index) => (
          <div className="medication-row" key={index}>
            <div className="medication-name">
              <input
                type="text"
                name="name"
                placeholder="Tên thuốc"
                value={medication.name}
                onChange={(e) => handleMedicationChange(index, e)}
                className="form-control"
              />
            </div>
            <div className="medication-dosage">
              <input
                type="text"
                name="dosage"
                placeholder="Liều lượng"
                value={medication.dosage}
                onChange={(e) => handleMedicationChange(index, e)}
                className="form-control"
              />
            </div>
            <div className="medication-quantity">
              <input
                type="text"
                name="quantity"
                placeholder="Số lượng"
                value={medication.quantity}
                onChange={(e) => handleMedicationChange(index, e)}
                className="form-control"
              />
            </div>
            <div className="medication-frequency">
              <input
                type="text"
                name="frequency"
                placeholder="Lần/ngày"
                value={medication.frequency}
                onChange={(e) => handleMedicationChange(index, e)}
                className="form-control"
              />
            </div>
            <div className="medication-action">
              <button 
                className="remove-btn"
                onClick={() => removeMedication(index)}
                disabled={medications.length === 1}
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}

        <div className="add-medication">
          <button className="add-btn" onClick={addMedication}>
            <FaPlus /> Thêm thuốc
          </button>
        </div>
      </div>

      {/* Ghi chú */}
      <div className="notes-section">
        <textarea
          placeholder="Ghi chú"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="form-control"
          rows={3}
        />
      </div>

      {/* Các nút chức năng */}
      <div className="action-buttons">
        <button className="save-btn" onClick={savePrescription}>
          Lưu đơn thuốc
        </button>
        <button className="print-btn" onClick={printPrescription}>
          In đơn thuốc
        </button>
        <button className="reset-btn" onClick={resetForm}>
          Làm mới
        </button>
      </div>
    </div>
  );
};

export default MedicalExam;
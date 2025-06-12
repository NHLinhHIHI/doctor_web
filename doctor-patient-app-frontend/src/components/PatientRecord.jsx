import React, { useEffect, useState, useCallback } from 'react';
import { FaUserCircle, FaHeartbeat, FaWeight, FaEye, FaHistory, FaNotesMedical, FaTimes, FaFileMedical, FaPrint } from 'react-icons/fa';
import './patientRecord.css';
import './medicalHistory.css';
import axios from 'axios';

// Component con để render một bản ghi lịch sử khám
const ExaminationRecord = ({ record, isSelected, onClick, onPrint }) => {
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' });
        } catch (e) { return 'N/A'; }
    };

    return (
        <div 
            className={`history-record ${isSelected ? 'selected' : ''}`}
            onClick={onClick}
        >
            <div className="record-header">
                <span className="record-date">{formatDate(record.examinationDate)}</span>
                <span className="doctor-name">
                    <strong>Bác sĩ:</strong> {record.doctorName || 'N/A'}
                    {record.doctorSpecialty ? ` (${record.doctorSpecialty})` : ''}
                </span>
                {isSelected && (
                    <button className="print-record-btn" onClick={(e) => { e.stopPropagation(); onPrint(); }}>
                        <FaPrint /> In
                    </button>
                )}
            </div>
            {isSelected && (
                <div className="record-body">
                    <div className="record-field"><strong>Triệu chứng:</strong> {record.symptoms || 'Không ghi nhận'}</div>
                    <div className="record-field"><strong>Chẩn đoán:</strong> {record.diagnosis || 'Không ghi nhận'}</div>
                    {record.notes && <div className="record-field"><strong>Ghi chú:</strong> {record.notes}</div>}
                    {record.reExamDate && <div className="record-field reexam"><strong>Ngày tái khám:</strong> {formatDate(record.reExamDate)}</div>}
                    {record.prescriptions?.length > 0 && (
                        <div className="prescription">
                            <strong>Đơn thuốc:</strong>
                            <ul className="medicines-list">
                                {record.prescriptions.map((med, idx) => (
                                    <li key={idx} className="medicine-item">
                                        <span className="medicine-name">{med.medicineName}</span>
                                        {med.dosage && <span className="medicine-detail"> - Liều: {med.dosage}</span>}
                                        {med.frequency && <span className="medicine-detail"> - Tần suất: {med.frequency}</span>}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};


const PatientRecord = ({ patientId, onClose }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [profileData, setProfileData] = useState(null); // Khởi tạo là null
    const [selectedExamId, setSelectedExamId] = useState(null);

    const fetchData = useCallback(async () => {
        if (!patientId) return;

        setLoading(true);
        setError(null);
        console.log(`Bắt đầu tải dữ liệu cho bệnh nhân ID: ${patientId}`);

        try {
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
            
            // 1. Gộp các lệnh gọi API để chạy song song
            const [profileResponse, historyResponse] = await Promise.all([
                axios.get(`${apiUrl}/api/patient-profile/${patientId}`),
                axios.get(`${apiUrl}/api/medicalExam/examination-history/${patientId}`)
            ]);

            console.log('API Profile Response:', profileResponse.data);
            console.log('API History Response:', historyResponse.data);

            if (!profileResponse.data?.success) {
                throw new Error(profileResponse.data?.error || "Lỗi tải hồ sơ chính.");
            }

            // 2. Xử lý và tổng hợp dữ liệu sau khi cả hai API đều trả về
            const profile = profileResponse.data.profile;
            
            // Xử lý NormalProfile từ mảng thành object
            const normalProfile = {
                Name: profile.normalProfile?.[0] || 'N/A',
                DoB: profile.normalProfile?.[1] || 'N/A',
                Phone: profile.normalProfile?.[2] || 'N/A',
                Gender: profile.normalProfile?.[3] || 'N/A',
                CCCD: profile.normalProfile?.[4] || 'N/A',
                Address: profile.normalProfile?.[5] || 'N/A',
            };
            
            // Xử lý HealthProfile từ mảng thành object
            const healthProfile = {
                HeartRate: profile.healthProfile?.[0] || 'N/A',
                Height: profile.healthProfile?.[1] || 'N/A',
                Eye: profile.healthProfile?.[2] || 'N/A',
                Weight: profile.healthProfile?.[3] || 'N/A',
                medicalHistory: profile.healthProfile?.[4] || 'Không có thông tin',
            };
            
            // Lịch sử khám bệnh
            const medicalHistory = historyResponse.data?.success ? historyResponse.data.examinations : [];

            // 3. Chỉ cập nhật State MỘT LẦN DUY NHẤT với dữ liệu hoàn chỉnh
            setProfileData({
                normalProfile,
                healthProfile,
                medicalHistory,
            });

        } catch (err) {
            console.error('Lỗi nghiêm trọng khi tải dữ liệu hồ sơ bệnh nhân:', err);
            setError('Không thể tải hồ sơ bệnh nhân. Vui lòng thử lại sau.');
        } finally {
            // 4. Chỉ set loading false một lần ở cuối cùng
            setLoading(false);
        }
    }, [patientId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const calculateBMI = useCallback(() => {
        const height = parseFloat(profileData?.healthProfile?.Height);
        const weight = parseFloat(profileData?.healthProfile?.Weight);
        if (height > 0 && weight > 0) {
            const heightInM = height / 100;
            return (weight / (heightInM * heightInM)).toFixed(1);
        }
        return 'N/A';
    }, [profileData]);

    // Hàm in phiếu khám được chọn
    const printMedicalRecord = useCallback(() => {
        // ... Logic in ấn của bạn có thể giữ nguyên hoặc tối ưu sau
    }, [selectedExamId, profileData]);

    // ----- BẮT ĐẦU PHẦN RENDER -----
    if (loading) {
        return (
            <div className="patient-record-overlay">
                <div className="patient-record-modal loading-container">
                    <div className="spinner"></div>
                    <p>Đang tải dữ liệu hồ sơ bệnh nhân...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="patient-record-overlay">
                <div className="patient-record-modal error-message">
                    <p>Lỗi: {error}</p>
                    <button onClick={fetchData}>Thử lại</button>
                    <button onClick={onClose}>Đóng</button>
                </div>
            </div>
        );
    }

    if (!profileData) {
        return null; // Hoặc một thông báo không có dữ liệu
    }

    // ----- Giao diện chính -----
    return (
        <div className="patient-record-overlay">
            <div className="patient-record-modal">
                <div className="modal-header">
                    <h2>Hồ Sơ Bệnh Nhân</h2>
                    <button className="close-button" onClick={onClose}><FaTimes /></button>
                </div>
                
                <div className="patient-record-content">
                    {/* Thông tin cá nhân */}
                    <div className="profile-section normal-profile">
                        <h3><FaUserCircle /> Thông Tin Cá Nhân</h3>
                        <div className="profile-data">
                            <div className="profile-field"><span className="field-label">Họ tên:</span><span className="field-value">{profileData.normalProfile.Name}</span></div>
                            <div className="profile-field"><span className="field-label">Ngày sinh:</span><span className="field-value">{profileData.normalProfile.DoB}</span></div>
                            <div className="profile-field"><span className="field-label">Giới tính:</span><span className="field-value">{profileData.normalProfile.Gender}</span></div>
                            <div className="profile-field"><span className="field-label">SĐT:</span><span className="field-value">{profileData.normalProfile.Phone}</span></div>
                            <div className="profile-field"><span className="field-label">CCCD:</span><span className="field-value">{profileData.normalProfile.CCCD}</span></div>
                            <div className="profile-field full-width"><span className="field-label">Địa chỉ:</span><span className="field-value">{profileData.normalProfile.Address}</span></div>
                        </div>
                    </div>

                    {/* Chỉ số sức khỏe */}
                    <div className="profile-section health-profile">
                        <h3><FaHeartbeat /> Chỉ Số Sức Khỏe</h3>
                        <div className="profile-data health-data">
                            <div className="health-metric"><div className="metric-icon"><FaHeartbeat /></div><div className="metric-value">{profileData.healthProfile.HeartRate}</div><div className="metric-label">Nhịp tim</div></div>
                            <div className="health-metric"><div className="metric-icon">↕️</div><div className="metric-value">{profileData.healthProfile.Height}</div><div className="metric-label">Cao (cm)</div></div>
                            <div className="health-metric"><div className="metric-icon"><FaWeight /></div><div className="metric-value">{profileData.healthProfile.Weight}</div><div className="metric-label">Nặng (kg)</div></div>
                            <div className="health-metric"><div className="metric-icon"><FaEye /></div><div className="metric-value">{profileData.healthProfile.Eye}</div><div className="metric-label">Thị lực</div></div>
                            <div className="health-metric"><div className="metric-icon">📊</div><div className="metric-value">{calculateBMI()}</div><div className="metric-label">BMI</div></div>
                        </div>
                        <div className="medical-history-section">
                            <h4><FaHistory /> Tiền sử bệnh</h4>
                            <div className="medical-history-content"><p>{profileData.healthProfile.medicalHistory}</p></div>
                        </div>
                    </div>

                    {/* Lịch sử khám bệnh */}
                    <div className="profile-section medical-history-list">
                        <h3><FaNotesMedical /> Lịch Sử Khám Bệnh</h3>
                        {profileData.medicalHistory?.length > 0 ? (
                            <div className="history-records">
                                {profileData.medicalHistory.map((record) => (
                                    <ExaminationRecord
                                        key={record.id}
                                        record={record}
                                        isSelected={selectedExamId === record.id}
                                        onClick={() => setSelectedExamId(prevId => prevId === record.id ? null : record.id)}
                                        onPrint={printMedicalRecord}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="no-history"><p>Chưa có lịch sử khám bệnh</p></div>
                        )}
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="close-btn" onClick={onClose}>Đóng</button>
                </div>
            </div>
        </div>
    );
};

export default PatientRecord;
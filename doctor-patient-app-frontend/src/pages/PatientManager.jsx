import React, { useEffect, useState } from "react";
import { FaFileAlt } from "react-icons/fa";
import axios from "axios";
import "./patientManager.css";
import PatientDetail2 from "./PatientDetail2";
import { useNavigate } from "react-router-dom";

const PatientManager = ({ onViewDetail }) => {
  const [patients, setPatients] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [expandedDoctors, setExpandedDoctors] = useState({});
const navigate = useNavigate();
  const normalizeDate = (dateStr) => {
  const [ month, day, year] = dateStr.split("/");
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  };

  useEffect(() => {
     fetchPatients();
  }, []);

  const fetchPatients = async () => {
  try {
    const res = await axios.get(`http://localhost:5000/manager/around?date=${selectedDate}`);
    const data = res.data.records;
    setPatients(data); // Không cần lọc nữa
  } catch (err) {
    console.error("Lỗi khi lấy dữ liệu bệnh nhân:", err);
  }
};


  const getStatusText = (status, date) => {
    if (status === "wait") return "Đợi khám";
    if (status === "completed") return `Đã khám ngày ${date}`;
    if (status === "cancel") return "Bị hủy";
    return "";
  };

  // Nhóm dữ liệu theo doctorID
  const groupByDoctor = () => {
    const grouped = {};
    patients.forEach((p) => {
      const key = p.doctorID;
      if (!grouped[key]) {
        grouped[key] = {
          doctorID: p.doctorID,
          doctorName: p.doctorName,
          shift: p.shift,
          room: p.room,
          // docID: p.docID,
          patients: [],
        };
      }
      grouped[key].patients.push(p);
    });
    return Object.values(grouped);
  };

  const toggleExpand = (doctorID) => {
    setExpandedDoctors((prev) => ({
      ...prev,
      [doctorID]: !prev[doctorID],
    }));
  };

  return (
    <div className="patient-manager">
      <h2>Lịch sử khám bệnh  </h2>

      <div className="date-picker-container">
  <label htmlFor="datePicker">Chọn ngày:</label>
  <input
    type="date"
    id="datePicker"
    value={selectedDate}
    onChange={(e) => setSelectedDate(e.target.value)}
  />
  <button className="search-button" onClick={fetchPatients}>Tìm</button>
</div>


      {patients.length > 0 ? (
        <>
          <table className="doctor-summary">
            <thead>
              <tr>
                {/* <th>Mã bác sĩ</th> */}
                <th>Tên</th>
                <th>Ca</th>
                
                <th>Đã khám / Tổng số bệnh nhân </th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {groupByDoctor().map((group) => (
                <React.Fragment key={group.doctorID}>
                  <tr>
                    {/* <td>{group.doctorID}</td> */}
                    <td>{group.doctorName}</td>
                    <td>{group.shift}</td>
                   
                    <td>
  {
    group.patients.filter((p) => p.status === "completed").length
  } / {group.patients.length}
</td>

                    <td>
                      <button onClick={() => toggleExpand(group.doctorID)}>
                        {expandedDoctors[group.doctorID] ? "Ẩn bớt" : "Xem thêm"}
                      </button>
                    </td>
                  </tr>
                  {expandedDoctors[group.doctorID] && (
                    <tr>
                      <td colSpan="6">
                        <div className="patient-cards">
                          {group.patients.map((patient, index) => {
                            const name = patient.patientInfo?.ProfileNormal?.[0] || "Không rõ";
                            const image = "/images/avatar.png";
                            const id = patient.patientId;
                            const ID = patient.docID; 

                            const date = patient.examinationDate;
                            const statusText = getStatusText(patient.status, date);

                            return (
                              <div className="patient-card" key={index}>
                                <div className="card-header">
                                  <img src={image} alt={name} />
                                  <div className="patient-info">
                                    {/* <p><strong>Mã hồ sơ:</strong> {ID}</p> */}
                                    <p><strong>Tên:</strong> {name}</p>
                                    
                                    
                                    <p><strong>Trạng thái:</strong> {statusText}</p>
                                  </div>
                                </div>
                                <button className="view-button"    onClick={() => onViewDetail(id)}>
                                  <FaFileAlt /> Xem Thêm
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <div className="no-results">Không tìm thấy hồ sơ bệnh nhân cho ngày đã chọn</div>
      )}
    </div>
  );
};

export default PatientManager;

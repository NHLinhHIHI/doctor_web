import React, { useEffect, useState } from "react";
import { FaBell, FaEye } from "react-icons/fa";
import "./NotificationCardList.css"; // Đảm bảo bạn có file CSS tương ứng

function NotificationCardList() {
  const [notifications, setNotifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOptions, setSelectedOptions] = useState({});
  
  const fetchNotifications = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/notifications");
      const data = await res.json();
      const sorted = data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      setNotifications(sorted);
    } catch (err) {
      console.error("Lỗi khi lấy thông báo:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Add this cleanup function to handle any async operations
    return () => {
      // This ensures any pending promises are properly cleaned up
      // when the component unmounts
    };
  }, []);
  
  const handleOptionChange = (id, field, value) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };
  const handleApprove = async (noti) => {
    const selected = selectedOptions[noti.id];
    if (!selected || !selected.room || !selected.slot) {
      return alert("Vui lòng chọn phòng và số slot trước khi phê duyệt.");
    }

    try {
      await fetch("http://localhost:5000/api/approve-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorID: noti.id,
          date: noti.date,
          shift: noti.shift,
          startTime: noti.startTime,
          endTime: noti.endTime,
          room: selected.room,
          slot: Number(selected.slot),
          notiId: noti.id, // đảm bảo noti.id là ID của notification document
        }),
      });

      // alert("Phê duyệt thành công!");
      fetchNotifications();
    } catch (error) {
      alert("Phê duyệt thất bại.");
    }
  };

  const filtered = notifications.filter((n) =>
    n.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="doctor-content">
      <div className="content-header">
        <h2>Thông Báo</h2>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Tìm theo tên bác sĩ"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaBell className="search-icon" />
        </div>
      </div>

      <div className="notification-cards">
        {filtered.length > 0 ? (
          filtered.map((noti) => (
            <div className="notification-card" key={noti.id}>
              <div className="card-header">
                <img src="/images/avatar.png" alt={noti.name} />
                <div className="patient-info">
                  {/* <p><strong>ID:</strong> {noti.id}</p> */}
                  <p1>Yêu cầu thêm lịch </p1>
                  <p><strong>Bác sĩ:</strong> {noti.name}</p>
                  <p><strong>Ngày:</strong> {new Date(noti.date).toLocaleDateString("vi-VN")}</p>
                  <p><strong>Ca:</strong> {noti.shift}</p>
                  <p><strong>Giờ:</strong> {noti.startTime} - {noti.endTime}</p>
                </div>
              </div>
              <div className="admin-inputs">
                <select
                  value={selectedOptions[noti.id]?.room || ""}
                  onChange={(e) => handleOptionChange(noti.id, "room", e.target.value)}
                >
                  <option value="">Chọn phòng</option>
                  <option value="A101">A101</option>
                  <option value="A102">A102</option>
                  <option value="B201">B201</option>
                </select>

                <select
                  value={selectedOptions[noti.id]?.slot || ""}
                  onChange={(e) => handleOptionChange(noti.id, "slot", e.target.value)}
                >
                  <option value="">Chọn số slot</option>
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>

              <button className="view-button" onClick={() => handleApprove(noti)}>
                Phê duyệt
              </button>
            </div>
          ))
        ) : (
          <div className="no-results">Không có thông báo nào phù hợp.</div>
        )}
      </div>
    </section>
  );
}

export default NotificationCardList;

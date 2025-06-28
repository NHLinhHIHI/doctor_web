import React, { useState, useEffect } from 'react';
import './doctorSchedule.css';
import { FaFileAlt } from "react-icons/fa";
function AdminSchedule() {
  const [waitingDoctors, setWaitingDoctors] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [slotStatuses, setSlotStatuses] = useState({});
  const [savedSchedules, setSavedSchedules] = useState({}); // Lưu lịch từ Firestore
  const [doneDoctors, setDoneDoctors] = useState([]);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closingSlotInfo, setClosingSlotInfo] = useState(null); // { shift, room, date }
  const [closeReason, setCloseReason] = useState('');
  const [editingSlot, setEditingSlot] = useState(null); // ví dụ: "morning_001"
const [editMode, setEditMode] = useState(false);  
const [rooms, setRooms] = useState([]); // mặc định 2 phòng
const [addingRoom, setAddingRoom] = useState(false);
const [newRoomName, setNewRoomName] = useState('');


  const fetchDoneDoctors = async () => {
    const res = await fetch("http://localhost:5000/schedule2/done");
    const data = await res.json();
    setDoneDoctors(data);
  };
  useEffect(() => {
    fetchDoneDoctors();
  }, []);
  const shifts = ['Morning', 'Afternoon'];
 const handleAddRoom = () => {
  if (!newRoomName.trim()) {
    alert('Tên phòng không được để trống.');
    return;
  }

  if (rooms.includes(newRoomName.trim())) {
    alert(`Phòng ${newRoomName} đã tồn tại.`);
    return;
  }

  setRooms(prev => [...prev, newRoomName.trim()]);
  setNewRoomName('');
  setAddingRoom(false); // ẩn input sau khi thêm
};


  //const rooms = ['001', '002',];
  const fetchWaitingDoctors = async () => {
    try {
      const res = await fetch("http://localhost:5000/schedule2/waiting");
      const data = await res.json();
      setWaitingDoctors(data);
    } catch (error) {
      console.error("Lỗi khi tải bác sĩ chờ duyệt:", error);
    }
  };
  useEffect(() => {
    console.log("Đang gọi fetchWaitingDoctors()");
    fetchWaitingDoctors();
  }, []);

  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatISODate = (date) => {
    const pad = (n) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();
  const formatMonthYear = (date) => date.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });

  const handleDateClick = (date) => {
    setSelectedDate(date);
    const iso = formatISODate(date);
    const newStatus = {};
    // Nếu có dữ liệu đã lưu, cập nhật trạng thái slot
   
    if (savedSchedules[iso]) {
  const { MorningRooms = [], AfternoonRooms = [] } = savedSchedules[iso];

  const allRooms = Array.from(new Set([...MorningRooms, ...AfternoonRooms]));
  setRooms(prev => {
    const combined = [...new Set([...prev, ...allRooms])]; // giữ phòng thủ công nếu có
    return combined.sort();
  });

  MorningRooms.forEach(room => newStatus[`Morning_${room}`] = 'open');
  AfternoonRooms.forEach(room => newStatus[`Afternoon_${room}`] = 'open');
} else {
  // Nếu chưa có lịch: reset về 2 phòng mặc định
  setRooms(['001', '002']);
  
}
setSlotStatuses(newStatus);


  };

  const toggleSlot = (shift, room) => {
    const key = `${shift}_${room}`;
    //const status = slotStatuses[key] || 'closed';
    const isoDate = formatISODate(selectedDate);
    //const hasSchedule = !!savedSchedules[isoDate]; // Kiểm tra xem đã có lịch chưa
    if (savedSchedules[isoDate] && editMode !== key) {
    return; // Không làm gì cả
  }
  
    setSlotStatuses((prev) => ({
      ...prev,
      [key]: prev[key] === 'open' ? 'closed' : 'open',
    }));

  };
  const handleReopenSlot = async (date, shift, room) => {
  try {
    const res = await fetch('http://localhost:5000/schedule2/reopen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, shift, room }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Không thể mở lại ca');
    alert('Đã mở lại ca thành công!');
    fetchSchedules();
  } catch (err) {
    console.error(err);
    alert('Lỗi khi mở lại ca');
  }
};

const handleCloseSlot = async (date, shift, room, note) => {
  try {
    const res = await fetch('http://localhost:5000/schedule2/close', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, shift, room, note }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Không thể đóng ca');
    alert('Đã đóng ca thành công!');
    fetchSchedules();
  } catch (err) {
    console.error(err);
    alert('Lỗi khi đóng ca');
  }
};

  const handleSaveSchedule = async () => {
    if (!selectedDate) {
      alert('Vui lòng chọn ngày');
      return;
    }

    const isoDate = formatISODate(selectedDate);

    const MorningRooms = rooms.filter(room => slotStatuses[`Morning_${room}`] === 'open');
    const AfternoonRooms = rooms.filter(room => slotStatuses[`Afternoon_${room}`] === 'open');

    if (MorningRooms.length === 0 && AfternoonRooms.length === 0) {
      alert('Bạn chưa chọn phòng nào để mở!');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/schedule2/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: isoDate,
          MorningRooms,
          AfternoonRooms
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Lưu lịch thất bại');
      }

      alert('Lịch đã được lưu thành công!');
      await fetchSchedules();

    } catch (err) {
      alert(err.message);
    }
  };



  const handleApproveDoctor = async (doctorID, date, shift, room) => {
    try {
      const res = await fetch("http://localhost:5000/schedule2/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctorID, date, shift, room }),
      });
      await fetchWaitingDoctors(); // cập nhật danh sách đang chờ

      if (!res.ok) throw new Error("Xét duyệt thất bại");

      alert("Đã xét duyệt thành công!");

      // Cập nhật lại danh sách bác sĩ chờ
      fetchWaitingDoctors();
    } catch (err) {
      console.error("Lỗi xét duyệt:", err);
      alert("Có lỗi xảy ra khi xét duyệt");
    }
  };
  const handleCancelDoctor = async (doctorID, date, shift, room) => {
    try {
      const res = await fetch("http://localhost:5000/schedule2/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctorID, date, shift, room }),
      });
      await fetchWaitingDoctors(); // cập nhật danh sách đang chờ

      if (!res.ok) throw new Error("Xét duyệt thất bại");

      alert("Đã từ tốiS duyệt thành công!");

      // Cập nhật lại danh sách bác sĩ chờ
      fetchWaitingDoctors();
    } catch (err) {
      console.error("Lỗi xét duyệt:", err);
      alert("Có lỗi xảy ra khi xét duyệt");
    }
  };


  const fetchSchedules = async () => {
    try {
      const res = await fetch("http://localhost:5000/schedule2/getall");
      if (!res.ok) throw new Error("Không thể tải lịch");
      const data = await res.json();


      // Chuyển về object theo date
      const schedulesMap = {};
      data.forEach(sch => {
        schedulesMap[sch.date] = {
          MorningRooms: sch.MorningRooms || [],
          AfternoonRooms: sch.AfternoonRooms || []
        };
      });
      const allRoomsSet = new Set();

data.forEach(sch => {
  sch.MorningRooms?.forEach(room => allRoomsSet.add(room));
  sch.AfternoonRooms?.forEach(room => allRoomsSet.add(room));
});

setRooms(prevRooms => {
  const combined = [...new Set([...prevRooms, ...allRoomsSet])]; // giữ cả phòng mới được thêm thủ công
  return combined.sort(); // sắp xếp để dễ nhìn
});

      fetchDoneDoctors();

      setSavedSchedules(schedulesMap);
    } catch (err) {
      console.error(err);
    }
  };


  useEffect(() => {
    fetchSchedules();
  }, []);

  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    const calendar = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      calendar.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isSelected = selectedDate &&
        date.getDate() === selectedDate.getDate() &&
        date.getMonth() === selectedDate.getMonth() &&
        date.getFullYear() === selectedDate.getFullYear();

      const iso = formatISODate(date);
      const hasSchedule = !!savedSchedules[iso];

      calendar.push(
        <div
          key={day}
          className={`calendar-day ${isSelected ? 'selected' : ''} ${hasSchedule ? 'has-schedule' : ''}`}
          onClick={() => handleDateClick(date)}
        >
          {day}
        </div>
      );
    }

    return calendar;
  };

  const getDayName = (date) => {
    const days = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
    return days[date.getDay()];
  };

  return (
    <div className="main-container">
      <div className="doctor-schedule">
        <div className="calendar-container">
          <div className="calendar-header">
            <button className="month-nav" onClick={goToPreviousMonth}>&lt;</button>
            <h2>{formatMonthYear(currentDate)}</h2>
            <button className="month-nav" onClick={goToNextMonth}>&gt;</button>
          </div>

          <div className="weekdays">
            <div>CN</div><div>T2</div><div>T3</div><div>T4</div><div>T5</div><div>T6</div><div>T7</div>
          </div>

          <div className="calendar-grid">
            {generateCalendar()}
          </div>
        </div>

        {selectedDate && (
          <div className="selected-date-info">
            <h3>{getDayName(selectedDate)}, {formatDate(selectedDate)}</h3>
            {savedSchedules[formatISODate(selectedDate)] && (
  <div className="edit-mode-toggle">
  <label className="switch">
    <input
      type="checkbox"
      checked={editMode}
      onChange={() => setEditMode(prev => !prev)}
    />
    <span className="slider round"></span>
  </label>
  <span style={{ marginLeft: '10px' }}>
    {editMode ? 'Đang chỉnh sửa' : 'Chế độ xem'}
  </span>
</div>
            )}

          

            {shifts.map((shift) =>
              rooms.map((room) => {
                

                const key = `${shift}_${room}`;
                // const status1 = slotStatuses[key] || 'closed';
                const isoDate = formatISODate(selectedDate);
                //const slotKey = `${isoDate}_${shift}_${room}`;
                // const key2 = `${isoDate}_${shift}_${room}`;
                const status = slotStatuses[key] || 'closed';
                const startTime = shift === 'Morning' ? '08:00' : '13:00';
                const endTime = shift === 'Afternoon' ? '17:00' : '12:00';
                const doctor = doneDoctors.find(doc =>
                  doc.date === isoDate && doc.shift === shift && doc.room === room

                );

                return (
                  
                  <div
                      key={key}
                      className={`schedule-item ${status}`}
                      style={{ cursor: editMode ? 'default' : 'pointer' }}
                      onClick={() => {
                        if (!editMode) toggleSlot(shift, room);}}
                        >
                    <div className="schedule-weather"><i className="weather-icon">📅</i></div>
                    <div className="schedule-details">
                      <div className="schedule-shift">{shift}</div>
                      <div className="schedule-time">{startTime} - {endTime}</div>
                      <div className="schedule-shift">Phòng: {room}</div>
                      {doctor && (
                        <div className="doctor-booked">
                          <img src={doctor.image} alt={doctor.name} className="doctor-avatar" />
                          <p className="schedule-shift"> Dr.{doctor.name} Đã đặc phòng </p>
                        </div>
                      )}
                    </div>

                    <div className={`schedule-status ${status}`}>
                      <span>{status === 'open' ? 'Open' : 'Closed'}</span>
                    </div>
                    {editMode && (
    <div className="edit-actions">
      {status === 'open' ? (
        <button
          className="btn-close"
          onClick={(e) => {
            e.stopPropagation(); // tránh click lan lên slot
            const reason = prompt("Lý do đóng ca:");
            if (reason) {
              handleCloseSlot(formatISODate(selectedDate), shift, room, reason);
            }
          }}
        >
          Đóng phòng 
        </button>
      ) : (
        <button
          className="btn-open"
          onClick={(e) => {
            e.stopPropagation();
            handleReopenSlot(formatISODate(selectedDate), shift, room);
          }}
        >
          Mở phòng
        </button>
      )}
    </div>
  )}

                  </div>
                  
                );
              })
            )}
<div className="add-room-section" style={{ marginBottom: '10px' }}>
  {!addingRoom ? (
    <button onClick={() => setAddingRoom(true)} className="btn btn-primary">+ Thêm phòng</button>
  ) : (
    <div>
      <input
        type="text"
        placeholder="Nhập tên phòng (VD: 101)"
        value={newRoomName}
        onChange={(e) => setNewRoomName(e.target.value)}
        className="room-input"
        style={{ marginRight: '8px' }}
      />
      <button onClick={handleAddRoom} className="btn btn-success">Lưu</button>
      <button onClick={() => { setAddingRoom(false); setNewRoomName(''); }} className="btn btn-secondary" style={{ marginLeft: '5px' }}>Hủy</button>
    </div>
  )}
</div>

            {!savedSchedules[formatISODate(selectedDate)] && (
              <button className="save-btn" onClick={handleSaveSchedule}>
                Thêm lịch
              </button>
            )}
            
            <div style={{ marginTop: '50px' }}>
              {/* Nơi hiển thị trạng thái đang xét duyệt nếu muốn */}
            </div>
          </div>
        )}
      </div>

      <div className="waiting-doctor-section">

        <h3>Bác sĩ đang chờ xét duyệt</h3>
        <div className="doctor-cards">
          {waitingDoctors.length > 0 ? (
            waitingDoctors.map((doctor, index) => (
              <div className="doctor-card" key={index}>
                <div className="card-header">
                  <img src={doctor.image} alt={doctor.name} />
                  <div className="patient-info">
                    <p className="schedule-shift"><strong>Tên Bác Sĩ:</strong> {doctor.name}</p>
                    <p className="schedule-shift"><strong>Ngày làm:</strong> {doctor.date}</p>
                    <p className="schedule-shift"><strong>Ca làm:</strong> {doctor.shift}</p>
                    <p className="schedule-shift"><strong>Phòng:</strong> {doctor.room}</p>
                  </div>
                </div>
               <button onClick={() => handleApproveDoctor(doctor.doctorID, doctor.date, doctor.shift, doctor.room)}>Duyệt</button>
        <button onClick={() => handleCancelDoctor(doctor.doctorID, doctor.date, doctor.shift, doctor.room)}>Từ chối</button>
      
              </div>
            ))
          ) : (
            <p>Không có bác sĩ nào đang chờ xét duyệt</p>
          )}
        </div>
      </div>
      {showCloseModal && closingSlotInfo && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Đóng phòng khám</h3>
            <p><strong>Phòng:</strong> {closingSlotInfo.room}</p>
            <p><strong>Ca:</strong> {closingSlotInfo.shift}</p>
            <p><strong>Ngày:</strong> {formatDate(closingSlotInfo.date)}</p>
            <textarea
              placeholder="Nhập lý do đóng phòng..."
              value={closeReason}
              onChange={(e) => setCloseReason(e.target.value)}
            />
            <div className="modal-actions">
              <button
                onClick={() => {
                  if (!closeReason.trim()) {
                    alert("Vui lòng nhập lý do");
                    return;
                  }
                  const key = `${closingSlotInfo.shift}_${closingSlotInfo.room}`;
                  const isoDate = formatISODate(closingSlotInfo.date);

                  // Gửi lý do về backend
                  fetch("http://localhost:5000/notifications/notify-cancel", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      date: isoDate,
                      shift: closingSlotInfo.shift,
                      room: closingSlotInfo.room,
                      note: closeReason,
                    }),
                  })
                    .then((res) => res.json())
                    .then((data) => {
                      if (data.success) {
                        alert("Đã đóng phòng và lưu lý do");
                        setSlotStatuses(prev => ({
                          ...prev,
                          [key]: 'closed'
                        }));
                      } else {
                        alert("Đóng phòng thất bại: " + data.message);
                      }
                      setShowCloseModal(false);
                      setCloseReason('');
                    })
                    .catch((err) => {
                      console.error("Lỗi khi gửi lý do đóng phòng:", err);
                      alert("Có lỗi xảy ra khi đóng phòng.");
                      setShowCloseModal(false);
                      setCloseReason('');
                    });

                }}
              >
                Xác nhận
              </button>
              <button onClick={() => {
                setShowCloseModal(false);
                setCloseReason('');
              }}>Hủy</button>
            </div>
          </div>
        </div>
      )}

    </div>


  );
}
//nut themlich disabled khi chon ngay da co lich
export default AdminSchedule;

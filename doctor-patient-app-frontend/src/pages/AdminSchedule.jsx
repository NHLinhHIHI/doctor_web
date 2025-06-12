import React, { useState, useEffect } from 'react';
import './doctorSchedule.css';

function AdminSchedule() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [slotStatuses, setSlotStatuses] = useState({});
  const [savedSchedules, setSavedSchedules] = useState({}); // Lưu lịch từ Firestore

  const shifts = ['Ca sáng', 'Ca chiều'];
  const rooms = ['001', '002'];

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

    // Nếu có dữ liệu đã lưu, cập nhật trạng thái slot
    if (savedSchedules[iso]) {
      const newStatus = {};
      savedSchedules[iso].morningRooms.forEach(room => newStatus[`Ca sáng_${room}`] = 'open');
      savedSchedules[iso].afternoonRooms.forEach(room => newStatus[`Ca chiều_${room}`] = 'open');
      setSlotStatuses(newStatus);
    } else {
      setSlotStatuses({});
    }
  };

  const toggleSlot = (shift, room) => {
    const key = `${shift}_${room}`;
    setSlotStatuses(prev => ({
      ...prev,
      [key]: prev[key] === 'open' ? 'closed' : 'open'
    }));
  };

  const handleSaveSchedule = async () => {
    if (!selectedDate) {
      alert('Vui lòng chọn ngày');
      return;
    }

    const isoDate = formatISODate(selectedDate);
    const morningRooms = rooms.filter(room => slotStatuses[`Ca sáng_${room}`] === 'open');
    const afternoonRooms = rooms.filter(room => slotStatuses[`Ca chiều_${room}`] === 'open');

    if (morningRooms.length === 0 && afternoonRooms.length === 0) {
      alert('Bạn chưa chọn phòng nào để mở!');
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/schedule/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: isoDate,
          morningRooms,
          afternoonRooms
        }),
      });

      if (!res.ok) throw new Error("Không thể thêm lịch");
      alert("Lịch đã được thêm vào hệ thống!");

      // Cập nhật lại savedSchedules sau khi thêm
      setSavedSchedules(prev => ({
        ...prev,
        [isoDate]: { morningRooms, afternoonRooms }
      }));
    } catch (err) {
      console.error(err);
      alert("Lỗi khi thêm lịch");
    }
  };

  const fetchSchedules = async () => {
    try {
      const res = await fetch("http://localhost:5000/schedule/all");
      if (!res.ok) throw new Error("Không thể tải lịch");
      const data = await res.json();

      // Chuyển về object theo date
      const schedulesMap = {};
      data.forEach(sch => {
        schedulesMap[sch.date] = {
          morningRooms: sch.morningRooms || [],
          afternoonRooms: sch.afternoonRooms || []
        };
      });

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

          {shifts.map((shift) =>
            rooms.map((room) => {
              const key = `${shift}_${room}`;
              const status = slotStatuses[key] || 'closed';
              const startTime = shift === 'Ca sáng' ? '08:00' : '13:00';
              const endTime = shift === 'Ca sáng' ? '12:00' : '17:00';

              return (
                <div
                  key={key}
                  className={`schedule-item ${status}`}
                  onClick={() => toggleSlot(shift, room)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="schedule-weather"><i className="weather-icon">📅</i></div>
                  <div className="schedule-details">
                    <div className="schedule-shift">{shift}</div>
                    <div className="schedule-time">{startTime} - {endTime}</div>
                    <div className="schedule-room">Phòng: {room}</div>
                  </div>
                  <div className={`schedule-status ${status}`}>
                    <span>{status === 'open' ? 'Open' : 'Closed'}</span>
                  </div>
                </div>
              );
            })
          )}

          <button className="save-btn" onClick={handleSaveSchedule}>
            Thêm lịch
          </button>

          <div style={{ marginTop: '50px' }}>
            {/* Nơi hiển thị trạng thái đang xét duyệt nếu muốn */}
          </div>
        </div>
      )}
      
    </div>
  );
}

export default AdminSchedule;

import React, { useState, useEffect } from 'react';
import './doctorSchedule.css'; // Dùng lại CSS của admin nếu giống

function DoctorScheduleView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [savedSchedules, setSavedSchedules] = useState({});
  const [doctor, setDoctor] = useState(null);
  const [doneDoctors, setDoneDoctors] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const shifts = ['Morning', 'Afternoon'];
 

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
  };
  const fetchNotifications = async (doctorID) => {
  try {
    const res = await fetch(`http://localhost:5000/notifications/getnotiID?doctorID=${doctorID}`);

    if (!res.ok) throw new Error("Không thể tải thông báo.");
    const data = await res.json();
    setNotifications(data);
  } catch (err) {
    console.error("Lỗi khi lấy thông báo:", err);
  }
};


  const handleRegister = async (shift, room) => {
  if (!selectedDate || !doctor) return;

  const dateStr = formatISODate(selectedDate);

  // ✅ 1. Kiểm tra nếu bác sĩ đã đăng ký ca này (dù là phòng nào)
  const alreadyRegisteredSameShift = doneDoctors.some(d =>
    d.date === dateStr && d.shift === shift && d.doctorID === doctor.id
  );

  if (alreadyRegisteredSameShift) {
    alert(`Bạn đã đăng ký một phòng khác trong ca ${shift}. Không thể đăng ký thêm.`);
    return;
  }

  // ✅ 2. Kiểm tra nếu có bác sĩ khác đã đăng ký cùng ca + phòng này
  const slotTakenByAnother = doneDoctors.some(d =>
    d.date === dateStr && d.shift === shift && d.room === room && d.doctorID !== doctor.id
  );

  if (slotTakenByAnother) {
    alert("Phòng này đã được đặt bởi bác sĩ khác.");
    return;
  }

  const confirm = window.confirm(`Bạn có muốn đăng ký ${shift}, phòng ${room} ngày ${formatDate(selectedDate)} không?`);
  if (!confirm) return;

  try {
    const res = await fetch("http://localhost:5000/schedule2/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: dateStr,
        shift,
        room,
        doctorID: doctor.id
      })
    });

    const result = await res.json();
    if (res.ok) {
      alert("Đăng ký thành công. Đang đợi admin duyệt.");
      fetchDoneDoctors(); // Refresh lại danh sách để phản ánh
    } else {
      alert(`Lỗi: ${result.message}`);
    }
  } catch (err) {
    console.error("Đăng ký thất bại:", err);
    alert("Lỗi khi đăng ký ca.");
  }
};

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("user"));
    if (userInfo && userInfo.role === "doctor") {
      setDoctor(userInfo); // doctor.id dùng trong đăng ký
      fetchSchedules();
      fetchNotifications(userInfo.id);
      fetchDoneDoctors();
      
      setSelectedDate(new Date());
    } else {
      window.location.href = "/";
    }
  }, []);  

  const fetchSchedules = async () => {
    try {
      const res = await fetch("http://localhost:5000/schedule2/getall");
      if (!res.ok) throw new Error("Không thể tải lịch");
      const data = await res.json();
      

      const schedulesMap = {};
      data.forEach(sch => {
        schedulesMap[sch.date] = {
          MorningRooms: sch.MorningRooms || [],
          AfternoonRooms: sch.AfternoonRooms || []
        };
      });
      

      setSavedSchedules(schedulesMap);
    } catch (err) {
      console.error(err);
    }
  };
  const fetchDoneDoctors = async () => {
    try {
      const res = await fetch("http://localhost:5000/schedule2/done");
      const data = await res.json();
      setDoneDoctors(data);
    } catch (err) {
      console.error("Lỗi khi tải lịch đã đặt:", err);
    }
  };


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
    <div className="doctor-schedule1">
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

      {selectedDate && (() => {
        const isoDate = formatISODate(selectedDate);
        const schedule = savedSchedules[isoDate];

        if (!schedule) {
          return <div className="selected-date-info"><h3>Không có ca nào được mở trong ngày này</h3></div>;
        }

        return (
          <div className="selected-date-info">
            
            
        <h3>{getDayName(selectedDate)}, {formatDate(selectedDate)}</h3>

       {shifts.map((shift) => {
  const openRooms = shift === 'Morning'
    ? (schedule.MorningRooms || [])
    : (schedule.AfternoonRooms || []);

  return openRooms.map((room) => {
    const startTime = shift === 'Morning' ? '08:00' : '13:00';
    const endTime = shift === 'Morning' ? '12:00' : '17:00';
    
    const doneSlot = doneDoctors.find(d =>
      d.date === isoDate && d.shift === shift && d.room === room
    );
    const isMine = doneSlot && doneSlot.doctorID === doctor.id;

    return (
      <div 
        key={`${shift}_${room}`} 
        className={`schedule-item ${doneSlot ? 'booked' : 'open'}`}
        onClick={() => {
          if (doneSlot && !isMine) {
            alert(`Phòng này đã được đặt bởi bác sĩ khác ${doneSlot.name}`);
          } else if (!doneSlot) {
            handleRegister(shift, room);
          }
        }}
      >
        <div className="schedule-weather"><i className="weather-icon">📅</i></div>
        <div className="schedule-details">
          <div className="schedule-shift">{shift}</div>
          <div className="schedule-time">{startTime} - {endTime}</div>
          <div className="schedule-shift">Phòng: {room}</div>
        </div>
        <div className={`schedule-status ${doneSlot ? 'booked' : 'open'}`}>
          {doneSlot ? (
            isMine ? <span>✅ Bạn đã đặt</span> : <span>❌ Đã đặt</span>
          ) : <span>Open</span>}
        </div>
      </div>
    );
  });
})}

          </div>
          
        );
      })()}
     
    </div>{notifications.length > 0 && (
      <div className="notifications-section">
        <h3>🔔 Thông báo của bạn</h3>
        <table className="notifications-table">
          <thead>
            <tr>
              
              <th>Ca</th>
              <th>Phòng</th>
              <th>Ngày</th>
              <th>Trạng thái </th>
              <th>Thời gian tạo</th>
            </tr>
          </thead>
          <tbody>
            {notifications.map((n) => (
              <tr key={n.id}>
                
                <td>{n.shift}</td>
                <td>{n.room}</td>
                <td>{n.date}</td>
                <td>{n.action || n.Note || '...'}</td>
                <td>
  {new Date(n.createdAt?._seconds * 1000).toLocaleString() || "Không rõ"}
</td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
    
    </div>
    
  );
}

export default DoctorScheduleView;

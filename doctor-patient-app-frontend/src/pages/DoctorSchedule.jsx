import React, { useState, useEffect } from 'react';
import './doctorSchedule.css';

function DoctorSchedule() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [newSchedule, setNewSchedule] = useState({
    date: '',
    shift: 'Ca sáng',
    startTime: '08:00',
    endTime: '12:00',
    room: '001', // Thêm trường room với giá trị mặc định
  });

  // Tạo dữ liệu lịch mẫu
  useEffect(() => {
    const dummySchedules = [
      {
        date: '26/04/2025',
        shift: 'Ca chiều',
        startTime: '13:00',
        endTime: '17:00',
        room: '001',
        status: 'open'
      }
    ];
    setSchedules(dummySchedules);
  }, []);

  // Chuyển đổi định dạng date
  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Lấy ngày trong tháng
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Lấy ngày đầu tiên của tháng
  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  // Tạo lịch
  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    
    const calendar = [];
    
    // Thêm ngày trống vào đầu tháng
    for (let i = 0; i < firstDayOfMonth; i++) {
      calendar.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }
    
    // Thêm các ngày trong tháng
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateFormatted = formatDate(date);
      
      // Kiểm tra xem ngày này có lịch làm việc không
      const hasSchedule = schedules.some(schedule => schedule.date === dateFormatted);
      
      // Kiểm tra xem ngày đã chọn có phải là ngày hiện tại
      const isSelected = selectedDate && day === selectedDate.getDate() && 
                     month === selectedDate.getMonth() && 
                     year === selectedDate.getFullYear();
                     
      // Kiểm tra ngày hiện tại
      const isToday = new Date().getDate() === day && 
                    new Date().getMonth() === month && 
                    new Date().getFullYear() === year;
      
      calendar.push(
        <div 
          key={day} 
          className={`calendar-day ${hasSchedule ? 'has-schedule' : ''} ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
          onClick={() => handleDateClick(date)}
        >
          {day}
        </div>
      );
    }
    
    return calendar;
  };

  // Xử lý khi chọn ngày
  const handleDateClick = (date) => {
    setSelectedDate(date);
    setShowAddForm(false);
  };

  // Chuyển tháng trước
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  // Chuyển tháng sau
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Format tháng năm hiển thị
  const formatMonthYear = (date) => {
    const options = { month: 'long', year: 'numeric' };
    return date.toLocaleDateString('vi-VN', options);
  };

  // Xử lý khi thay đổi form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSchedule(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Lưu lịch mới
  const handleSaveSchedule = () => {
    const formattedDate = selectedDate ? formatDate(selectedDate) : newSchedule.date;
    
    const newScheduleItem = {
      date: formattedDate,
      shift: newSchedule.shift,
      startTime: newSchedule.startTime,
      endTime: newSchedule.endTime,
      room: newSchedule.room,  // Sử dụng giá trị phòng từ state
      status: 'open'  // Mặc định
    };
    
    setSchedules([...schedules, newScheduleItem]);
    setShowAddForm(false);
    setNewSchedule({
      date: '',
      shift: 'Ca sáng',
      startTime: '08:00',
      endTime: '12:00',
      room: '001',
    });
  };

  // Hủy thêm lịch
  const handleCancelAddSchedule = () => {
    setShowAddForm(false);
  };

  // Lấy lịch cho ngày đã chọn
  const getSchedulesForSelectedDate = () => {
    if (!selectedDate) return [];
    
    const dateFormatted = formatDate(selectedDate);
    return schedules.filter(schedule => schedule.date === dateFormatted);
  };

  const selectedDateSchedules = getSchedulesForSelectedDate();
  const currentMonthYear = formatMonthYear(currentDate);
  
  // Lấy tên ngày trong tuần
  const getDayName = (date) => {
    const days = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
    return days[date.getDay()];
  };

  return (
    <div className="doctor-schedule">
      <div className="calendar-container">
        <div className="calendar-header">
          <button className="month-nav" onClick={goToPreviousMonth}>&lt;</button>
          <h2>{currentMonthYear}</h2>
          <button className="month-nav" onClick={goToNextMonth}>&gt;</button>
        </div>
        
        <div className="weekdays">
          <div>CN</div>
          <div>T2</div>
          <div>T3</div>
          <div>T4</div>
          <div>T5</div>
          <div>T6</div>
          <div>T7</div>
        </div>
        
        <div className="calendar-grid">
          {generateCalendar()}
        </div>
        
        <button className="add-schedule-btn" onClick={() => setShowAddForm(true)}>
          + Thêm lịch
        </button>
      </div>

      {selectedDate && (
        <div className="selected-date-info">
          <h3>{getDayName(selectedDate)}, {formatDate(selectedDate)}</h3>
          
          {selectedDateSchedules.length > 0 ? (
            selectedDateSchedules.map((schedule, index) => (
              <div key={index} className="schedule-item">
                <div className="schedule-weather">
                  <i className="weather-icon">☁️</i>
                </div>
                <div className="schedule-details">
                  <div className="schedule-shift">{schedule.shift}</div>
                  <div className="schedule-time">{schedule.startTime} - {schedule.endTime}</div>
                  <div className="schedule-room">Phòng: {schedule.room}</div>
                </div>
                <div className={`schedule-status ${schedule.status}`}>
                  <span>{schedule.status === 'open' ? 'Open' : 'Closed'}</span>
                </div>
              </div>
            ))
          ) : (
            <p>Không có lịch làm việc cho ngày này</p>
          )}
        </div>
      )}

      {showAddForm && (
        <div className="add-schedule-form-overlay">
          <div className="add-schedule-form">
            <h2>Thêm Lịch</h2>
            
            <div className="form-group">
              <label>Ngày</label>
              <input 
                type="date" 
                value={selectedDate ? selectedDate.toISOString().split('T')[0] : newSchedule.date}
                onChange={(e) => setNewSchedule({...newSchedule, date: e.target.value})}
                readOnly={selectedDate !== null}
              />
            </div>
            
            <div className="form-group">
              <label>Ca làm việc</label>
              <select 
                name="shift"
                value={newSchedule.shift}
                onChange={handleInputChange}
              >
                <option value="Ca sáng">Ca sáng</option>
                <option value="Ca chiều">Ca chiều</option>
                <option value="Ca tối">Ca tối</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Phòng</label>
              <select 
                name="room"
                value={newSchedule.room}
                onChange={handleInputChange}
              >
                <option value="001">001</option>
                <option value="002">002</option>
                <option value="003">003</option>
              </select>
            </div>
            
            <div className="form-group time-group">
              <div>
                <label>Giờ bắt đầu</label>
                <input 
                  type="time" 
                  name="startTime"
                  value={newSchedule.startTime}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <label>Giờ kết thúc</label>
                <input 
                  type="time" 
                  name="endTime"
                  value={newSchedule.endTime}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="form-buttons">
              <button className="cancel-btn" onClick={handleCancelAddSchedule}>Hủy</button>
              <button className="save-btn" onClick={handleSaveSchedule}>Lưu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DoctorSchedule;
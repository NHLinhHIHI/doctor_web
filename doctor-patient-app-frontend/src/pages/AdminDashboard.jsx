import React, { useState } from "react";
import "./admin.css";
import AddDoctorForm from "./AddDoctorForm";
import NotificationCardList from "./NotificationCardList";
import AdminSchedule from "./AdminSchedule";
import MedicineList from "./MedicineList";
function AdminDashboard() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [activeView, setActiveView] = useState("dashboard");

  if (!user || user.role !== "admin") {
    return <h2>Access denied. Admin only!</h2>;
  }

  const renderContent = () => {
    switch (activeView) {
      case "add-doctor":
        return <AddDoctorForm />;
        case "notifications":
      return <NotificationCardList />;
      case "schedule":
      return <AdminSchedule />;
      case "Medicine":
      return <MedicineList />;
      default:
          return <h2>Hello Admin</h2>;
    }
  };

  return (
    <div className="admin-dashboard">
      <header className="topbar">
        <span>📧 LINH.NH18886@sinhvien.hoasen.edu.vn</span>
        <span>📞 0787477687</span>
      </header>

      <nav className="navbar">
        <img src="/images/logo.png" alt="Logo" className="logo" />
        <ul>
          <li>HOME</li>
          <li>ABOUT</li>
          <li>SERVICES</li>
          <li>CONTACT</li>
        </ul>
      </nav>

      <div className="main">
        <aside className="sidebar">
  <h3>Navigation</h3>
  <ul>
    <li
      className={activeView === "dashboard" ? "active" : ""}
      onClick={() => setActiveView("dashboard")}
    >
      Manager
    </li>
    <li
      className={activeView === "add-doctor" ? "active" : ""}
      onClick={() => setActiveView("add-doctor")}
    >
      Add Doctor
    </li>
    <li
      className={activeView === "schedule" ? "active" : ""}
      onClick={() => setActiveView("schedule")}
    >
      Schedule
    </li>
    <li
      className={activeView === "Medicine" ? "active" : ""}
      onClick={() => setActiveView("Medicine")}
    >
      Medicine Manager
    </li>
  </ul>
</aside>


        <section className="content">{renderContent()}</section>
      </div>
    </div>
  );
}

export default AdminDashboard;

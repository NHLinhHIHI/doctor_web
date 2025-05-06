import React, { useState } from "react";
import "./admin.css";
import AddDoctorForm from "./AddDoctorForm";
import NotificationCardList from "./NotificationCardList";
import AdminSchedule from "./AdminSchedule";
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
      default:
        return (
          <>
            <h1>Dashboard</h1>
            <p>Hospital Human Resources</p>

            <div className="cards">
              {[
                { title: "Payments", count: 2, color: "blue" },
                { title: "Doctors", count: 5, color: "cyan", view: "add-doctor" },
                { title: "Patients", count: 20, color: "orange" },
                { title: "Notifications", count: 1, color: "navy", view: "notifications" },
                { title: "Schedule ", count: 4, color: "green" ,view: "schedule"},
                { title: "Laboratories", count: 3, color: "red" },
                { title: "Receptionists", count: 8, color: "gold" },
              ].map((item, idx) => (
                <div
                  className={`card ${item.color}`}
                  key={idx}
                  onClick={() => item.view && setActiveView(item.view)}
                  style={{ cursor: item.view ? "pointer" : "default" }}
                >
                  <h3>{item.title}</h3>
                  <p>{item.count}</p>
                  <span>More</span>
                </div>
              ))}
            </div>
          </>
        );
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
              Dashboard
            </li>
          </ul>
        </aside>

        <section className="content">{renderContent()}</section>
      </div>
    </div>
  );
}

export default AdminDashboard;

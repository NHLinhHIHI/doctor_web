import React, { useState } from "react";
import Login from "./pages/login";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminDashboard from "./pages/AdminDashboard";
import DoctorHome from "./pages/DoctorHome";
import PatientDetail from "./pages/PatientDetail";
import PatientDetail2 from "./pages/PatientDetail2";



function App() {
  const [currentView, setCurrentView] = useState("list");
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  const handleViewPatientDetail = (patientID) => {
    setSelectedPatientId(patientID);
    setCurrentView("detail");
  };
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/doctor" element={<DoctorHome />} />
        <Route path="/patient/:patientId" element={<PatientDetail />} />
        <Route path="/patient2/:patientId" element={<PatientDetail2 />} />
      </Routes>
    </Router>
  );
}

export default App;

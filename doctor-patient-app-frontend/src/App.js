import React from "react";
import Login from "./pages/login";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminDashboard from "./pages/AdminDashboard";
import DoctorHome from "./pages/DoctorHome";
import PatientDetail from "./pages/PatientDetail";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/doctor" element={<DoctorHome />} />
        <Route path="/patient/:patientId" element={<PatientDetail />} />
      </Routes>
    </Router>
  );
}

export default App;

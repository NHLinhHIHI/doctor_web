import React from "react";
import Login from "./pages/login";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminDashboard from "./pages/AdminDashboard";
import DoctorHome from "./pages/DoctorHome";
import PatientDetail from "./pages/PatientDetail";
import MedicalExam from "./pages/MedicalExam";
import PatientExaminationHistory from "./pages/PatientExaminationHistory";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/doctor" element={<DoctorHome />} />
        <Route path="/patient/:patientId" element={<PatientDetail />} />
        <Route path="/medical-exam/:appointmentId" element={<MedicalExam />} />
        <Route path="/examination-history/:patientId" element={<PatientExaminationHistory />} />
        {/* Add more routes as needed */}
      </Routes>
    </Router>
    
  );
}

export default App;

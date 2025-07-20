import React, { useState } from "react";
import Login from "./pages/login";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminDashboard from "./pages/AdminDashboard";
import DoctorHome from "./pages/DoctorHome";
import PatientDetail from "./pages/PatientDetail";
import MedicalExam from "./pages/MedicalExam";
import PatientExaminationHistory from "./pages/PatientExaminationHistory";
import PatientDetail2 from "./pages/PatientDetail2";
import ChatApp from "./pages/ChatApp";
import { useParams, useLocation } from "react-router-dom";
import ChatList from "./pages/ChatList";
import ChatBox from   "./pages/ChatBox";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import HomePage from "./pages/HomePage";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Services from "./pages/Services";

function App() {
  const [currentView, setCurrentView] = useState("list");
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  
  const ChatPage = () => {
    const { chatID } = useParams();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const otherUserID = queryParams.get("other"); // lấy từ ?other=abc
    return <ChatBox chatID={chatID} otherUserID={otherUserID} />;
  };

  const handleViewPatientDetail = (patientID) => {
    setSelectedPatientId(patientID);
    setCurrentView("detail");
  };
  
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
         
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/doctor" element={<DoctorHome />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/patient/:patientId" element={<PatientDetail />} />
        <Route path="/medical-exam/:appointmentId" element={<MedicalExam />} />
        <Route path="/examination-history/:patientId" element={<PatientExaminationHistory />} />
        <Route path="/patient2/:patientId" element={<PatientDetail2 />} />
        <Route path="/chat" element={<ChatApp />} />
        <Route path="/chat/:chatID" element={<ChatPage />} />
      </Routes>
    </Router>
    
  );
}

export default App;

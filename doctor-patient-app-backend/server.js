const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;
app.use(bodyParser.urlencoded({ extended: false }));

// Cấu hình CORS cho phép truy cập từ tất cả các nguồn (frontend)
app.use(cors({
  origin: '*', // Cho phép tất cả các nguồn truy cập API
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Import các routes
const doctorRoutes = require("./routes/doctor");
const scheduleRoutes = require("./routes/schedule");
const scheduleRoutes2 = require("./routes/schedule2");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const notificationRoutes = require("./routes/notifications");
const medicalExamRoutes = require("./routes/medicalExam");
const patientRoutes = require("./routes/patient");
const patientProfileRoutes = require("./routes/patientProfile");
const diagnosticRoutes = require("./routes/diagnostic");
// Đăng ký các routes
const medicineRoutes = require("./routes/medicine");
const manager = require("./routes/manager");
const chat = require("./routes/chat");
//Tạm thời comment route auth để tắt xác thực
app.use("/auth", authRoutes);
app.use("/manager", manager);
app.use("/medicine", medicineRoutes);
app.use("/user", userRoutes);
app.use("/doctor", doctorRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api", notificationRoutes);
app.use("/schedule", scheduleRoutes);
app.use("/api/medicalExam", medicalExamRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api", patientProfileRoutes); // Lưu ý: Route này xử lý /api/patient-profile/:patientId
app.use("/api/diagnostic", diagnosticRoutes); // Route chẩn đoán để debug vấn đề kết nối
app.use('/api', require('./routes/user'));
app.use(cors());
// Route mặc định
app.use("/notifications", notificationRoutes); 
//app.use("/api", notificationRoutes);
app.use("/schedule", scheduleRoutes);
app.use("/chat", chat);
app.use("/schedule2", scheduleRoutes2);
app.get("/", (req, res) => {
  res.send("Doctor-Patient API is running...");
});

// Route kiểm tra kết nối API
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "API is working correctly",
    timestamp: new Date().toISOString()
  });
});

// Khởi động server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`API URL: http://localhost:${port}`);
});

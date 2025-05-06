const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(express.json());
const doctorRoutes = require("./routes/doctor"); // thêm dòng này
const scheduleRoutes = require("./routes/schedule");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const notificationRoutes = require("./routes/notifications");

//Tạm thời comment route auth để tắt xác thực
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/doctor", doctorRoutes); // thêm dòng này
app.use("/api/doctor", doctorRoutes);
app.use("/api/notifications", notificationRoutes); // ✅ thêm dòng này
app.use("/api", notificationRoutes);
app.use("/schedule", scheduleRoutes);
app.get("/", (req, res) => {
  res.send("Doctor-Patient API is running...");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

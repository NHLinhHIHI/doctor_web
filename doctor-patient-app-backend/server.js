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

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");

// Tạm thời comment route auth để tắt xác thực
// app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/doctor", doctorRoutes); // thêm dòng này

app.get("/", (req, res) => {
  res.send("Doctor-Patient API is running...");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

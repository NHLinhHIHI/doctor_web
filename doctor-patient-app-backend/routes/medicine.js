const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");

const { db } = require("../firebase");

// 📌 Thêm thuốc
router.post("/", async (req, res) => {
  try {
    const data = req.body;
    const docRef = await db.collection("Medicine").add(data);
    res.status(200).json({ id: docRef.id, message: "Thêm thuốc thành công" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 Lấy tất cả thuốc
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("Medicine").get();
    const medicines = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    res.status(200).json(medicines);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 Sửa thuốc
router.put("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    console.log("Updating medicine:", id, data);
     await db.collection("Medicine").doc(id).update(data);
    res.status(200).json({ message: "Cập nhật thuốc thành công" });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ error: error.message });
  }
});


// 📌 Xóa thuốc
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    await db.collection('Medicine').doc(id).delete();
    res.status(200).json({ message: "Xóa thuốc thành công" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// 📌 Lấy tất cả thuốc hoặc tìm kiếm theo từ khóa
//http://localhost:5000/medicine/name-medicine
router.get("/name-medicine", async (req, res) => {
   try {
    const keyword = (req.query.q || "").toLowerCase().trim();
    const snapshot = await db.collection("Medicine").get();

    const medicines = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    let result = medicines;

    if (keyword) {
      result = medicines.filter(med => {
        const name = (med.name || "").toLowerCase();
        const medicine = (med.medicine || "").toLowerCase();
        return name.includes(keyword) || medicine.includes(keyword);
      });
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
module.exports = router;

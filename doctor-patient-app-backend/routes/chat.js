// backend/chat.js
const express = require('express');

const router = express.Router();

// const { db } = require("../firebase");
const { admin, db } = require("../firebase");
router.get("/:userID", async (req, res) => {
  const { userID } = req.params;
  try {
    const snapshot = await db.collection("chat")
      .where("participants", "array-contains", userID)
      .get();

    const chats = [];

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const chatID = doc.id;

      const otherID = data.participants.find(id => id !== userID);
      let otherName = "Người dùng";

      // Lấy thông tin user từ Firestore
      if (otherID) {
        const userDoc = await db.collection("users").doc(otherID).get();
        if (userDoc.exists) {
          const profile = userDoc.data().ProfileNormal;
          if (Array.isArray(profile) && profile.length > 1) {
            otherName = profile[0]; // Giả sử: profile[1] = "Tên"
          }
        }
      }

      chats.push({
        id: chatID,
        ...data,
        otherID,
        otherName
      });
    }

    res.json(chats);
  } catch (error) {
    console.error("🔥 Lỗi lấy danh sách chat:", error);
    res.status(500).json({ error: error.message });
  }
});
// Tạo cuộc trò chuyện giữa 2 người (nếu chưa có)
router.post("/start", async (req, res) => {
  const { participants } = req.body;

  if (!Array.isArray(participants) || participants.length !== 2) {
    return res.status(400).json({ error: "participants must be an array of 2 user IDs" });
  }

  try {
    const snapshot = await db.collection("chat")
      .where("participants", "in", [
        participants,
        [participants[1], participants[0]]
      ])
      .limit(1)
      .get();

    if (!snapshot.empty) {
      const existingChat = snapshot.docs[0];
      return res.json({ chatID: existingChat.id, exists: true });
    }

    const newChatRef = await db.collection("chat").add({
      participants,
      createdAt: new Date(),
      lastMessage: "",
      lastTimestamp: null,
    });

    return res.json({ chatID: newChatRef.id, created: true });
  } catch (error) {
    console.error("Error creating chat:", error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;

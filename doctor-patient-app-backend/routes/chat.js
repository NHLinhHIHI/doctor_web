// backend/chat.js
const express = require('express');

const router = express.Router();

const { db } = require("../firebase");
const admin = require('firebase-admin');

router.get('/:userId', async (req, res) => {
  const currentUserId = req.params.userId;
  console.log(`Received request GET /chat/${req.params.userId} at ${new Date().toISOString()}`);

  try {
    // Truy vấn tất cả các cuộc trò chuyện mà currentUserId tham gia
    const chatRef = db.collection('chat');
    const snapshot = await chatRef.where('participants', 'array-contains', currentUserId).get();

    if (snapshot.empty) {
      return res.json([]);
    }

    const conversations = await Promise.all(
      snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();
        const chatId = docSnap.id;

        const otherUserId = data.participants.find((id) => id !== currentUserId);

        // Lấy thông tin người dùng khác
        const userDoc = await db.collection('users').doc(otherUserId).get();
        const otherUser = userDoc.exists ? userDoc.data() : { displayName: 'Người dùng ẩn' };

        return {
          chatId,
          otherUserId,
          otherUser,
          lastMessage: data.lastmessage || '',
          lastSender: data.lastsender || '',
          lastTimestamp: data.lastTimestamp ? data.lastTimestamp.toDate() : null,
        };
      })
    );

    res.json(conversations);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách chat:', error);
    res.status(500).json({ error: 'Lỗi máy chủ khi lấy dữ liệu chat' });
  }
});

module.exports = router;

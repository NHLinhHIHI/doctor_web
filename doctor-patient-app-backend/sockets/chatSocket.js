const { db } = require("../firebase");
const admin = require("firebase-admin");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("🟢 Socket connected:", socket.id);

    // socket.on("join_chat", (chatID) => {
    //   socket.join(chatID);
    //   console.log(`${socket.id} joined chat room: ${chatID}`);
    // });

    socket.on("send_message", async (data) => {
      const { chatID, senderID, content, type = "text" } = data;
      const message = {
        sender: senderID,
        content,
        timestamp: admin.firestore.Timestamp.now(),
        seenBy: [senderID],
        type,
        status: "sent",
      };

      // Lưu vào Firestore
      await db.collection("chat").doc(chatID).collection("messages").add(message);

      await db.collection("chat").doc(chatID).set({
        lastMessage: content,
        lastTimestamp: admin.firestore.Timestamp.now(),
         lastSender: senderID,
        seenBy: [senderID],
        updatedAt: admin.firestore.Timestamp.now(),
      }, { merge: true });

      io.to(chatID).emit("receive_message", { ...message, chatID });
    });

    socket.on("message_seen", async ({ chatID, userID }) => {
      const chatRef = db.collection("chat").doc(chatID);
      await chatRef.update({
        seenBy: admin.firestore.FieldValue.arrayUnion(userID)
      });
    });
socket.on("receive_message", (message) => {
  console.log("Message received:", message); // kiểm tra message có timestamp không
  if (message.chatID === chatID) {
    setMessages(prev => [...prev, message]);
  }
});

    socket.on("typing", ({ chatID, userID }) => {
      socket.to(chatID).emit("typing", { userID });
    });

    socket.on("stop_typing", ({ chatID, userID }) => {
      socket.to(chatID).emit("stop_typing", { userID });
    });

    socket.on("disconnect", () => {
      console.log("🔴 Socket disconnected:", socket.id);
    });

    socket.on("join_chat", async (chatID) => {
  socket.join(chatID);
  console.log(`${socket.id} joined chat room: ${chatID}`);

  try {
    const messagesSnap = await db
      .collection("chat")
      .doc(chatID)
      .collection("messages")
      .orderBy("timestamp", "asc")
      .get();

    const messages = messagesSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log("📜 Chat history fetched:", messages);
    socket.emit("chat_history", { chatID, messages });
  } catch (error) {
    console.error("❌ Error fetching chat history:", error);
  }
});

  });
};

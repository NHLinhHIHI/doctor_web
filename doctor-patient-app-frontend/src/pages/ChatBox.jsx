import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

const socket = io("http://localhost:5000"); // backend URL

const ChatBox = ({ chatID, otherUserID }) => {
  
  const user = JSON.parse(localStorage.getItem("user"));
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");

  useEffect(() => {
  socket.emit("join_chat", chatID);

  socket.on("chat_history", ({ chatID: id, messages }) => {
    if (id === chatID) setMessages(messages);
  });

  socket.on("receive_message", (message) => {
    if (message.chatID === chatID) {
      setMessages(prev => [...prev, message]);
    }
  });

  return () => {
    socket.off("chat_history");
    socket.off("receive_message");
  };
}, [chatID]);


  const handleSend = () => {
    if (!newMsg.trim()) return;
    socket.emit("send_message", {
      chatID,
      senderID: user.id,
      content: newMsg,
    });
    setNewMsg("");
  };

  return (
    <div className="chat-box">
      <div className="chat-header">
        {/* <strong>🧑‍⚕️ Trò chuyện với {otherUserID}</strong> */}
      </div>

      <div className="messages">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`message ${msg.sender === user.id ? "sent" : "received"}`}
          >
            <div className="bubble">{msg.content}</div>
         <small>
  {msg.timestamp?._seconds &&
    new Date(msg.timestamp._seconds * 1000).toLocaleTimeString()}
</small>
          </div>
        ))}
      </div>

     <div className="flex items-center">
  <input
    type="text"
    value={newMsg}
    onChange={(e) => setNewMsg(e.target.value)}
    placeholder="Nhập tin nhắn..."
    onKeyDown={(e) => e.key === "Enter" && handleSend()}
    className="flex-1 px-3 py-2 text-base border border-gray-300 rounded-l-md outline-none"
  />
  <button
    onClick={handleSend}
    className="px-5 py-2 h-full bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
  >
    Gửi
  </button>
</div>

    </div>
  );
};

export default ChatBox;

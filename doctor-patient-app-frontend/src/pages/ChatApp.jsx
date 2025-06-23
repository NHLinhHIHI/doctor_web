import React, { useState } from "react";
import ChatList from "./ChatList";
import ChatBox from "./ChatBox";
import "./chat.css"; // tuỳ bạn style

const ChatApp = ({ initialChatID = null, initialOtherID = null }) => {
  const [selectedChatID, setSelectedChatID] = useState(initialChatID);
  const [otherUserID, setOtherUserID] = useState(initialOtherID);

  const handleSelectChat = (chatID, otherID) => {
    setSelectedChatID(chatID);
    setOtherUserID(otherID);
  };
   const handleStartChat = async (otherID) => {
    const user = JSON.parse(localStorage.getItem("user"));
    try {
      const res = await fetch("http://localhost:5000/chat/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participants: [user.id, otherID] }),
      });
      const data = await res.json();
      if (data.chatID) {
        setSelectedChatID(data.chatID);
        setOtherUserID(otherID);
      }
    } catch (error) {
      console.error("Lỗi khi tạo hoặc vào cuộc trò chuyện:", error);
    }
  };

 return (
    <div className="chat-app">
      <ChatList onSelectChat={handleSelectChat} />
      
      {selectedChatID ? (
        <ChatBox chatID={selectedChatID} otherUserID={otherUserID} />
      ) : (
        <div className="chat-placeholder">Chọn một cuộc trò chuyện hoặc bắt đầu trò chuyện</div>
      )}

      {/* 👇 Cho phép truyền hàm xuống để bắt đầu chat từ ngoài */}
      <input type="hidden" id="chat-app-api" data-handle-start-chat={handleStartChat} />
    </div>
  );
};

export default ChatApp;

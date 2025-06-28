import React, { useEffect, useState } from "react";
import axios from "axios";

const ChatList = ({ onSelectChat }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [chats, setChats] = useState([]);

  useEffect(() => {
    if (!user) return;

    axios.get(`http://localhost:5000/chat/${user.id}`)
      .then((res) => {
        const sortedChats = res.data
  .filter(chat => chat.lastTimestamp?._seconds) // bỏ mấy thằng null
  .sort((a, b) => b.lastTimestamp._seconds - a.lastTimestamp._seconds);

        setChats(sortedChats);
      })
      .catch(err => console.error("Failed to load chats", err));
  }, [user]);

  return (
    <div className="chat-list">
      <h3>💬 Cuộc trò chuyện</h3>
      {chats.map(chat => {
        const otherID = chat.participants.find(id => id !== user.id);
        return (
          <div key={chat.id} className="chat-item" onClick={() => onSelectChat(chat.id, otherID)}>
          <strong>{chat.otherName || otherID}</strong>

           <p>
  {chat.lastSender === user.id
    ? "Bạn: "
    : `${chat.otherName || ""}: `}
  {chat.lastMessage}
</p>


            <small>
  {chat.lastTimestamp?._seconds &&
    new Date(chat.lastTimestamp._seconds * 1000).toLocaleString()}
</small>
   </div>
        );
      })}
    </div>
  );
};

export default ChatList;

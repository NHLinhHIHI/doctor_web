import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Chat = () => {
    const [conversations, setConversations] = useState([]);
    const navigate = useNavigate();

    // Lấy currentUserId từ localStorage
    const storedUser = localStorage.getItem('user');
    let currentUserId = null;

    try {
        const parsedUser = JSON.parse(storedUser);
        currentUserId = parsedUser.id; // chỉ lấy ID
    } catch (error) {
        console.error('Lỗi khi parse user từ localStorage:', error);
    }


    useEffect(() => {

        const fetchConversations = async () => {
            try {
                const res = await fetch(`http://localhost:5000/chat/${currentUserId}`);
                const data = await res.json();
                setConversations(data);
            } catch (error) {
                console.error('Lỗi khi lấy danh sách cuộc trò chuyện:', error);
            }
        };

        fetchConversations();
    }, [currentUserId]);

    const handleSelectChat = (chatId) => {
        navigate(`/chat/${chatId}`);
    };

    return (
        <div style={{ padding: 20 }}>
            <h2>Chọn người để trò chuyện</h2>
            {conversations.length === 0 ? (
                <p>Không có cuộc trò chuyện nào</p>
            ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {conversations.map((chat) => (
                        <li
                            key={chat.chatId}
                            onClick={() => handleSelectChat(chat.chatId)}
                            style={{
                                padding: 10,
                                marginBottom: 10,
                                border: '1px solid #ccc',
                                borderRadius: 8,
                                cursor: 'pointer',
                            }}
                        >
                            <strong>{chat.otherUser.displayName}</strong>
                            <p style={{ margin: '5px 0' }}>{chat.lastMessage}</p>
                            <p>Người gửi: {chat.lastSender}</p>
                            {chat.lastTimestamp && (
                                <small>
                                    Gửi lúc: {new Date(chat.lastTimestamp).toLocaleString()}
                                </small>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Chat;

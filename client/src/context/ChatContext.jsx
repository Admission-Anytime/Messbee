import React, { createContext, useState, useEffect, useRef, useContext } from 'react';
import io from 'socket.io-client';
import chatService from '../services/chatService';
import { userContext } from './Context';

export const ChatContext = createContext();

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.VITE_API_URL
    ? String(import.meta.env.VITE_API_URL).replace(/\/api\/?$/, '')
    : '');

export const ChatProvider = ({ children }) => {
  const { isLoggedIn } = useContext(userContext);
  const [unreadCount, setUnreadCount] = useState(0);
  const [chats, setChats] = useState([]);
  const socketRef = useRef(null);

  const fetchChats = async () => {
    if (!isLoggedIn) return;
    try {
      const result = await chatService.getChats();
      if (result.success) {
        setChats(result.data);
        const totalUnread = result.data.reduce((sum, chat) => sum + (chat.unread || 0), 0);
        setUnreadCount(totalUnread);
      }
    } catch (err) {
      console.error('Error fetching chats for unread count:', err);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchChats();

      socketRef.current = io(SOCKET_URL, { withCredentials: true });

      socketRef.current.on('receive_message', (data) => {
        // We only care about unread count here
        // If we want to be precise, we'd need to know if the user is currently viewing this chat
        // But for the global badge, we can just fetch chats again or update optimistically
        fetchChats();
      });

      socketRef.current.on('chat_updated', () => fetchChats());
      socketRef.current.on('chat_created', () => fetchChats());

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    } else {
      setUnreadCount(0);
      setChats([]);
    }
  }, [isLoggedIn]);

  return (
    <ChatContext.Provider value={{ unreadCount, fetchChats, chats }}>
      {children}
    </ChatContext.Provider>
  );
};

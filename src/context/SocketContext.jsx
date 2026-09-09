import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    // Only connect if user is logged in
    if (userInfo && userInfo._id) {
      // Assuming backend is on the same host or proxy is set up
      // Or provide the absolute URL here (e.g. process.env.REACT_APP_API_URL or 'http://localhost:5000')
      const newSocket = io('https://crm-backend-vi2w.onrender.com'); 

      newSocket.on('connect', () => {
        console.log('Connected to socket server');
        newSocket.emit('register', userInfo._id);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [userInfo]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

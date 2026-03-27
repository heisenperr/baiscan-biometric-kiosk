"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '@/lib/api';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!socketRef.current) {
      console.log('[SocketProvider] Initializing global socket connection...');
      const socket = io(SOCKET_URL, {
        transports: ["websocket", "polling"],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        autoConnect: true,
      });

      socket.on('connect', () => {
        console.log('[SocketProvider] Connected to WebSocket server');
        setIsConnected(true);
      });

      socket.on('disconnect', () => {
        console.log('[SocketProvider] Disconnected from WebSocket server');
        setIsConnected(false);
      });

      socket.on('connect_error', (error) => {
        console.error('[SocketProvider] Connection error:', error);
        setIsConnected(false);
      });

      socketRef.current = socket;
    }

    return () => {
      if (socketRef.current) {
        console.log('[SocketProvider] Disconnecting global socket...');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

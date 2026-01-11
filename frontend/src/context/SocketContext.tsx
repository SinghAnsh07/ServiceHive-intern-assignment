import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppSelector } from '../app/hooks';

interface Notification {
    type: string;
    message: string;
    gigId?: string;
    gigTitle?: string;
    timestamp: Date;
}

interface SocketContextType {
    socket: Socket | null;
    notifications: Notification[];
    clearNotifications: () => void;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    notifications: [],
    clearNotifications: () => { },
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const { user, isAuthenticated } = useAppSelector((state) => state.auth);

    useEffect(() => {
        if (isAuthenticated && user) {
            // Connect to Socket.io server
            const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
                withCredentials: true,
            });

            newSocket.on('connect', () => {
                console.log('Connected to Socket.io server');
                // Join with user ID
                newSocket.emit('join', user._id);
            });

            newSocket.on('notification', (notification: Notification) => {
                console.log('Received notification:', notification);
                setNotifications((prev) => [notification, ...prev]);

                // Show browser notification if permitted
                if (Notification.permission === 'granted') {
                    new Notification('GigFlow', {
                        body: notification.message,
                        icon: '/vite.svg',
                    });
                }
            });

            newSocket.on('disconnect', () => {
                console.log('Disconnected from Socket.io server');
            });

            setSocket(newSocket);

            // Request notification permission
            if (Notification.permission === 'default') {
                Notification.requestPermission();
            }

            return () => {
                newSocket.close();
            };
        } else {
            // Disconnect socket if user logs out
            if (socket) {
                socket.close();
                setSocket(null);
            }
        }
    }, [isAuthenticated, user]);

    const clearNotifications = () => {
        setNotifications([]);
    };

    return (
        <SocketContext.Provider value={{ socket, notifications, clearNotifications }}>
            {children}
        </SocketContext.Provider>
    );
};

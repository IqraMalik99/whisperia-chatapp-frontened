import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const newSocket = io('https://whisperia-backened-production.up.railway.app', {
            withCredentials: true, // Ensures credentials (cookies, headers) are sent
            transports: ['websocket'], // Preferred transport method
            extraHeaders: {
                'Access-Control-Allow-Origin': 'https://whisperia-frontened.vercel.app', // CORS header
            },
        });

        // Store the socket connection in state
        setSocket(newSocket);

        // Cleanup on unmount
        return () => {
            if (newSocket) {
                newSocket.close();
            }
        };
    }, []);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};

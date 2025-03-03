// import { createContext, useContext, useEffect, useState } from 'react';
// import { io } from 'socket.io-client';

// const SocketContext = createContext();

// export const useSocket = () => useContext(SocketContext);

// export const SocketProvider = ({ children }) => {
//     const [socket, setSocket] = useState(null);

//     useEffect(() => {
//         const newSocket = io('http://localhost:3000', {
//             withCredentials: true, // Ensures credentials (cookies, headers) are sent
//             transports: ['websocket'], // Preferred transport method
//             extraHeaders: {
//                 'Access-Control-Allow-Origin': 'http://localhost:5173', // CORS header
//             },
//         });

//         // Store the socket connection in state
//         setSocket(newSocket);

//         // Cleanup on unmount
//         return () => {
//             if (newSocket) {
//                 newSocket.close();
//             }
//         };
//     }, []);

//     return (
//         <SocketContext.Provider value={socket}>
//             {children}
//         </SocketContext.Provider>
//     );
// };


import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children, isAuthenticated }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (!isAuthenticated) return; // Wait until user logs in

        // const newSocket = io("http://localhost:3000", {
        //     withCredentials: true,
        //     transports: ["websocket"],
        // });

        const newSocket = io('https://whisperia-backened-production.up.railway.app', {
                        withCredentials: true, // Ensures credentials (cookies, headers) are sent
                        transports: ['websocket'], // Preferred transport method
                        extraHeaders: {
                            'Access-Control-Allow-Origin': 'https://whisperia-frontened.vercel.app', // CORS header
                        }
                    });

        newSocket.on("connect", () => {
            console.log("Connected to WebSocket:", newSocket.id);
        });

        newSocket.on("disconnect", () => {
            console.log("WebSocket disconnected");
        });

        newSocket.on("connect_error", (err) => {
            console.error("WebSocket Connection Error:", err);
        });

        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, [isAuthenticated]); // Reconnect socket when authentication status changes

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};

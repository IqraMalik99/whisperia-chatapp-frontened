
import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext();
const apiUrl = import.meta.env.VITE_API_URL;
export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children, isAuthenticated }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (!isAuthenticated) return; // Wait until user logs in

        const newSocket = io(`http://localhost:3000`, {
            withCredentials: true,
            transports: ["websocket"],
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

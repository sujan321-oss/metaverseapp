import { useEffect, useState } from "react";


export function useWebsocket(): WebSocket | null {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    console.log("socket function is called")
    
    useEffect(() => {

        try {
             if (!socket){
                console.log("makeing a socket connection")
                // const websocket_url =  "ws://localhost:8001" 
                const connection = new WebSocket("ws://localhost:8001");
                connection.onopen = () => {
                    console.log("WebSocket is connected");
                    setSocket(connection); // Set the socket once when connection is established
                };
    
                connection.onclose = () => {
                    console.log("WebSocket is closed");
                    setSocket(null);
                };
                return () => {
                    if (connection.readyState === WebSocket.OPEN) {
                        connection.close();
                    }

             }
           
            };
        } catch (err) {
            console.error("Failed to connect WebSocket", err);
            setSocket(null);
        }
    }, []); // Empty dependency array ensures this only runs once on mount

    return socket;
}

import { useEffect, useRef, useState } from 'react';
import { WS_URL } from '../lib/api';

export const useWebSocket = (onMessage?: (event: string, data: any) => void) => {
    const ws = useRef<WebSocket | null>(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        const socket = new WebSocket(WS_URL);

        socket.onopen = () => {
            console.log('WS Connected');
            setConnected(true);
        };

        socket.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                if (onMessage) {
                    onMessage(message.event, message.data);
                }
            } catch (e) {
                console.error('WS Parse Error', e);
            }
        };

        socket.onclose = () => {
            console.log('WS Disconnected');
            setConnected(false);
            // Reconnect logic could go here
        };

        ws.current = socket;

        return () => {
            socket.close();
        };
    }, []);

    return { connected };
};

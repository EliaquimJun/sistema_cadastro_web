import React, { createContext, useContext, useState,useEffect, useCallback } from 'react';

const WebSocketMessageHandlerContext = createContext(null);

export const useWebSocketMessageHandler = () => {
    const context = useContext(WebSocketMessageHandlerContext);
    if (!context) {
        throw new Error('useWebSocketMessageHandler must be used within a WebSocketMessageHandlerProvider');
    }
    return context;
};
export const WebSocketMessageHandlerProvider = ({ children, socket }) => {
    const [messageHandlers, setMessageHandlers] = useState({});

    const handleMessage = (event) => {
        const message = JSON.parse(event.data);

        // Verificar se targetComponent é um array e iterar sobre ele
        if (Array.isArray(message.targetComponent)) {
            message.targetComponent.forEach(target => {
                const handler = messageHandlers[target];
                if (handler) {
                    handler(message);
                }
            });
        } else {
            const handler = messageHandlers[message.targetComponent];
            if (handler) {
                handler(message);
            }
        }
    };



    useEffect(() => {
        if (socket) {
            socket.onmessage = handleMessage;
        }

        return () => {
            if (socket) {
                socket.onmessage = null;
            }
        };
    }, [socket, messageHandlers]);

    const registerMessageHandler = useCallback((key, handler) => {
        setMessageHandlers(prev => ({ ...prev, [key]: handler }));
    }, []);

    const unregisterMessageHandler = useCallback((key) => {
        setMessageHandlers(prev => {
            const newHandlers = { ...prev };
            delete newHandlers[key];
            return newHandlers;
        });
    }, []);

    const value = {
        registerMessageHandler,
        unregisterMessageHandler
    };

    return (
        <WebSocketMessageHandlerContext.Provider value={value}>
            {children}
        </WebSocketMessageHandlerContext.Provider>
    );
};


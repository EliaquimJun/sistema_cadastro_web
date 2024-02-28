import React, { createContext, useContext, useRef, useState, useEffect, useCallback } from 'react';

const WebSocketContext = createContext({});

export const useWebSocket = () => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocket must be used within a WebSocketProvider');
    }
    return context;
};


export const WebSocketProvider = ({ children}) => {
    const socketRefWithId = useRef(null);
    const socketRefWithoutId = useRef(null);
    
    const [reconnectAttempt, setReconnectAttempt] = useState(0);


    const initializeWebSocket = useCallback((withId) => {
        const wsURL = withId 
            ? `ws://192.168.254.6:8000/ws/manage_cadastro/`
            : `ws://192.168.254.6:8000/ws/manage_cadastro/`;

        const socketRef = withId ? socketRefWithId : socketRefWithoutId;
        if (!socketRef.current || socketRef.current.readyState === WebSocket.CLOSED) {
            socketRef.current = new WebSocket(wsURL);

            // ... (resto do código)
        }

        socketRef.current.onopen = () => {
            console.log(`Conexão WebSocket ${withId ? 'ja em uso' : 'nova'} aberta!`);
            setReconnectAttempt(0);
        };

        socketRef.current.onclose = (event) => {
            console.log(`Conexão WebSocket ${withId ? 'ja em uso' : 'nova'} fechada!`, event);
            if (reconnectAttempt < 5) {
                setTimeout(() => {
                    console.log(`Tentando reconectar WebSocket ${withId ? 'ja em uso' : 'nova'}. Tentativa ${reconnectAttempt + 1}...`);
                    setReconnectAttempt(prev => prev + 1);
                    initializeWebSocket(withId); // Tentar reconectar
                }, 3000 * (reconnectAttempt + 1));
            } else {
                console.log("Máximo de tentativas de reconexão alcançado.");
            }
        };
    }, [reconnectAttempt]); // Inclua as dependências aqui









    useEffect(() => {
        // Função para verificar se a conexão WebSocket está aberta
        const isWebSocketOpen = (ref) => ref.current && ref.current.readyState === WebSocket.OPEN;
    
        // Inicializa o WebSocket apenas se ainda não estiver aberto
        if (!isWebSocketOpen(socketRefWithId) && !isWebSocketOpen(socketRefWithoutId)) {
  
                initializeWebSocket(false);
           
        }
    
        return () => {
            if (socketRefWithId.readyState === 1) { // <-- This is important
                socketRefWithId.close();
            }

            if (socketRefWithoutId.readyState === 1) { // <-- This is important
                socketRefWithoutId.close();
            }
        }
    }, [ initializeWebSocket]);
    
    
// Atualize a forma como os valores são fornecidos
const value = {
    socketRefWithId,
    socketRefWithoutId,
    initializeWebSocket,


    // ... qualquer outra função ou estado que você queira expor
};
return (
    <WebSocketContext.Provider value={value}>
        {children}
    </WebSocketContext.Provider>
);
};
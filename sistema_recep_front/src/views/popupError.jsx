
import './assets/styles/login.css';
import React, { useState, useEffect } from 'react';

const PopupError = ({ message, onClose }) => {
    const [secondsLeft, setSecondsLeft] = useState(3); // Inicia com 3 segundos

    useEffect(() => {
        // Se os segundos acabarem, fechar o pop-up
        if (secondsLeft <= 0) {
            onClose();
            return;
        }

        // Decrementa o contador a cada segundo
        const timer = setTimeout(() => setSecondsLeft(secondsLeft - 1), 1000);
        return () => clearTimeout(timer); // Limpar o temporizador se o componente for desmontado
    }, [onClose, secondsLeft]);

    return (
        <div className="popup-error-container">
            <div className="timer-content">
                <div className="timer-circle">
                    <span className="timer-text">{secondsLeft}</span>
                </div>
                <p>{message}</p>
            </div>
        </div>
    );
};

export default PopupError;

import React, { Component } from 'react';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            errorMessage: ''
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, errorMessage: error.toString() };
    }

    componentDidCatch(error, info) {
        // Aqui você pode logar o erro para algum serviço de monitoramento, se desejar
        console.error("Erro capturado pelo ErrorBoundary:", error, info);
    }

    render() {
        if (this.state.hasError) {
            // Você pode renderizar qualquer fallback UI aqui
            return (
                <div className="error">
                    <h1>Algo deu errado.</h1>
                    <p>{this.state.errorMessage}</p>
                </div>
            );
        }

        return this.props.children; 
    }
}

export default ErrorBoundary;

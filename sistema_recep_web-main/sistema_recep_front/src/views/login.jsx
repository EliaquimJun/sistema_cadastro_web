import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEye, faEyeSlash, faKey } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import './assets/styles/login.css';
import logoImage from './assets/images/LogoRecep.svg';
import PopupError from './popupError';



const Login = () => {
    const navigate = useNavigate();
    const { handleSubmit, register, setValue, watch } = useForm();
    const [errorText, setErrorText] = useState('');
    const [showError, setShowError] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);

    const watchUsername = watch('username', ''); // Watch the 'username' input field
    const watchPassword = watch('password', ''); // Watch the 'password' input field


    const handleUsernameChange = (e) => {
        setValue('username', e.target.value);
    };

    const handlePasswordChange = (e) => {
        setValue('password', e.target.value);
    };

    const onSubmit = async (data) => {
        try {
            console.log("Dados enviados:", data);
    
            const response = await axios.post('http://192.168.254.6:8000/api/login/', data);
            console.log("Resposta da API:", response);
    
            if (response.data.status === 'success') {
                sessionStorage.setItem('token', response.data.token);
    
                // Armazenando o username no sessionStorage, assumindo que ele está na resposta.
                if (response.data.username) {
                    sessionStorage.setItem('username', response.data.username);
                }
    
                navigate('/home');
            } else {
                setErrorText(response.data.error || 'Erro ao fazer login.');
                setShowError(true);
            }
        } catch (error) {
            setErrorText('Erro ao fazer login.');
            setShowError(true);
        }
    };

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    return (
        <div className="content-login">
            {showError && <PopupError message={errorText} onClose={() => setShowError(false)} />}
            
            <form onSubmit={handleSubmit(onSubmit)} className='login-card'>
                <img src={logoImage} alt="Logo da Câmara Municipal" className="logo-login" />
    
                <hr style={{ width: '20%', backgroundColor: '#F8D442', height: '3px', border: 'none', margin: '30px auto' }} />
    
                <h1 className="login-text">Faça o seu login</h1>
                <p className="login-subtext">Digite as suas credenciais nos campos abaixo</p>
    
                <div className="input-container">
                    <div className="input-icon">
                        <FontAwesomeIcon icon={faUser} />
                    </div>
                    <input
                        type="text"
                        {...register('username')}
                        onChange={handleUsernameChange}
                        className={`input-login ${watchUsername ? 'filled' : ''}`}
                    />
                    <label className={`label-login ${watchUsername ? 'filled' : ''}`} htmlFor="username">
                        Username
                    </label>
                </div>
                <div className="input-container">
                    <div className="input-icon">
                        <FontAwesomeIcon icon={faKey} />
                    </div>
                    <input
                        type={passwordVisible ? 'text' : 'password'}
                        {...register('password')}
                        onChange={handlePasswordChange}
                        className={`input-login ${watchPassword ? 'filled' : ''}`}
                    />
                    <label className={`label-login ${watchPassword ? 'filled' : ''}`} htmlFor="password">
                        Senha
                    </label>
                    <div className='input-icon-right'>
                        <FontAwesomeIcon
                            icon={passwordVisible ? faEye : faEyeSlash}
                            onClick={togglePasswordVisibility}
                        />
                    </div>
                    
                </div>

          
                <button type="submit" className='confirm-login'>Entrar</button>
                    
      
            </form>
        </div>
    );
    
};

export default Login;

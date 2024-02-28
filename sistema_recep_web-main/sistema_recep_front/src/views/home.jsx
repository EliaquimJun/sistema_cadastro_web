import React, { useState, useEffect, useCallback, useRef } from 'react';
import LogoHomeRodape from './assets/images/LogoHomeRodape.svg';

import './assets/styles/home.css'; // Importe o arquivo CSS para aplicar estilos
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faCaretDown, faCogs, faFingerprint, faUserTie, faHeadset, faKey, faSignOutAlt, faCalendarAlt, faMapMarkerAlt, faArrowLeft, faChevronDown, faTrash, faEdit, faCirclePlus, faSearch } from '@fortawesome/free-solid-svg-icons';
import { faCircleCheck, faCircleCheck as farCircleCheck } from '@fortawesome/free-regular-svg-icons';
import { faCircleXmark } from '@fortawesome/free-regular-svg-icons';
import { useWebSocketMessageHandler, WebSocketMessageHandlerProvider } from './contexts/useWebSocketService';
import { useWebSocket, WebSocketProvider } from './contexts/WebSocketContext';



import { faTrashAlt } from '@fortawesome/free-regular-svg-icons';
import moment from 'moment';
import axios from 'axios';  // Não esqueça de importar o axios, pois está usando ele no código.



const Home = ({ setSocketRefCallback }) => {

    const [NomeVisitante, setNomeVisitante] = useState("");
    const [NomeVisitanteEdit, setNomeVisitanteEdit] = useState("");
    const [CPF, setCPF] = useState("");
    const [Telefone, setTelefone] = useState("");
    const [Email, setEmail] = useState("");
    const [DataHoraEntrada, setDataHoraEntrada] = useState("");
    const [Gabinete, setGabinete] = useState("");
    const [IdVisitante, setIdVisitante] = useState("");
    const [IdEntrada, setIdEntrada] = useState("");
    const [visitantes, setVisitantes] = useState([]);
    const [entradas, setEntradas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showSuccessSubmit, setshowSuccessSubmit] = useState(false);
    const [showInvalidCPF, setshowInvalidCPF] = useState(false);
    const [showInvalidPhone, setshowInvalidPhone] = useState(false);
    const [showItemExcluidoSucess, setshowItemExcluidoSucess] = useState(false);
    const [showSuccessNovaEntrada, setshowSuccessNovaEntrada] = useState(false);
    const [showSuccessEdit, setshowSuccessEdit] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedGabinete, setSelectedGabinete] = useState('');
    const [selectedVisitanteId, setSelectedVisitanteId] = useState(null);
    const [entradasDoVisitante, setEntradasDoVisitante] = useState([]);
    const [filtroPesquisa, setFiltroPesquisa] = useState("");
    const { socketRefWithId, socketRefWithoutId, initializeWebSocket, setOnMessageHandler } = useWebSocket();
    const { registerMessageHandler, unregisterMessageHandler } = useWebSocketMessageHandler();
    const socketRef = socketRefWithId.current ? socketRefWithId.current : socketRefWithoutId.current;
    const [assinaturaColetada, setAssinaturaColetada] = useState(false);
    const [filtroData, setFiltroData] = useState('todos');
    const [assinaturaImagem, setAssinaturaImagem] = useState('');
    const [assinaturaImagemEdit, setAssinaturaImagemEdit] = useState('');
    const [mostrarCampoAssinatura, setMostrarCampoAssinatura] = useState(false);
    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    // No início do seu componente, junto com os outros estados
    const [assinaturaPendente, setAssinaturaPendente] = useState(false);

    const visitanteIdRef = useRef(null);
    // Estado para armazenar o ID do visitante para quem a assinatura será coletada
    const [visitanteIdParaAssinatura, setVisitanteIdParaAssinatura] = useState(null);

    const iniciarCapturaAssinatura = () => {
        const message = {
            "metadata": {
                "version": 1.0,
                "command": "SignatureCapture"
            },
            "firstName": "",
            "lastName": "",
            "eMail": "",
            "location": "",
            "imageFormat": 1,
            "imageX": 800,
            "imageY": 100,
            "imageTransparency": false,
            "imageScaling": false,
            "maxUpScalePercent": 0,
            "rawDataFormat": "ENC",
            "minSigPoints": 25,
            "penThickness": "1",
            "penColor": "#000000",
            "encryptionMode": "0",
            "encryptionKey": "EncryptionKey",
            "sigCompressionMode": 1,
            "customWindow": true,
        };

        const messageData = JSON.stringify(message);
        const element = document.createElement("MyExtensionDataElement");
        element.setAttribute("messageAttribute", messageData);
        document.documentElement.appendChild(element);
        const evt = document.createEvent("Events");
        evt.initEvent("SignStartEvent", true, false);
        element.dispatchEvent(evt);

        // Adiciona o ouvinte para o evento de resposta
        window.addEventListener('SignResponse', signResponseHandler, false);
    };
    const signResponseHandler = (event) => {
        const str = event.target.getAttribute("msgAttribute");
        const obj = JSON.parse(str);

        if (obj && obj.imageData) {
            setAssinaturaImagem(obj.imageData);
            setAssinaturaColetada(true); // Atualiza o estado para indicar que a assinatura foi coletada
        }

        window.removeEventListener('SignResponse', signResponseHandler, false);
    };

    const abrirCampoAssinaturaBio = (visitanteId) => {
        console.log("Definindo ID do visitante para:", visitanteId);
        visitanteIdRef.current = visitanteId; // Atualiza a referência com o ID do visitante
        iniciarCapturaAssinaturaBio();
    };

    const iniciarCapturaAssinaturaBio = () => {
        const message = {
            "metadata": {
                "version": 1.0,
                "command": "SignatureCapture"
            },
            "firstName": "",
            "lastName": "",
            "eMail": "",
            "location": "",
            "imageFormat": 1,
            "imageX": 800,
            "imageY": 100,
            "imageTransparency": false,
            "imageScaling": false,
            "maxUpScalePercent": 0,
            "rawDataFormat": "ENC",
            "minSigPoints": 25,
            "penThickness": "1",
            "penColor": "#000000",
            "encryptionMode": "0",
            "encryptionKey": "EncryptionKey",
            "sigCompressionMode": 1,
            "customWindow": true,
        };

        const messageData = JSON.stringify(message);
        const element = document.createElement("MyExtensionDataElement");
        element.setAttribute("messageAttribute", messageData);
        document.documentElement.appendChild(element);
        const evt = document.createEvent("Events");
        evt.initEvent("SignStartEvent", true, false);
        element.dispatchEvent(evt);

        // Adiciona o ouvinte para o evento de resposta
        window.addEventListener('SignResponse', signResponseHandlerBio, false);
    };
    const signResponseHandlerBio = async (event) => {
        const str = event.target.getAttribute("msgAttribute");
        const obj = JSON.parse(str);

        if (obj && obj.imageData) {
            setModalMessage("Deseja adicionar esta assinatura ao usuário?");
            setAssinaturaImagemEdit(obj.imageData); // Certifique-se de que setAssinaturaImagemEdit esteja definido corretamente
            setAssinaturaPendente(true);
            setIsModalOpen(true);
        }
    };


    const handleConfirmModal = async () => {
        if (assinaturaPendente) {
            const assinaturaBlob = base64ToBlob(assinaturaImagemEdit); // Converte a imagem da assinatura de base64 para Blob
            await enviarAssinaturaParaServidor(visitanteIdRef.current, assinaturaBlob); // Envia a assinatura para o servidor
            setAssinaturaPendente(false); // Reseta o estado de pendência da assinatura
            setAssinaturaImagem(null); // Limpa a imagem da assinatura do estado
            setIsModalOpen(false); // Fecha o modal
        }
    };
    const enviarAssinaturaParaServidor = async (id, assinaturaBlob) => {
        console.log("ID do visitante ao enviar para o servidor:", id);
        const url = `http://192.168.254.6:8000/api/manage_visitante/${id}/`;
        const token = sessionStorage.getItem('token');

        const formData = new FormData();
        formData.append('assinatura_digital', assinaturaBlob, 'assinatura.png');

        try {
            const response = await axios.patch(url, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    // Remova a linha abaixo para permitir que o navegador defina o Content-Type automaticamente
                    // 'Content-Type': 'application/json',
                },
            });
            console.log("Resposta do servidor:", response.data);
            console.log("Assinatura atualizada com sucesso:", response.data);
            setNotificationMessage("Assinatura atualizada com sucesso!");
            setShowNotification(true);
            // Opcional: esconder a notificação após X segundos
            setTimeout(() => setShowNotification(false), 3000);
            // Seu código para lidar com a resposta bem-sucedida aqui
        } catch (error) {
            console.error("Erro ao atualizar assinatura:", error);
            setNotificationMessage("Não foi possível atualizar a assinatura!");
            setShowNotification(true);
            setTimeout(() => setShowNotification(false), 3000);
        }
    };
    const ConfirmationModal = ({ isOpen, onClose, onConfirm, message }) => {
        if (!isOpen) return null;

        return (
            <div className="modal-overlay">
                <div className="modal-content">
                    <p>{message}</p>
                    <button onClick={onConfirm}>Confirmar</button>
                    <button onClick={onClose}>Cancelar</button>
                </div>
            </div>
        );
    };
    // Método handleCancelModal para lidar com o cancelamento
    const handleCancelModal = () => {
        // Limpa os estados relevantes
        visitanteIdRef.current = null;// Limpa a referência do ID do visitante
        setAssinaturaImagem(null); // Limpa a imagem da assinatura
        setAssinaturaPendente(false); // Reseta o estado de pendência da assinatura
        setIsModalOpen(false); // Fecha o modal
    };


    useEffect(() => {
        // Atualiza o socketRef no componente pai
        setSocketRefCallback(socketRef);
    }, [socketRef, setSocketRefCallback]);


    function base64ToBlob(base64, tipo = 'image/png') {
        const byteCharacters = atob(base64.split(';base64,').pop());
        const byteArrays = [];

        for (let offset = 0; offset < byteCharacters.length; offset += 512) {
            const slice = byteCharacters.slice(offset, offset + 512);
            const byteNumbers = new Array(slice.length).fill(null).map((_, i) => slice.charCodeAt(i));
            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }

        return new Blob(byteArrays, { type: tipo });
    }

    useEffect(() => {
        // Verifica se o WebSocket já está aberto, caso contrário, inicializa
        if (!socketRefWithId.current || socketRefWithId.current.readyState === WebSocket.CLOSED) {
            socketRefWithId.current = new WebSocket(`ws://192.168.254.6:8000/ws/manage_cadastro/`);
        }

        if (!socketRefWithoutId.current || socketRefWithoutId.current.readyState === WebSocket.CLOSED) {
            socketRefWithoutId.current = new WebSocket(`ws://192.168.254.6:8000/ws/manage_cadastro/`);
        }

    }, [socketRefWithId, socketRefWithoutId, initializeWebSocket]);

    const fetchVisitantes = useCallback(async () => {
        setIsLoading(true);
        // Adiciona o parâmetro de ordenação na URL de entradas
        const urlVisitantes = 'http://192.168.254.6:8000/api/manage_visitante/';
        const urlEntradas = 'http://192.168.254.6:8000/api/manage_entrada/?ordering=-data_hora_entrada';
        const token = sessionStorage.getItem('token');

        try {
            const [resVisitantes, resEntradas] = await Promise.all([
                axios.get(urlVisitantes, {
                    headers: { 'Authorization': 'Bearer ' + token },
                }),
                axios.get(urlEntradas, {
                    headers: { 'Authorization': 'Bearer ' + token },
                }),
            ]);

            setVisitantes(resVisitantes.data);
            // Assume que `resEntradas.data` é um array e já vem ordenado do backend
            setEntradas(resEntradas.data);
        } catch (error) {
            console.error("Erro ao buscar dados", error.response?.data || error.message);
        } finally {
            setIsLoading(false);
        }
    }, []);


    useEffect(() => {
        fetchVisitantes();
    }, []);



    const handleWebSocketMessage = useCallback((event) => {
        console.log("TelaHome", event);
        const message = (event);


        // Aqui você coloca a lógica para lidar com as diferentes mensagens recebidas
        if (message.type === 'insert.update') {
            console.log("Atualizando registros...");

            setshowSuccessSubmit(true)
            setTimeout(() => setshowSuccessSubmit(false), 3000);  // Esconde após 3 segundos


            fetchVisitantes()

        } else if (message.type === 'delete.update') {
            console.log("Atualizando registros...");

            setshowItemExcluidoSucess(true)
            setTimeout(() => setshowItemExcluidoSucess(false), 3000);  // Esconde após 3 segundos

            fetchVisitantes()

        } else if (message.type === 'editar.update') {
            console.log("Atualizando registros...");

            setshowSuccessEdit(true)
            setTimeout(() => setshowSuccessEdit(false), 3000);  // Esconde após 3 segundos

            fetchVisitantes()

        }


    }, [fetchVisitantes]);



    useEffect(() => {

        registerMessageHandler('TelaHome', handleWebSocketMessage);
        console.log('MONTANDO TelaHome')

        return () => {
            unregisterMessageHandler('TelaHome');
            console.log('FECHANDO TelaHome')
        };
    }, [registerMessageHandler, unregisterMessageHandler, handleWebSocketMessage]);


    const limparForm = () => {
        setNomeVisitante("");
        setCPF("");
        setDataHoraEntrada("");
        setEmail("");
        setGabinete("");
        setTelefone("");

    };

    const handleFormSubmit = async (event) => {
        event.preventDefault();

        const formDataVisitante = new FormData();
        formDataVisitante.append('nome', NomeVisitante);
        formDataVisitante.append('cpf', CPF);
        formDataVisitante.append('telefone', Telefone);
        formDataVisitante.append('email', Email);

        if (assinaturaImagem) {
            const base64Data = assinaturaImagem.split(';base64,').pop();
            const byteCharacters = atob(base64Data);
            const byteArrays = [];

            for (let offset = 0; offset < byteCharacters.length; offset += 512) {
                const slice = byteCharacters.slice(offset, offset + 512);
                const byteNumbers = new Array(slice.length);

                for (let i = 0; i < slice.length; i++) {
                    byteNumbers[i] = slice.charCodeAt(i);
                }

                const byteArray = new Uint8Array(byteNumbers);
                byteArrays.push(byteArray);
            }

            const blob = new Blob(byteArrays, { type: 'image/png' });
            formDataVisitante.append('assinatura_digital', blob, 'assinatura.png');
        }

        setAssinaturaColetada(false);
        setAssinaturaImagem(null);



        // Validação do CPF
        if (CPF.length !== 14) {
            setshowInvalidCPF(true)
            setTimeout(() => setshowInvalidCPF(false), 3000);  // Esconde após 3 segundos
            return;
        }

        // Validação do Telefone
        if (Telefone.length !== 15) {
            setshowInvalidPhone(true)
            setTimeout(() => setshowInvalidPhone(false), 3000);  // Esconde após 3 segundos
            return;
        }

        const url_visitante = `http://192.168.254.6:8000/api/manage_visitante/`;

        const token = sessionStorage.getItem('token');

        try {
            // Cadastrando o visitante
            const responseVisitante = await axios.post(url_visitante, formDataVisitante, {
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log("Resposta do servidor (Visitante):", responseVisitante.data);
            const visitanteId = responseVisitante.data.id; // Supondo que o ID esteja diretamente na resposta

            // Preparando para cadastrar a entrada
            const formDataEntrada = new FormData();
            formDataEntrada.append('data_hora_entrada', moment().subtract(3, 'hours').toISOString());
            formDataEntrada.append('gabinete', Gabinete);
            formDataEntrada.append('visitante', visitanteId); // Adicionando o ID do visitante

            const url_entrada = `http://192.168.254.6:8000/api/manage_entrada/`;

            // Cadastrando a entrada
            const responseEntrada = await axios.post(url_entrada, formDataEntrada, {
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log("Resposta do servidor (Entrada):", responseEntrada.data);

            limparForm()


            // Enviar uma mensagem via WebSocket 
            const message = {

                action: 'insert',
                type: 'insert.update',
                targetComponent: 'TelaHome'
            };
            console.log("Essa é a mensagem que estou enviando:", message)


            if (socketRefWithoutId.current && socketRefWithoutId.current.readyState === WebSocket.OPEN) {
                socketRefWithoutId.current.send(JSON.stringify(message));
            } else {
                console.error("WebSocket não está aberto: ", socketRefWithoutId.current ? socketRefWithoutId.current.readyState : 'socket não definido');
            }

            setshowSuccessSubmit(true)
            setTimeout(() => setshowSuccessSubmit(false), 3000);  // Esconde após 3 segundos

            fetchVisitantes()


        } catch (error) {
            console.error("Erro na requisição", error.response?.data || error.message);
        }
    };

    const formatDate = (dateString) => {
        // Cria um objeto moment com a data fornecida e adiciona 3 horas
        let date = moment(dateString).add(3, 'hours');

        // Formata a data e a hora para o formato desejado
        let formattedDate = date.format('DD/MM/YYYY');
        let formattedTime = date.format('HH:mm');

        return `${formattedDate} ${formattedTime}`;
    }

    const formatPhone = (phone) => {
        if (!phone) return '';
        // Mantém os 4 primeiros dígitos e os últimos 2 dígitos visíveis
        return phone.replace(/(\(\d{2}\) \d{3})(\d{2})-(\d{2})(\d{2})/, '$1••-••$4');
    }

    const formatCPF = (cpf) => {
        if (!cpf) return '';
        // Mantém os 3 primeiros dígitos e os 2 últimos dígitos visíveis
        return cpf.replace(/(\d{3})\.(\d{3})\.(\d{3})-(\d{2})/, '$1.•••.•••-$4');
    }

    const formatCPFInput = (value) => {
        return value
            .replace(/\D/g, '') // Remove qualquer coisa que não seja número
            .replace(/(\d{3})(\d)/, '$1.$2') // Coloca ponto após o terceiro dígito
            .replace(/(\d{3})(\d)/, '$1.$2') // Coloca ponto após o sexto dígito
            .replace(/(\d{3})(\d{1,2})/, '$1-$2') // Coloca hífen antes dos últimos dois dígitos
            .replace(/(-\d{2})\d+?$/, '$1'); // Impede que digite mais que 11 dígitos
    };

    const formatPhoneInput = (value) => {
        return value
            .replace(/\D/g, '') // Remove qualquer coisa que não seja número
            .replace(/(\d{2})(\d)/, '($1) $2') // Coloca parênteses em torno dos dois primeiros dígitos
            .replace(/(\d{5})(\d)/, '$1-$2') // Coloca hífen após o quinto dígito
            .replace(/(-\d{4})\d+?$/, '$1'); // Impede que digite mais que 11 dígitos
    };

    const [linhaEmEdicao, setLinhaEmEdicao] = useState(null);

    const iniciarEdicao = (id, nome) => {
        setLinhaEmEdicao(id);
        setNomeVisitanteEdit(nome)
    };


    const salvarEdicao = async (id, novoNome) => {
        const url = `http://192.168.254.6:8000/api/manage_visitante/${id}/`;
        const token = sessionStorage.getItem('token');
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        };

        try {
            const response = await axios.patch(url, { nome: novoNome }, { headers });
            console.log("Resposta do servidor (Edição):", response.data);

            setshowSuccessEdit(true)

            // Enviar uma mensagem via WebSocket 
            const message = {

                action: 'editar',
                type: 'editar.update',
                targetComponent: 'TelaHome'
            };
            console.log("Essa é a mensagem que estou enviando:", message)


            if (socketRefWithoutId.current && socketRefWithoutId.current.readyState === WebSocket.OPEN) {
                socketRefWithoutId.current.send(JSON.stringify(message));
            } else {
                console.error("WebSocket não está aberto: ", socketRefWithoutId.current ? socketRefWithoutId.current.readyState : 'socket não definido');
            }
            setTimeout(() => setshowSuccessEdit(false), 3000);  // Esconde após 3 segundos

            fetchVisitantes(); // Atualiza a lista de visitantes
        } catch (error) {
            console.error("Erro ao salvar edição", error.response?.data || error.message);
            // Aqui você pode adicionar uma lógica de erro, exibindo um popup de falha, por exemplo
        }

        setLinhaEmEdicao(null); // Desseleciona a linha em edição
    };

    const excluirVisitante = async (id) => {
        const url = `http://192.168.254.6:8000/api/manage_visitante/${id}/`;
        const token = sessionStorage.getItem('token');
        const headers = {
            'Authorization': `Bearer ${token}`,
        };

        try {
            await axios.delete(url, { headers });

            // Enviar uma mensagem via WebSocket 
            const message = {

                action: 'delete',
                type: 'delete.update',
                targetComponent: 'TelaHome'
            };
            console.log("Essa é a mensagem que estou enviando:", message)


            if (socketRefWithoutId.current && socketRefWithoutId.current.readyState === WebSocket.OPEN) {
                socketRefWithoutId.current.send(JSON.stringify(message));
            } else {
                console.error("WebSocket não está aberto: ", socketRefWithoutId.current ? socketRefWithoutId.current.readyState : 'socket não definido');
            }

            setshowItemExcluidoSucess(true)
            setTimeout(() => setshowItemExcluidoSucess(false), 3000);  // Esconde após 3 segundos

            fetchVisitantes(); // Atualiza a lista de visitantes após a exclusão
        } catch (error) {
            console.error("Erro ao excluir visitante", error.response?.data || error.message);
            // Aqui você pode adicionar uma lógica de erro, exibindo um popup de falha, por exemplo
        }
    };

    const abrirModalEntrada = async (visitanteId) => {
        setSelectedVisitanteId(visitanteId);
        setIsModalVisible(true);
        // Aqui, você pode chamar a API para buscar as entradas deste visitante
        buscarEntradasDoVisitante(visitanteId);
    };

    const buscarEntradasDoVisitante = async (visitanteId) => {

        const url = `http://192.168.254.6:8000/api/manage_entrada/por_visitante/${visitanteId}`;
        const token = sessionStorage.getItem('token');
        try {
            const response = await axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            setEntradasDoVisitante(response.data);
        } catch (error) {
            console.error("Erro ao buscar entradas do visitante", error.response?.data || error.message);
        }
    };

    const enviarNovaEntrada = async () => {
        const url = `http://192.168.254.6:8000/api/manage_entrada/`;
        const token = sessionStorage.getItem('token');
        const formData = new FormData();
        formData.append('gabinete', selectedGabinete);
        formData.append('visitante', selectedVisitanteId);
        formData.append('data_hora_entrada', moment().subtract(3, 'hours').toISOString());

        try {
            await axios.post(url, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            setshowSuccessNovaEntrada(true)
            setTimeout(() => setshowSuccessNovaEntrada(false), 3000);  // Esconde após 3 segundos

            buscarEntradasDoVisitante(selectedVisitanteId); // Atualiza a lista de entradas
        } catch (error) {
            console.error("Erro ao enviar nova entrada", error.response?.data || error.message);
        }
    };



    const hoje = moment().format('DD/MM/YYYY'); // Formata a data atual para o mesmo formato que sua função formatDate retorna

    const visitantesFiltrados = visitantes.filter((visitante) => {
        const entrada = entradas.find(e => e.visitante === visitante.id);
        const dataEntradaFormatada = formatDate(entrada ? entrada.data_hora_entrada : '');

        // Separa a data da hora, pois estamos interessados apenas na data para a comparação
        const dataEntrada = dataEntradaFormatada.split(' ')[0]; // Pega apenas a parte da data

        const correspondeAoNomeOuData = visitante.nome.toLowerCase().includes(filtroPesquisa.toLowerCase()) ||
            dataEntradaFormatada.includes(filtroPesquisa);

        if (filtroData === 'todos') {
            return correspondeAoNomeOuData;
        } else if (filtroData === 'hoje') {
            // Compara apenas a data, ignorando a hora
            return correspondeAoNomeOuData && dataEntrada === hoje;
        }
        console.log("os visistantes", visitantesFiltrados);
    });



    return (

        <div className="home-container">
            <div className="left-container">
                <div className="left-card">
                    <h2 className='left-home-text'>Cadastro de novo visitante</h2>
                    <p className='left-home-subtext'>Digite as suas credenciais nos campos abaixo</p>
                    <form className="form" style={{ justifyContent: 'space-between' }} onSubmit={handleFormSubmit}>
                        <div className="input-container-home">
                            <label htmlFor="name">Nome</label>
                            <input className='inputHome' type="text" id="name" placeholder="Nome" value={NomeVisitante} onChange={e => setNomeVisitante(e.target.value)} required />
                        </div>
                        <div className="input-container-home">
                            <label htmlFor="phone">Telefone</label>
                            <input className='inputHome' type="text" id="phone" placeholder="Telefone" value={Telefone} onChange={e => setTelefone(formatPhoneInput(e.target.value))} required />
                        </div>

                        <div className="input-container-home">
                            <label htmlFor="cpf">CPF</label>
                            <input className='inputHome' type="text" id="cpf" placeholder="CPF" value={CPF} onChange={e => setCPF(formatCPFInput(e.target.value))} required />
                        </div>
                        <div className="input-container-home">
                            <label htmlFor="office">Gabinete</label>
                            <select id="office" className="inputHome" value={Gabinete} onChange={e => setGabinete(e.target.value)} required>
                                <option value="" disabled>Selecione uma opção</option>
                                <option value="Gabinete 1">Gabinete 1</option>
                                <option value="Gabinete 2">Gabinete 2</option>
                                {/* Adicione mais opções conforme necessário */}
                            </select>
                        </div>

                        {!assinaturaColetada && (
                            <div onClick={iniciarCapturaAssinatura} className="assinatura-container">
                                Clique para adicionar a Assinatura Eletrônica
                            </div>
                        )}

                        {assinaturaImagem && (
                            <div className="assinatura-container">
                                <img src={`data:image/png;base64,${assinaturaImagem}`} alt="Assinatura" className="assinatura-imagem" />
                            </div>
                        )}



                        <button type='submit' className="register-button">Cadastrar</button>
                    </form>
                </div>
            </div>
            <div className="right-container">
                <div className="right-card">
                    <div className="input-pesquisa-container">

                        <input
                            type="text"
                            className="input-pesquisa"
                            placeholder="Pesquisar por nome ou data/hora..."
                            value={filtroPesquisa}
                            onChange={(e) => setFiltroPesquisa(e.target.value)}
                        />
                        <div className='input-icon-pesquisa'>
                            <FontAwesomeIcon icon={faSearch} className="icon-pesquisa" />
                        </div>
                        <div style={{ position: 'relative', display: 'inline-block', width: '140px' }}>
                            <select
                                className="filtro-data"
                                value={filtroData}
                                onChange={(e) => setFiltroData(e.target.value)}
                                style={{ cursor: 'pointer', width: '100%', appearance: 'none', WebkitAppearance: 'none', paddingRight: '30px' }}
                            >
                                <option value="todos">Todos</option>
                                <option value="hoje">Hoje</option>
                            </select>
                            <FontAwesomeIcon icon={faChevronDown} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                        </div>

                    </div>

                    {isLoading ? (
                        <p>Carregando dados...</p>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>CPF</th>
                                    <th>Telefone</th>
                                    <th>Data/Hora Entrada</th>
                                    <th>Gabinete</th>

                                    <th>Ação</th>
                                </tr>
                            </thead>
                            <tbody>

                                {visitantesFiltrados.map((visitante) => {
                                    const entrada = entradas.find(e => e.visitante === visitante.id);
                                    const semAssinatura = !visitante.assinatura_digital;

                                    return (
                                        <tr key={visitante.id} style={linhaEmEdicao === visitante.id ? { border: "1px solid #06547E !important", borderRadius: "5px" } : {}}>
                                            <td>
                                                {linhaEmEdicao === visitante.id ? (
                                                    <input
                                                        className='input_edit_table'
                                                        type="text"
                                                        value={NomeVisitanteEdit}
                                                        onChange={e => setNomeVisitanteEdit(e.target.value)}
                                                        onBlur={() => salvarEdicao(visitante.id, NomeVisitanteEdit)}
                                                        onKeyPress={event => {
                                                            if (event.key === "Enter") {
                                                                salvarEdicao(visitante.id, NomeVisitanteEdit);
                                                            }
                                                        }}
                                                        autoFocus
                                                    />
                                                ) : (
                                                    <span>{visitante.nome}</span>
                                                )}
                                            </td>

                                            <td>{formatCPF(visitante.cpf)}</td>
                                            <td>{formatPhone(visitante.telefone)}</td>
                                            <td>{formatDate(entrada ? entrada.data_hora_entrada : 'N/A')}</td>

                                            <td>{entrada ? entrada.gabinete : 'N/A'}</td>
                                            <td>
                                                <button onClick={() => iniciarEdicao(visitante.id, visitante.nome)} className='button-edit'>
                                                    <FontAwesomeIcon icon={faEdit} className='icon-edit-table' />
                                                </button>
                                                <button onClick={() => excluirVisitante(visitante.id)} className='button-delete'>
                                                    <FontAwesomeIcon icon={faTrash} className="icon-delete-table" />
                                                </button>

                                                <button onClick={() => abrirModalEntrada(visitante.id)} className='button-entrada'>
                                                    <FontAwesomeIcon icon={faCirclePlus} className="icon-entrada-table" />
                                                </button>

                                                {semAssinatura && (
                                                    <button onClick={() => abrirCampoAssinaturaBio(visitante.id)} className='button-icon'>
                                                        <FontAwesomeIcon icon={faFingerprint} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}

                            </tbody>
                        </table>
                    )}
                </div>

            </div>

            {showSuccessSubmit &&
                <div className="popup-success-container">
                    <span>Cadastro realizado com sucesso ! </span>
                    <FontAwesomeIcon icon={faCircleCheck} className='icons-pop-aviso' />
                </div>
            }

            {showSuccessNovaEntrada &&
                <div className="popup-success-container">
                    <span>Nova entrada realizada com sucesso ! </span>
                    <FontAwesomeIcon icon={faCircleCheck} className='icons-pop-aviso' />
                </div>
            }

            {showSuccessEdit &&
                <div className="popup-success-container">
                    <span>Alteração realizada com sucesso ! </span>
                    <FontAwesomeIcon icon={faCircleCheck} className='icons-pop-aviso' />
                </div>
            }
            <ConfirmationModal
                isOpen={isModalOpen}
                onConfirm={handleConfirmModal}
                onClose={handleCancelModal} // Isso garante que o método seja chamado ao clicar em "Cancelar" ou fechar o modal
                message={modalMessage}>
                <button onClick={handleCancelModal}>Cancelar</button>
                {/* Seu ícone ou botão "x" para fechar também deve chamar handleCancelModal quando clicado */}
            </ConfirmationModal>

            {showNotification && (
                <div className="popup-success-container">
                    {notificationMessage}
                </div>
            )}
            {showItemExcluidoSucess &&
                <div className="popup-error-container">
                    <span>Item Excluido. Cadastro removido com sucesso ! </span>
                    <FontAwesomeIcon icon={faCircleXmark} className='icons-pop-aviso' />
                </div>
            }

            {showInvalidCPF &&
                <div className="popup-error-container">
                    <span>CPF invalido. Verifique a quantidade de digitos ! </span>
                    <FontAwesomeIcon icon={faCircleXmark} className='icons-pop-aviso' />
                </div>
            }

            {showInvalidPhone &&
                <div className="popup-error-container">
                    <span>Telefone invalido. Verifique a quantidade de digitos !</span>
                    <FontAwesomeIcon icon={faCircleXmark} className='icons-pop-aviso' />
                </div>
            }

            {isModalVisible &&
                <div className="modal-background" onClick={() => setIsModalVisible(false)}>
                    <div className="modal-entradas" onClick={e => e.stopPropagation()}>
                        <h2>Nova Entrada</h2>
                        <label htmlFor="gabinete">Selecione o Setor/Gabinete:</label>
                        <select
                            id="gabinete"
                            value={selectedGabinete}
                            onChange={e => setSelectedGabinete(e.target.value)}
                            required
                        >
                            <option value="" disabled>Selecione uma opção</option>
                            {/* Assumindo que você tenha uma lista de gabinetes */}
                            <option value="Gabinete 1">Gabinete 1</option>
                            <option value="Gabinete 2">Gabinete 2</option>
                            {/* Adicione mais opções conforme necessário */}
                        </select>
                        <button onClick={enviarNovaEntrada}>Confirmar</button>
                        <table>
                            <thead>
                                <tr>
                                    <th>Gabinete</th>
                                    <th>Data/Hora Entrada</th>
                                </tr>
                            </thead>
                            <tbody>
                                {entradasDoVisitante.map((entrada, index) => (
                                    <tr key={index}>
                                        <td>{entrada.gabinete}</td>
                                        <td>{formatDate(entrada ? entrada.data_hora_entrada : 'N/A')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            }


        </div>
    );



};


function HomeScreen() {

    const [HomeContentSocketRef, setHomeContentSocketRef] = useState(null);


    // Função para ser chamada por HomeContent para atualizar o socketRef
    const handleSetHomeContentSocketRef = (socketRef) => {
        setHomeContentSocketRef(socketRef);
    };


    return (

        <WebSocketProvider >
            <WebSocketMessageHandlerProvider socket={HomeContentSocketRef}>
                <div>
                    <Home setSocketRefCallback={handleSetHomeContentSocketRef} />

                </div>
            </WebSocketMessageHandlerProvider>
        </WebSocketProvider>

    );
}

export default HomeScreen;

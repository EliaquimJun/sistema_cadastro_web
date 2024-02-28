import React, { useState, useEffect, useCallback, useRef } from 'react';
import LogoPdf from './assets/images/Logo_pdf_autorizacao.png';
import jsPDF from 'jspdf';

import './assets/styles/home.css'; // Importe o arquivo CSS para aplicar estilos
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faCaretDown, faCogs, faUserTie, faHeadset, faKey, faFingerprint, faSignOutAlt, faCalendarAlt, faMapMarkerAlt, faArrowLeft, faTrash, faEdit, faCirclePlus, faSearch, faCircleInfo, faChevronDown, faFilePdf, faSignature, faEye } from '@fortawesome/free-solid-svg-icons';
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
    const [showExistenteCPF, setshowExistenteCPF] = useState(false);
    const [showInvalidPhone, setshowInvalidPhone] = useState(false);
    const [showItemExcluidoSucess, setshowItemExcluidoSucess] = useState(false);
    const [showSuccessNovaEntrada, setshowSuccessNovaEntrada] = useState(false);
    const [showAssinaturaNecessaria, setshowAssinaturaNecessaria] = useState(false);
    const [showSuccessEdit, setshowSuccessEdit] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isModalConfirmDeleteVisible, setIsModalConfirmDeleteVisible] = useState(false);
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
    const visitanteIdRef = useRef(null);
    const [assinaturaPendente, setAssinaturaPendente] = useState(false);
    const gerarPDF = (id, nome, cpf, assinaturaDigital) => {
        const doc = new jsPDF();

        // Ajuste nas dimensões da imagem para 70x70
        doc.addImage(LogoPdf, 'PNG', 10, 10, 20, 20);

        // Calcular o ponto médio vertical da imagem para alinhar o texto
        const meioVertical = 10 + 20 / 2;

        // Título
        doc.setFont('Inter', 'bold');
        doc.setFontSize(16);
        // Alinhado ao lado da imagem e centralizado verticalmente
        doc.text("CÂMARA MUNICIPAL DE MONTES CLAROS – MG", 40, meioVertical);

        // Subtítulo 1 (com fonte menor e sem negrito)
        doc.setFont('Inter', 'normal'); // Se 'normal' não funcionar, use 'times' ou outra fonte padrão
        doc.setFontSize(10);
        doc.text("RUA URBINO VIANA, 600, VILA GUILHERMINA – MONTES CLAROS/MG", 50, meioVertical + 4);

        // Subtítulo 2
        doc.text("CEP:39.400-087 - TELEFONE: (38) 3690-5516", 65, meioVertical + 8);

        // Linha separatória após o cabeçalho
        const posicaoLinha = meioVertical + 14; // Ajuste baseado na última posição 'y' + espaço adicional
        doc.setLineWidth(0.1);
        // Desenha a linha da borda esquerda à direita com margens mínimas
        const margemEsquerda = 30; // Margem esquerda em pontos
        const margemDireita = 30; // Margem direita em pontos
        const larguraPagina = doc.internal.pageSize.width; // Largura total da página em pontos

        // Calcula a posição inicial e final da linha considerando as margens
        const xInicial = margemEsquerda;
        const xFinal = larguraPagina - margemDireita;

        // Desenha a linha
        doc.line(xInicial, posicaoLinha, xFinal, posicaoLinha);

        // Conteúdo do relatório abaixo

        // Início do conteúdo
        let y = meioVertical + 25; // Posição inicial do texto após o cabeçalho

        doc.setFont('Inter');

        // Define a largura útil da página considerando as margens
        const margemEsquerdaContent = 10;
        const margemDireitaContent = 10;
        const larguraPaginaContent = doc.internal.pageSize.width;
        const alturaPagina = doc.internal.pageSize.height;
        const larguraUtil = larguraPaginaContent - margemEsquerdaContent - margemDireitaContent;

        // Função para calcular a posição X para centralizar o texto
        const calcularPosXCentralizado = (texto, larguraPagina, margemEsquerda, margemDireita) => {
            const larguraTexto = doc.getTextWidth(texto);
            const larguraUtil = larguraPagina - margemEsquerda - margemDireita;
            return margemEsquerda + (larguraUtil - larguraTexto) / 2;
        };

        // Função auxiliar para adicionar nova página se necessário
        const verificarEspacoEAdicionarPagina = (espacoNecessario) => {
            if (y + espacoNecessario > alturaPagina) {
                doc.addPage();
                y = 10; // Reinicia a posição Y no topo da nova página
            }
        };

        let larguraDisponivel = doc.internal.pageSize.width - margemEsquerdaContent - margemDireitaContent;

        doc.setFontSize(12)

        // Titulo Content
        // Título
        let TituloContent = `TERMO DE CONSENTIMENTO PARA O TRATAMENTO DE DADOS PESSOAIS
        LEI GERAL DE PROTEÇÃO DE DADOS – LGPD`;

        // Divide o título em linhas para caber na largura disponível
        let TituloContentLinhas = doc.splitTextToSize(TituloContent, larguraDisponivel);

        doc.setFont('Inter', 'bold');
        // Calcula e ajusta a posição X para cada linha do título para centralizar
        TituloContentLinhas.forEach((linha) => {
            let xLinha = calcularPosXCentralizado(linha, larguraPaginaContent, margemEsquerdaContent, margemDireitaContent);
            doc.text(linha, xLinha, y);
            y += 10; // Ajuste o espaçamento vertical conforme necessário para as linhas do título
        });


        y += 10


        let xAtual = 10; // Posição X inicial para o texto

        // Calcula a largura do texto para 'Eu, ' e o nome para ajustar a posição x do texto subsequente
        doc.setFont('Inter', 'normal');
        doc.setFontSize(12); // Tamanho da fonte para o texto normal
        // Renderiza 'Eu, ' no documento
        let introTexto = "Eu, ";

        doc.text(introTexto, xAtual, y);
        xAtual += doc.getTextWidth(introTexto);

        // Nome em negrito
        doc.setFont('Inter', 'bold');
        doc.text(nome, xAtual, y);
        xAtual += doc.getTextWidth(nome);

        // Continuação do texto após o nome, em fonte normal
        doc.setFont('Inter', 'normal');
        let textoApósNome = `, inscrito(a) no CPF sob n° `;
        // Verifica se há espaço suficiente para continuar na mesma linha
        if (xAtual + doc.getTextWidth(textoApósNome) > larguraDisponivel) {
            y += 4; // Move para a próxima linha se não houver espaço
            xAtual = 10; // Reinicia X para o início da linha
        } else {
            doc.text(textoApósNome, xAtual, y);
            xAtual += doc.getTextWidth(textoApósNome);
        }

        // CPF em negrito
        doc.setFont('Inter', 'bold');
        if (xAtual + doc.getTextWidth(cpf) > larguraDisponivel) {
            y += 4; // Move para a próxima linha se não houver espaço
            xAtual = 10; // Reinicia X para o início da linha
        }
        doc.text(cpf, xAtual, y);
        xAtual += doc.getTextWidth(cpf);

        // Continuação do texto após o CPF, em fonte normal
        doc.setFont('Inter', 'normal');
        let textoAposCpf = `, aqui denominado(a) como`;
        if (xAtual + doc.getTextWidth(textoAposCpf) > larguraDisponivel) {
            y += 4; // Move para a próxima linha se não houver espaço
            xAtual = 10; // Reinicia X para o início da linha
        }
        doc.text(textoAposCpf, xAtual, y);
        y += 4; // Move para a próxima linha após o texto após CPF

        // Resto do texto
        let textoRestante = ` TITULAR, venho por meio deste, autorizar que a Câmara Municipal de Montes Claros/MG, inscrita no CNPJ sob n° 25.218.645/0001-26, aqui denominada como CONTROLADORA, realize a coleta e tratamento dos meus dados pessoais, de acordo com os artigos 7° e 11 da Lei n° 13.709/2018, conforme disposto neste termo:`;
        let textoRestanteLinhas = doc.splitTextToSize(textoRestante, larguraDisponivel);
        doc.text(textoRestanteLinhas, 10, y);


        y += 25; // Ajustar o espaçamento conforme necessário

        // Subtitulo em negrito
        doc.setFont('Inter', 'bold');
        let clausulaPrimeira = `CLÁUSULA PRIMEIRA – Dados e Finalidades`;
        let clausulaPrimeiraLinhas = doc.splitTextToSize(clausulaPrimeira, larguraDisponivel);
        doc.text(clausulaPrimeiraLinhas, 10, y);

        y += 10; // Ajustar o espaçamento conforme necessário


        // 2º Paragrafo
        doc.setFont('Inter', 'normal');
        let SegundoParagrafo = `O Titular autoriza a coleta e tratamento dos seus dados pessoais (Nome completo, telefone, CPF, Imagem e endereço, este último de forma opcional) para controle de entrada e saída nas dependências da Controladora, bem como eventual compartilhamento da imagem, por meio de vídeos e/ou fotografias, capturadas no âmbito interno desta Casa Legislativa, durante as Reuniões Ordinárias, Extraordinárias, Sessões Especiais e Setores Internos, divulgadas nas Redes Sociais Oficiais (Site, YouTube, Instagram, Facebook e outros), com o intuito de instruir matérias jornalísticas e  dar publicidade aos trabalhos desenvolvidos pela Casa, que são de interesse da população do Município.`;
        let SegundoParagrafoLinhas = doc.splitTextToSize(SegundoParagrafo, larguraDisponivel);
        doc.text(SegundoParagrafoLinhas, 10, y);

        y += 25;


        // 3º Paragrafo
        doc.setFont('Inter', 'normal');
        let TerceiroParagrafo = `Caso seja necessário o compartilhamento de dados com terceiros que não tenham sido relacionados nesse termo ou qualquer alteração contratual posterior, será ajustado novo termo de consentimento para este fim (§ 6° do artigo 8° e §2° do artigo 9° da Lei n° 13.709/2018);`;
        let TerceiroParagrafoLinhas = doc.splitTextToSize(TerceiroParagrafo, larguraDisponivel);
        doc.text(TerceiroParagrafoLinhas, 10, y + 15);

        y += 20; // Ajustar o espaçamento conforme necessário

        // 4º Paragrafo
        doc.setFont('Inter', 'normal');
        let QuartoParagrafo = `Em caso de alteração na finalidade, que esteja em desacordo com o consentimento original, a Controladora deverá comunicar o Titular, que poderá revogar o consentimento a qualquer tempo, conforme cláusula quarta deste termo;`;
        let QuartoParagrafoLinhas = doc.splitTextToSize(QuartoParagrafo, larguraDisponivel);
        doc.text(QuartoParagrafoLinhas, 10, y + 15);


        y += 15; // Ajustar o espaçamento conforme necessário


        // 5º Paragrafo
        doc.setFont('Inter', 'normal');
        let QuintoParagrafo = `A Controladora fica autorizada a compartilhar os dados pessoais do Titular com outros agentes de tratamento de dados, caso seja necessário para as finalidades listadas neste termo, desde que, sejam respeitados os princípios da boa-fé, finalidade, adequação, necessidade, livre acesso, qualidade dos dados, transparência, segurança, prevenção, não discriminação e responsabilização e prestação de contas.`;
        let QuintoParagrafoLinhas = doc.splitTextToSize(QuintoParagrafo, larguraDisponivel);
        doc.text(QuintoParagrafoLinhas, 10, y + 15);


        y += 30; // Ajustar o espaçamento conforme necessário

        // Subtitulo em negrito
        doc.setFont('Inter', 'bold');
        let clausulaSegunda = `CLÁUSULA SEGUNDA - Responsabilidade pela Segurança dos Dados`;
        let clausulaSegundaLinhas = doc.splitTextToSize(clausulaSegunda, larguraDisponivel);
        doc.text(clausulaSegundaLinhas, 10, y + 15);

        y += 8; // Ajustar o espaçamento conforme necessário


        // 6º Paragrafo
        doc.setFont('Inter', 'normal');
        let SextoParagrafo = `A Controladora se responsabiliza por manter medidas de segurança, técnicas e administrativas suficientes a proteger os dados pessoais do Titular e à Autoridade Nacional de Proteção de Dados (ANPD), comunicando ao Titular, caso ocorra algum incidente de segurança que possa acarretar risco ou dano relevante, conforme artigo 48 da Lei n° 13.709/2020.`;
        let SextoParagrafoLinhas = doc.splitTextToSize(SextoParagrafo, larguraDisponivel);
        doc.text(SextoParagrafoLinhas, 10, y + 15);


        y += 20; // Ajustar o espaçamento conforme necessário


        verificarEspacoEAdicionarPagina(200); // Verifica espaço para o título

        // Subtitulo em negrito
        doc.setFont('Inter', 'bold');
        let clausulaTerceira = `CLÁUSULA TERCEIRA - Término do Tratamento dos Dados`;
        let clausulaTerceiraLinhas = doc.splitTextToSize(clausulaTerceira, larguraDisponivel);
        doc.text(clausulaTerceiraLinhas, 10, y + 15);

        y += 8; // Ajustar o espaçamento conforme necessário


        // 7º Paragrafo
        doc.setFont('Inter', 'normal');
        let SetimoParagrafo = `O titular declara ciência de que tais dados ficarão armazenados por até 02 (dois) anos, sendo que após este prazo, deverão fornecê-los novamente para os mesmos fins, nos termos do artigo 16 da Lei n° 13.709/2018.`;
        let SetimoParagrafoLinhas = doc.splitTextToSize(SetimoParagrafo, larguraDisponivel);
        doc.text(SetimoParagrafoLinhas, 10, y + 15);


        y += 15; // Ajustar o espaçamento conforme necessário

        // Subtitulo em negrito
        doc.setFont('Inter', 'bold');
        let clausulaQuarta = `CLÁUSULA QUARTA - Direito de Revogação do Consentimento`;
        let clausulaQuartaLinhas = doc.splitTextToSize(clausulaQuarta, larguraDisponivel);
        doc.text(clausulaQuartaLinhas, 10, y + 15);

        y += 8; // Ajustar o espaçamento conforme necessário


        // 8º Paragrafo
        doc.setFont('Inter', 'normal');
        let OitavoParagrafo = `O Titular poderá revogar seu consentimento, a qualquer tempo, por e-mail (lgpd@montesclaros.mg.leg.br) ou por carta escrita, conforme o artigo 8°, § 5°, da Lei n° 13.709/2020.`;
        let OitavoParagrafoLinhas = doc.splitTextToSize(OitavoParagrafo, larguraDisponivel);
        doc.text(OitavoParagrafoLinhas, 10, y + 15);


        y += 15; // Ajustar o espaçamento conforme necessário

        // Subtitulo em negrito
        doc.setFont('Inter', 'bold');
        let clausulaQuinta = `CLÁUSULA QUINTA - Vazamento de Dados ou Acessos Não Autorizados – Penalidades`;
        let clausulaQuintaLinhas = doc.splitTextToSize(clausulaQuinta, larguraDisponivel);
        doc.text(clausulaQuintaLinhas, 10, y + 15);

        y += 8; // Ajustar o espaçamento conforme necessário


        // 9º Paragrafo
        doc.setFont('Inter', 'normal');
        let NonoParagrafo = `As partes poderão entrar em acordo, quanto aos eventuais danos causados, caso exista o vazamento de dados pessoais ou acessos não autorizados, e caso não haja acordo, a Controladora tem ciência que estará sujeita às penalidades aplicáveis ao poder público, previstas no artigo 52 da Lei n° 13.709/2018.`;
        let NonoParagrafoLinhas = doc.splitTextToSize(NonoParagrafo, larguraDisponivel);
        doc.text(NonoParagrafoLinhas, 10, y + 15);






        // Incrementa 'y' para criar um espaçamento antes de iniciar esta seção
        y += 45; // Ajuste conforme necessário para o espaçamento vertical

        // Primeira linha: Local e data para preenchimento
        let linhaData = "Montes Claros/MG, _______ de _____________________ de ___________";
        let xLinhaData = calcularPosXCentralizado(linhaData, larguraPaginaContent, margemEsquerdaContent, margemDireitaContent);
        doc.setFont('Inter', 'normal');
        doc.setFontSize(12); // Ajuste o tamanho da fonte conforme necessário
        doc.text(linhaData, xLinhaData, y);
        y += 20; // Espaçamento para a próxima seção


        let larguraAssinatura = 70;
        let alturaAssinatura = 20;
        let xAssinatura = calcularPosXCentralizado('', larguraPaginaContent, margemEsquerdaContent, margemDireitaContent) - larguraAssinatura / 2; // Ajusta a posição X baseando-se na largura da assinatura

        // Verifica se a assinatura é null ou string vazia
        if (!assinaturaDigital) {
            // Texto para indicar que a assinatura deve ser coletada
            let textoSemAssinatura = "[Colete a Assinatura Eletrônica]";
            let larguraTextoSemAssinatura = calcularPosXCentralizado(textoSemAssinatura, larguraPaginaContent, margemEsquerdaContent, margemDireitaContent);
            doc.setFont('Inter', 'italic'); // Ajuste conforme desejado para o texto
            doc.setFontSize(10); // Ajuste conforme necessário para o tamanho da fonte
            doc.text(textoSemAssinatura, larguraTextoSemAssinatura, y + alturaAssinatura / 2); // Posiciona o texto onde a assinatura iria
            y += alturaAssinatura - 7; // Ajusta 'y' como se a assinatura tivesse sido adicionada
        } else {
            // Adiciona a imagem da assinatura caso exista
            doc.addImage(assinaturaDigital, 'PNG', xAssinatura, y, larguraAssinatura, alturaAssinatura);
            y += alturaAssinatura; // Espaçamento após a imagem da assinatura
        }


        // Segunda linha: Espaço para assinatura do TITULAR
        let linhaAssinaturaTitular = "____________________________________________";
        let xLinhaAssinaturaTitular = calcularPosXCentralizado(linhaAssinaturaTitular, larguraPaginaContent, margemEsquerdaContent, margemDireitaContent);
        doc.text(linhaAssinaturaTitular, xLinhaAssinaturaTitular, y);

        // Texto "TITULAR" centralizado abaixo da linha de assinatura
        doc.setFont('Inter', 'bold');
        let tituloTitular = "TITULAR";
        let xTituloTitular = calcularPosXCentralizado(tituloTitular, larguraPaginaContent, margemEsquerdaContent, margemDireitaContent);
        y += 10; // Ajuste o espaçamento vertical conforme necessário para o texto abaixo da linha
        doc.text(tituloTitular, xTituloTitular, y);
        y += 20; // Espaçamento para a próxima seção

        // Terceira linha: Espaço para assinatura da CONTROLADORA
        let linhaAssinaturaControladora = "____________________________________________";
        let xLinhaAssinaturaControladora = calcularPosXCentralizado(linhaAssinaturaControladora, larguraPaginaContent, margemEsquerdaContent, margemDireitaContent);
        doc.text(linhaAssinaturaControladora, xLinhaAssinaturaControladora, y);

        // Texto "CONTROLADORA" centralizado abaixo da linha de assinatura
        let tituloControladora = "CONTROLADORA";
        let xTituloControladora = calcularPosXCentralizado(tituloControladora, larguraPaginaContent, margemEsquerdaContent, margemDireitaContent);
        y += 10; // Ajuste o espaçamento vertical conforme necessário para o texto abaixo da linha
        doc.text(tituloControladora, xTituloControladora, y);


        doc.save(`Termo_consentimento_${nome}.pdf`);
    };


    async function getUserId() {
        const username = sessionStorage.getItem('username');
        const token = sessionStorage.getItem('token'); // Presumindo que você também armazene o token JWT
    
        if (!username) {
            console.error('Username não encontrado no sessionStorage');
            return null;
        }
    
        try {
            const response = await axios.get(`http://192.168.254.82:8000/api/get_user_id/?username=${username}`, {
                headers: {
                    'Authorization': `Bearer ${token}`, // Assegura que a requisição é autenticada
                }
            });
    
            console.log("Resposta da API:", response);
    
            // Checa se a resposta contém o campo login_id e o retorna
            if (response.data && response.data.login_id) {
                console.log("Esse é o ID do login", response.data.login_id)
                return response.data.login_id;
                
            } else {
                console.error('ID do login não encontrado na resposta');
                return null;
            }
        } catch (error) {
            console.error('Erro ao obter o ID do login:', error);
            return null;
        }
    }
    
    

    const iniciarCapturaAssinatura = () => {
        visitanteIdRef.current = null;
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
            if (visitanteIdRef.current) {

            setModalMessage("Deseja adicionar esta assinatura ao usuário?");
            setAssinaturaImagemEdit(obj.imageData); // Armazena a imagem da assinatura temporariamente
            setAssinaturaPendente(true); // Indica que há uma assinatura pendente de confirmação
            setIsModalOpen(true); // Abre o modal para confirmação do usuário
        }}
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
        const url = `http://192.168.254.82:8000/api/manage_visitante/${id}/`;
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
            setNotificationMessage("Assinatura atualizada com sucesso!" );
            setShowNotification(true);
            // Opcional: esconder a notificação após X segundos
            setTimeout(() => setShowNotification(false), 3000);

            fetchVisitantes()
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
            socketRefWithId.current = new WebSocket(`ws://192.168.254.82:8000/ws/manage_cadastro/`);
        }

        if (!socketRefWithoutId.current || socketRefWithoutId.current.readyState === WebSocket.CLOSED) {
            socketRefWithoutId.current = new WebSocket(`ws://192.168.254.82:8000/ws/manage_cadastro/`);
        }

    }, [socketRefWithId, socketRefWithoutId, initializeWebSocket]);

    const fetchVisitantes = useCallback(async () => {
        setIsLoading(true);
        // Adiciona o parâmetro de ordenação na URL de entradas
        const urlVisitantes = 'http://192.168.254.82:8000/api/manage_visitante/';
        const urlEntradas = 'http://192.168.254.82:8000/api/manage_entrada/?ordering=-data_hora_entrada';
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
        getUserId();
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

        // Verifica se a assinatura foi coletada
        if (!assinaturaImagem) {
            setshowAssinaturaNecessaria(true)
            setTimeout(() => setshowAssinaturaNecessaria(false), 3000);  // Esconde após 3 segundos
            return; // Interrompe a execução da função se não houver assinatura
        }


        // Verificação da existência do CPF
        const urlVerificaCPF = `http://192.168.254.82:8000/api/manage_visitante/?cpf=${CPF}`;
        try {
            const respostaCPF = await axios.get(urlVerificaCPF, {
                headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` },
            });
            if (respostaCPF.data && respostaCPF.data.length > 0) {
                setshowExistenteCPF(true)
                setTimeout(() => setshowExistenteCPF(false), 3000);  // Esconde após 3 segundos
                return;
            }
        } catch (error) {
            console.error("Erro ao verificar CPF", error);
            return;
        }
        const formDataVisitante = new FormData();
        formDataVisitante.append('nome', NomeVisitante);
        formDataVisitante.append('cpf', CPF);
        formDataVisitante.append('telefone', Telefone);
        formDataVisitante.append('email', Email);

        const LoginId = await getUserId(); // Adiciona o await aqui

        if(LoginId){
            formDataVisitante.append('login', LoginId);
        }

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

        const url_visitante = `http://192.168.254.82:8000/api/manage_visitante/`;

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



            const url_entrada = `http://192.168.254.82:8000/api/manage_entrada/`;

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





    const [selectedVisitanteBackup, setSelectedVisitanteBackup] = useState({
        id: null,
        nome: '',
        cpf: '',
        telefone: '',
        email: '',
        assinatura_digital: '',
        login: null
    });
    const [motivoExclusao, setMotivoExclusao] = useState('');

    const confirmarExclusao = async (e) => {
        e.preventDefault(); // Previne o comportamento padrão de submissão de formulário
        setIsModalConfirmDeleteVisible(false); // Fecha o modal
    
        // Função para inserir dados na lixeira
        await inserirDadosLixeira();
    
        // Após inserir os dados na lixeira, chama a função de exclusão do visitante
        await excluirVisitante(selectedVisitanteId);
    };
    
    const inserirDadosLixeira = async () => {
        const urlVisitanteLixeira = 'http://192.168.254.82:8000/api/manage_visitante_lixeira/';
        const urlEntradaLixeira = 'http://192.168.254.82:8000/api/manage_entrada_lixeira/';
        const token = sessionStorage.getItem('token');

        console.log("Dados do visitante para lixeira antes do envio:", {
            ...selectedVisitanteBackup,
            motivo: motivoExclusao
        });
    
        // Primeiro, insira o visitante na lixeira e obtenha o ID
        const responseVisitanteLixeira = await axios.post(urlVisitanteLixeira, {
            ...selectedVisitanteBackup,
            data_hora_exclusao: moment().subtract(3, 'hours').toISOString(),
            motivo: motivoExclusao
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });

        const visitanteLixeiraId = responseVisitanteLixeira.data.id;

        console.log("Dados visitantes depois de enviar:",responseVisitanteLixeira.data)
    
        // Agora que você tem o visitanteLixeiraId, você pode logar e inserir as entradas corretamente
        entradasDoVisitante.forEach(entrada => {
            console.log("Dados da entrada para lixeira antes do envio:", {
                ...entrada,
                visitante: visitanteLixeiraId // Agora isso é válido porque visitanteLixeiraId foi definido

            });
        });

    
        // Para cada entrada do visitante, insere na lixeira
        for (const entrada of entradasDoVisitante) {
            const responseEntradaLixeira = await axios.post(urlEntradaLixeira, {
                ...entrada,
                visitante: visitanteLixeiraId // Agora isso é válido porque visitanteLixeiraId foi definido
  
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
    
            console.log("Resposta da inserção da entrada na lixeira:", responseEntradaLixeira.data);
        }
    
        setIsModalConfirmDeleteVisible(false); // Fecha o modal
    };
    
    

    

    const [linhaEmEdicao, setLinhaEmEdicao] = useState(null);

    const iniciarEdicao = (id, nome) => {
        setLinhaEmEdicao(id);
        setNomeVisitanteEdit(nome)
    };


    const salvarEdicao = async (id, novoNome) => {
        const url = `http://192.168.254.82:8000/api/manage_visitante/${id}/`;
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

        const token = sessionStorage.getItem('token');
        const headers = {
            'Authorization': `Bearer ${token}`,
        };

        try {
            // Primeiro, exclui todas as entradas relacionadas ao visitante
            const urlEntradas = `http://192.168.254.82:8000/api/manage_entrada/por_visitante/${id}/`;
            await axios.delete(urlEntradas, { headers });

            // Depois, exclui o visitante
            const urlVisitante = `http://192.168.254.82:8000/api/manage_visitante/${id}/`;
            await axios.delete(urlVisitante, { headers });


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

    const abrirModalDelete = (visitanteId, nome, cpf, telefone, email, login) => {
        setSelectedVisitanteBackup({  nome: nome, cpf: cpf, telefone: telefone, email: email, login: login });
        setSelectedVisitanteId(visitanteId);
        setIsModalConfirmDeleteVisible(true);
        setMotivoExclusao(''); // Resetar o motivo da exclusão
      
        buscarEntradasDoVisitante(visitanteId);
    };


    const buscarEntradasDoVisitante = async (visitanteId) => {

        const url = `http://192.168.254.82:8000/api/manage_entrada/buscar_por_visitante/${visitanteId}`;
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
        const url = `http://192.168.254.82:8000/api/manage_entrada/`;
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
    });




    const [isModalViewAssinatura, setIsModalViewAssinatura] = useState(false);
    const [assinaturaVisitante, setAssinaturaVisitante] = useState({ nome: '', assinaturaUrl: '' });

    const modalAssinatura = (id, nome, assinaturaDigital) => {
        setAssinaturaVisitante({
            nome,
            assinaturaUrl: assinaturaDigital 
        });
        setIsModalViewAssinatura(true);
    };










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
                                <option value="GAB.ALDAIR">GAB.ALDAIR</option>
                                <option value="GAB.CECÍLIA">GAB.CECÍLIA</option>
                                <option value="GAB.CLAÚDIO">GAB.CLAÚDIO</option>
                                <option value="GAB.DANIEL">GAB.DANIEL</option>
                                <option value="GAB.EDSON">GAB.EDSON</option>
                                <option value="GAB.ELAIR">GAB.ELAIR</option>
                                <option value="GAB.ELDAIR">GAB.ELDAIR</option>
                                <option value="GAB.IGOR">GAB.IGOR</option>
                                <option value="GAB.LEÃOZINHO">GAB.LEÃOZINHO</option>
                                <option value="GAB. MARCOS N.">GAB. MARCOS N.</option>
                                <option value="GAB. MARIA H.">GAB. MARIA H.</option>
                                <option value="GAB. MARIA DAS GRAÇAS">GAB. MARIA DAS GRAÇAS</option>
                                <option value="GAB.MARLUS">GAB.MARLUS</option>
                                <option value="GAB.JÚNIOR MARTINS">GAB.JÚNIOR MARTINS</option>
                                <option value="GAB.ODAIR F">GAB.ODAIR F</option>
                                <option value="GAB.PROFESSORA IARA">GAB.PROFESSORA IARA</option>
                                <option value="GAB.RAIMUNDO P.">GAB.RAIMUNDO P.</option>
                                <option value="GAB.REINALDO B.">GAB.REINALDO B.</option>
                                <option value="GAB.RODRIGO C.">GAB.RODRIGO C.</option>
                                <option value="GAB.SOTER">GAB.SOTER</option>
                                <option value="GAB.SOTER">GAB.STÁLIN</option>
                                <option value="GAB.VALDECY C.">GAB.VALDECY C.</option>
                                <option value="GAB.WILTON D.">GAB.WILTON D.</option>
                                <option value="ALMOXARIFADO">ALMOXARIFADO</option>
                                <option value="A.T.L">A.T.L</option>
                                <option value="A.T.F">A.T.F</option>
                                <option value="A.T.C">A.T.C</option>
                                <option value="ASVEC">ASVEC</option>
                                <option value="ASCOM">ASCOM</option>
                                <option value="CERIMONIAL">CERIMONIAL</option>
                                <option value="COMISSÕES ">COMISSÕES </option>
                                <option value="COMPRAS">COMPRAS</option>
                                <option value="CONTROLADORIA">CONTROLADORIA</option>
                                <option value="ESCOLA">ESCOLA</option>
                                <option value="GERÊNCIA">GERÊNCIA</option>
                                <option value="PRESIDENCIA">PRESIDENCIA</option>
                                <option value="T.I">T.I</option>
                                <option value="RH">RH</option>
                                <option value="OUVIDORIA">OUVIDORIA</option>
                                <option value="PLENARIO">PLENARIO</option>
                       
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
                    <div className="pesquisa-e-filtro-container">
                        <div className="input-pesquisa-container">
                            <FontAwesomeIcon icon={faSearch} className="icon-pesquisa" />
                            <input
                                type="text"
                                className="input-pesquisa"
                                placeholder="Pesquisar por nome ou data/hora..."
                                value={filtroPesquisa}
                                onChange={(e) => setFiltroPesquisa(e.target.value)}
                            />
                        </div>
                        <div className="select-pesquisa-container">
                            <select
                                className="filtro-data"
                                value={filtroData}
                                onChange={(e) => setFiltroData(e.target.value)}
                            >
                                <option value="todos">Todos</option>
                                <option value="hoje">Hoje</option>
                                {/* Adicione mais opções conforme necessário */}
                            </select>
                            <div className='icon-chevron-down'>
                                <FontAwesomeIcon icon={faChevronDown} />
                            </div>
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
                                                <button onClick={() => iniciarEdicao(visitante.id, visitante.nome)} className='button-edit' title="Editar" >
                                                    <FontAwesomeIcon icon={faEdit} className='icon-edit-table'  />
                                                </button>
                                                <button onClick={() => abrirModalDelete(visitante.id,visitante.nome,visitante.cpf,visitante.telefone,visitante.email,visitante.login)} className='button-delete' title="Excluir">
                                                    <FontAwesomeIcon icon={faTrash} className="icon-delete-table" />
                                                </button>

                                                <button onClick={() => abrirModalEntrada(visitante.id)} className='button-entrada' title="Nova Entrada">
                                                    <FontAwesomeIcon icon={faCirclePlus} className="icon-entrada-table" />
                                                </button>

                                                {semAssinatura && (
                                                    <button onClick={() => abrirCampoAssinaturaBio(visitante.id)} className='button-assinatura' title="Coletar Assinatura">
                                                        <FontAwesomeIcon icon={faSignature} className="icon-assinatura-table" />
                                                    </button>
                                                )}

                                                {!semAssinatura && (
                                                    <button onClick={() => modalAssinatura(visitante.id,visitante.nome,visitante.assinatura_digital)} className='button-assinatura' title="Ver Assinatura">
                                                        <FontAwesomeIcon icon={faEye} className="icon-assinatura-table" />
                                                    </button>
                                                  )}

                                                <button onClick={() => gerarPDF(visitante.id, visitante.nome, visitante.cpf, visitante.assinatura_digital)} className='button-pdf' title="Gerar PDF">
                                                    <FontAwesomeIcon icon={faFilePdf} className="icon-pdf-table" />
                                                </button>
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
                    <FontAwesomeIcon icon={faCircleCheck} className='icons-pop-aviso' />
                </div>
            )}
            {showItemExcluidoSucess &&
                <div className="popup-error-container">
                    <span>Cadastro removido com sucesso ! </span>
                    <FontAwesomeIcon icon={faCircleXmark} className='icons-pop-aviso' />
                </div>
            }

            {showInvalidCPF &&
                <div className="popup-error-container">
                    <span>CPF invalido. Verifique a quantidade de digitos ! </span>
                    <FontAwesomeIcon icon={faCircleXmark} className='icons-pop-aviso' />
                </div>
            }

            {showExistenteCPF &&
                <div className="popup-error-container">
                    <span>CPF já cadastrado. Verifique o nome no campo de pesquisa ! </span>
                    <FontAwesomeIcon icon={faCircleXmark} className='icons-pop-aviso' />
                </div>
            }

            {showInvalidPhone &&
                <div className="popup-error-container">
                    <span>Telefone invalido. Verifique a quantidade de digitos !</span>
                    <FontAwesomeIcon icon={faCircleXmark} className='icons-pop-aviso' />
                </div>
            }

            {showAssinaturaNecessaria &&
                <div className="popup-info-container">
                    <span>Por favor, adicione a assinatura eletrônica para continuar com o cadastro.</span>
                    <FontAwesomeIcon icon={faCircleInfo} className='icons-pop-aviso' />
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
                                <option value="GAB.ALDAIR">GAB.ALDAIR</option>
                                <option value="GAB.CECÍLIA">GAB.CECÍLIA</option>
                                <option value="GAB.CLAÚDIO">GAB.CLAÚDIO</option>
                                <option value="GAB.DANIEL">GAB.DANIEL</option>
                                <option value="GAB.EDSON">GAB.EDSON</option>
                                <option value="GAB.ELAIR">GAB.ELAIR</option>
                                <option value="GAB.ELDAIR">GAB.ELDAIR</option>
                                <option value="GAB.IGOR">GAB.IGOR</option>
                                <option value="GAB.LEÃOZINHO">GAB.LEÃOZINHO</option>
                                <option value="GAB. MARCOS N.">GAB. MARCOS N.</option>
                                <option value="GAB. MARIA H.">GAB. MARIA H.</option>
                                <option value="GAB. MARIA DAS GRAÇAS">GAB. MARIA DAS GRAÇAS</option>
                                <option value="GAB.MARLUS">GAB.MARLUS</option>
                                <option value="GAB.JÚNIOR MARTINS">GAB.JÚNIOR MARTINS</option>
                                <option value="GAB.ODAIR F">GAB.ODAIR F</option>
                                <option value="GAB.PROFESSORA IARA">GAB.PROFESSORA IARA</option>
                                <option value="GAB.RAIMUNDO P.">GAB.RAIMUNDO P.</option>
                                <option value="GAB.REINALDO B.">GAB.REINALDO B.</option>
                                <option value="GAB.RODRIGO C.">GAB.RODRIGO C.</option>
                                <option value="GAB.SOTER">GAB.SOTER</option>
                                <option value="GAB.SOTER">GAB.STÁLIN</option>
                                <option value="GAB.VALDECY C.">GAB.VALDECY C.</option>
                                <option value="GAB.WILTON D.">GAB.WILTON D.</option>
                                <option value="ALMOXARIFADO">ALMOXARIFADO</option>
                                <option value="A.T.L">A.T.L</option>
                                <option value="A.T.F">A.T.F</option>
                                <option value="A.T.C">A.T.C</option>
                                <option value="ASVEC">ASVEC</option>
                                <option value="ASCOM">ASCOM</option>
                                <option value="CERIMONIAL">CERIMONIAL</option>
                                <option value="COMISSÕES ">COMISSÕES </option>
                                <option value="COMPRAS">COMPRAS</option>
                                <option value="CONTROLADORIA">CONTROLADORIA</option>
                                <option value="ESCOLA">ESCOLA</option>
                                <option value="GERÊNCIA">GERÊNCIA</option>
                                <option value="PRESIDENCIA">PRESIDENCIA</option>
                                <option value="T.I">T.I</option>
                                <option value="RH">RH</option>
                                <option value="OUVIDORIA">OUVIDORIA</option>
                                <option value="PLENARIO">PLENARIO</option>
                        </select>
                        <button onClick={enviarNovaEntrada}>Confirmar</button>
                        <table>
                            <thead>
                                <tr>
                                    <th>Gabinete/Setor</th>
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

{isModalConfirmDeleteVisible &&
    <div className="modal-background" onClick={() => setIsModalConfirmDeleteVisible(false)}>
        <form className="modal-delete" onClick={e => e.stopPropagation()} onSubmit={confirmarExclusao}>
            <h2>Confirmação</h2>
            <p>Tem certeza que deseja excluir este cadastro?</p>
            <label htmlFor="motivoExclusao" className="textarea-label">Motivo:</label>
            <textarea
                required
                id="motivoExclusao"
                placeholder="Motivo da exclusão"
                value={motivoExclusao}
                onChange={(e) => setMotivoExclusao(e.target.value)}
                className="textarea-motivo"
            ></textarea>
            <div className="modal-actions">
                <button type="submit">Confirmar</button>
                <button type="button" onClick={() => setIsModalConfirmDeleteVisible(false)}>Cancelar</button>
            </div>
        </form>
    </div>
}



{isModalViewAssinatura &&
                <div className="modal-background" onClick={() => setIsModalConfirmDeleteVisible(false)}>
                    <div className="modal-assinatura" onClick={e => e.stopPropagation()}>

                    </div>
                </div>
            }



{isModalViewAssinatura &&
    <div className="modal-background" onClick={() => setIsModalViewAssinatura(false)}>
        <div className="modal-assinatura" onClick={e => e.stopPropagation()}>
            <h2>Assinatura</h2>
            <div className="modal-assinatura-content">
                {/* Nome do Visitante */}
                <div className="modal-assinatura-nome">{assinaturaVisitante.nome}</div>
                {/* Imagem da Assinatura */}
                <img src={assinaturaVisitante.assinaturaUrl} alt="Assinatura" />
                {/* Linha de Assinatura */}
                <p>_________________________________________</p>
            </div>
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

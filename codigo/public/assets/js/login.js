// Trabalho Interdisciplinar 1 - Aplicações Web
//
// Módulo de login/registro de usuários com backend baseado em API REST
// provida pelo JSONServer. Os dados de usuário estão em db.json.
//
// Autor original: Rommel Vieira Carneiro (rommelcarneiro@gmail.com)
// Adaptado em 02/07/2026 para integração não-bloqueante com a home-page
// (usuário pode navegar pelo site sem estar logado; login passa a ser
// necessário apenas para as ações que exigem usuário identificado, como
// marcar favoritos).

// Página inicial de Login
const LOGIN_URL = "/modulos/login/login.html";
let RETURN_URL = "/index.html";
const API_URL = '/usuarios';

// Objeto para o banco de dados de usuários baseado em JSON
var db_usuarios = [];

// Objeto para o usuário corrente (fica vazio {} quando ninguém está logado)
var usuarioCorrente = {};

// Inicializa a aplicação de Login em qualquer página que inclua este script
function initLoginApp() {
    let pagina = window.location.pathname;

    // Sempre carrega a lista de usuários (necessária tanto para a tela de
    // login/registro quanto para eventuais validações futuras)
    carregarUsuarios(() => {
        console.log('Usuários carregados...');
    });

    // Recupera o usuário logado (se houver) a partir do sessionStorage
    let usuarioCorrenteJSON = sessionStorage.getItem('usuarioCorrente');
    if (usuarioCorrenteJSON) {
        usuarioCorrente = JSON.parse(usuarioCorrenteJSON);
    } else {
        usuarioCorrente = {};
    }

    if (pagina != LOGIN_URL) {
        // Guarda a página atual como URL de retorno, para que o login
        // redirecione de volta para onde o usuário estava
        sessionStorage.setItem('returnURL', pagina);
        RETURN_URL = pagina;
    } else {
        // Está na página de login: usa a URL de retorno salva, se existir
        let returnURL = sessionStorage.getItem('returnURL');
        RETURN_URL = returnURL || RETURN_URL;
    }

    // Assim que o DOM estiver pronto, atualiza a área de informações de
    // login (span #userInfo) presente no cabeçalho das páginas
    document.addEventListener('DOMContentLoaded', function () {
        renderAuthUI('userInfo');
    });
}

function carregarUsuarios(callback) {
    fetch(API_URL)
        .then(response => response.json())
        .then(data => {
            db_usuarios = data;
            if (callback) callback();
        })
        .catch(error => {
            console.error('Erro ao ler usuários via API JSONServer:', error);
        });
}

// Retorna true se existe um usuário logado na sessão atual
function isLoggedIn() {
    return !!sessionStorage.getItem('usuarioCorrente');
}

// Verifica se o login do usuário está ok e, se positivo, salva a sessão
function loginUser(login, senha) {
    for (var i = 0; i < db_usuarios.length; i++) {
        var usuario = db_usuarios[i];

        if (login == usuario.login && senha == usuario.senha) {
            usuarioCorrente = {
                id: usuario.id,
                login: usuario.login,
                email: usuario.email,
                nome: usuario.nome
            };

            // Salva os dados do usuário corrente no Session Storage
            sessionStorage.setItem('usuarioCorrente', JSON.stringify(usuarioCorrente));

            return true;
        }
    }

    return false;
}

// Encerra a sessão do usuário corrente (logout) e atualiza a página atual
function logoutUser() {
    sessionStorage.removeItem('usuarioCorrente');
    usuarioCorrente = {};

    // Se estiver em uma página que exige login (ex.: meus favoritos),
    // volta para a home; caso contrário, apenas recarrega a página atual
    // para refletir o estado "deslogado" na interface.
    window.location.reload();
}

function addUser(nome, login, senha, email) {
    let usuario = { "login": login, "senha": senha, "nome": nome, "email": email };

    fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(usuario),
    })
        .then(response => response.json())
        .then(data => {
            db_usuarios.push(data);
            displayMessage("Usuário inserido com sucesso");
        })
        .catch(error => {
            console.error('Erro ao inserir usuário via API JSONServer:', error);
            displayMessage("Erro ao inserir usuário");
        });
}

function displayMessage(msg) {
    alert(msg);
}

// Monta a URL de login incluindo a página atual como retorno
function getLoginLinkHref() {
    return LOGIN_URL;
}

// Renderiza, dentro do elemento informado, a área de login:
// - "Entrar" (link para o formulário de login), se ninguém estiver logado
// - "Olá, <nome> | Sair", se houver um usuário logado
function renderAuthUI(elementId) {
    var elemUser = document.getElementById(elementId);
    if (!elemUser) return;

    if (isLoggedIn()) {
        elemUser.innerHTML =
            `Olá, <strong>${usuarioCorrente.nome}</strong> | ` +
            `<a href="#" id="linkSair" onclick="logoutUser(); return false;">Sair</a>`;
    } else {
        elemUser.innerHTML = `<a href="${getLoginLinkHref()}" id="linkEntrar">Entrar</a>`;
    }
}

// Mantido por compatibilidade com páginas antigas do template
function showUserInfo(element) {
    renderAuthUI(element);
}

// Inicializa as estruturas utilizadas pelo LoginApp
initLoginApp();

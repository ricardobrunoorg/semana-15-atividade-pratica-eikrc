// Módulo de Favoritos
//
// Permite que um usuário logado marque/desmarque filmes como favoritos.
// Os favoritos são armazenados no localStorage com chave composta
// "favoritos_<idDoUsuario>", cujo valor é um array de ids: ex. [3, 7, 12]
// Isso garante que a lista persista entre recarregamentos de página e
// entre sessões, sendo específica para cada usuário.
//
// Depende de login.js já ter sido carregado antes (usa usuarioCorrente,
// isLoggedIn() e LOGIN_URL).

const FAVORITOS_PREFIX = 'favoritos_';

// Retorna a chave de localStorage usada para o usuário informado
function chaveFavoritos(idUsuario) {
    return `${FAVORITOS_PREFIX}${idUsuario}`;
}

// Retorna o array de ids favoritados do usuário logado (ou [] se ninguém
// estiver logado ou não houver favoritos salvos)
function getFavoritos() {
    if (!isLoggedIn()) return [];

    let raw = localStorage.getItem(chaveFavoritos(usuarioCorrente.id));
    if (!raw) return [];

    try {
        return JSON.parse(raw);
    } catch (e) {
        return [];
    }
}

// Salva o array de ids favoritados do usuário logado
function salvarFavoritos(listaIds) {
    if (!isLoggedIn()) return;
    localStorage.setItem(chaveFavoritos(usuarioCorrente.id), JSON.stringify(listaIds));
}

// Verifica se um item já está favoritado pelo usuário logado
function isFavorito(id) {
    let favoritos = getFavoritos();
    return favoritos.includes(Number(id));
}

// Alterna o estado de favorito de um item (adiciona/remove) para o usuário
// logado. Se ninguém estiver logado, bloqueia a ação, avisa e redireciona
// para a tela de login. Retorna o novo estado (true = favoritado) ou null
// se a ação foi bloqueada por falta de login.
function toggleFavorito(id) {
    id = Number(id);

    if (!isLoggedIn()) {
        alert('Você precisa estar logado para marcar favoritos. Você será redirecionado para a tela de login.');
        window.location.href = LOGIN_URL;
        return null;
    }

    let favoritos = getFavoritos();
    let idx = favoritos.indexOf(id);
    let novoEstado;

    if (idx >= 0) {
        favoritos.splice(idx, 1);
        novoEstado = false;
    } else {
        favoritos.push(id);
        novoEstado = true;
    }

    salvarFavoritos(favoritos);
    return novoEstado;
}

// Atualiza visualmente um botão de favorito (ícone preenchido/vazio + classe)
function atualizarBotaoFavorito(botao, favoritado) {
    if (!botao) return;
    botao.classList.toggle('favoritado', favoritado);
    botao.innerHTML = favoritado ? '★' : '☆';
    botao.setAttribute('aria-pressed', favoritado ? 'true' : 'false');
    botao.title = favoritado ? 'Remover dos favoritos' : 'Adicionar aos favoritos';
}

// Handler pronto para ser usado em onclick="handleFavoritoClick(event, id, this)"
function handleFavoritoClick(event, id, botao) {
    event.preventDefault();
    event.stopPropagation();

    let novoEstado = toggleFavorito(id);
    if (novoEstado === null) return; // bloqueado por falta de login

    atualizarBotaoFavorito(botao, novoEstado);

    // Marca/desmarca visualmente o card inteiro, se existir
    let card = botao.closest('.card-filme');
    if (card) card.classList.toggle('favoritado', novoEstado);

    // Se estivermos na página "Meus Favoritos", remover o card ao
    // desfavoritar dá um feedback imediato
    if (window.location.pathname.endsWith('favoritos.html') && !novoEstado && card) {
        card.remove();
    }
}

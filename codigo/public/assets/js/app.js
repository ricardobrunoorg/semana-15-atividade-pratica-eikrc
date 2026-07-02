// app.js
// Busca os filmes cadastrados via API do JSON Server e renderiza os cards
// na home-page, incluindo o botão de favoritar.

const FILMES_API_URL = '/filmes';

function criarCardFilme(filme) {
    let favoritado = isFavorito(filme.id);

    let card = document.createElement('div');
    card.className = 'card-filme' + (favoritado ? ' favoritado' : '');
    card.dataset.id = filme.id;

    card.innerHTML = `
        <div class="card-filme-poster">
            <img src="${filme.imagem}" alt="Pôster do filme ${filme.titulo}">
            <button type="button" class="btn-favoritar" aria-pressed="${favoritado}" title="${favoritado ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}">${favoritado ? '★' : '☆'}</button>
        </div>
        <div class="card-filme-info">
            <h4>${filme.titulo}</h4>
            <p class="card-filme-meta">${filme.genero} • ${filme.ano} • ⭐ ${filme.nota}</p>
            <p class="card-filme-sinopse">${filme.sinopse}</p>
        </div>
    `;

    let botao = card.querySelector('.btn-favoritar');
    botao.addEventListener('click', function (event) {
        handleFavoritoClick(event, filme.id, botao);
    });

    return card;
}

function renderizarFilmes(filmes, containerId) {
    let container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';

    if (filmes.length === 0) {
        container.innerHTML = '<p class="lista-vazia">Nenhum filme encontrado.</p>';
        return;
    }

    filmes.forEach(filme => {
        container.appendChild(criarCardFilme(filme));
    });
}

function carregarFilmes(containerId) {
    fetch(FILMES_API_URL)
        .then(response => response.json())
        .then(filmes => {
            renderizarFilmes(filmes, containerId);
        })
        .catch(error => {
            console.error('Erro ao carregar filmes via API JSONServer:', error);
            let container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = '<p class="lista-vazia">Não foi possível carregar o catálogo agora.</p>';
            }
        });
}

// Observação: a chamada de inicialização (carregarFilmes) é feita
// explicitamente por cada página que utiliza este script (ex.: index.html),
// pois a página "favoritos.html" reaproveita as funções acima mas com uma
// lógica de carregamento diferente (filtrando apenas os favoritos).

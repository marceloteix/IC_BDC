
// Função para verificar se o usuário está logado e a contribuição está em dia
function verificarLoginEContribuicao() {
    try {
        var loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

        if (!loggedInUser) {
            console.log('Usuário não está logado, redirecionando para a página de login.');
            if (window.location.pathname !== '/login.html') {
                window.location.href = '/login.html'; // Atualize o caminho se necessário
            }
        } else if (!loggedInUser.contribuicao) {
            console.log('Contribuição pendente, redirecionando para a página de usuário.');
            if (window.location.pathname !== '/usuario.html') {
                window.location.href = '/aviso.html'; // Atualize o caminho se necessário
            }
        } else {
            console.log('Usuário está logado e com contribuição em dia.');
        }
    } catch (error) {
        console.error('Erro ao verificar login e contribuição: ', error);
    }
}

// Chamar a função de verificação no carregamento
verificarLoginEContribuicao();

// Verificar login e carregar os dados dos produtos se o usuário estiver com contribuição em dia
if (JSON.parse(localStorage.getItem('loggedInUser')) && JSON.parse(localStorage.getItem('loggedInUser')).contribuicao) {
    fetch('js/backend.json')
        .then(response => response.json())
        .then(data => {
            console.log('Dados recebidos do backend:', data);
            // SALVAR OS DADOS VINDO DO BACKEND LOCALMENTE
            localStorage.setItem('produtos', JSON.stringify(data));
            console.log('Dados dos produtos salvos no localStorage');

            // Simular carregamento online
            setTimeout(() => {
                $("#produtos").empty();

                data.forEach(produto => {
                    var produtoHTML = `
                    <div class="item-card">
                        <a data-id="${produto.id}" href="#" class="item">
                            <div class="img-container">
                                <img src="${produto.imagem}">
                            </div>
                            <div class="nome-rating">
                                <span class="color-black">${produto.nome}</span>
                        </a>
                    </div>
                    `;

                    $("#produtos").append(produtoHTML);
                });

                $(".item").on('click', function () {
                    var id = $(this).attr('data-id');
                    localStorage.setItem('detalhe', id);
                    app.views.main.router.navigate('/detalhes/');
                });

            }, 500);
        })
        .catch(error => console.error('Erro ao fazer fetch dos dados: ' + error));

    // Verificar quantos itens tem dentro do carrinho
    setTimeout(() => {
        var carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
        $('.btn-cart').attr('data-count', carrinho.length);
    }, 300);
}

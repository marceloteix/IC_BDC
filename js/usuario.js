// Obter o usuário logado
var loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

if (loggedInUser) {
    // Exibir o nome, username e e-mail do usuário na página
    document.getElementById('userNome').textContent = loggedInUser.nome || 'Nome não disponível';
    document.getElementById('userUsername').textContent = loggedInUser.username || 'Username não disponível';
    document.getElementById('userEmail').textContent = loggedInUser.email || 'Email não disponível';

    // Verificar o status da contribuição e atualizar o botão
    var contribuicaoButton = document.getElementById('contribuicaoStatus');
    var avisoContribuicao = document.getElementById('avisoContribuicao');
    var itensEmprestadosBlock = document.getElementById('itensEmprestadosBlock');

    if (loggedInUser.contribuicao) {
        contribuicaoButton.textContent = 'Contribuição em Dia';
        contribuicaoButton.style.backgroundColor = 'green';
        contribuicaoButton.style.color = 'white';
        avisoContribuicao.style.display = 'none';
        itensEmprestadosBlock.style.display = 'block';
    } else {
        contribuicaoButton.textContent = 'Contribuição Pendente';
        contribuicaoButton.style.backgroundColor = 'red';
        contribuicaoButton.style.color = 'white';
        avisoContribuicao.style.display = 'block';
        itensEmprestadosBlock.style.display = 'none';
    }

    contribuicaoButton.addEventListener('click', function () {
        if (!loggedInUser.contribuicao) {
            app.dialog.alert('Sua contribuição está pendente. Por favor, regularize sua situação para continuar utilizando o serviço.', 'Contribuição Pendente');
        }
    });

    // Função para carregar itens emprestados específicos do usuário a partir do Supabase
    async function carregarItensEmprestados() {
        var emprestadosList = document.getElementById('emprestados-list');
        emprestadosList.innerHTML = '';

        // Buscar itens emprestados do banco de dados Supabase
        const { data: emprestados, error } = await supabase
            .from('itensEmprestados')
            .select('*')
            .eq('nomeCompleto', loggedInUser.nome);

        if (error) {
            console.error('Erro ao buscar itens do Supabase:', error.message);
            emprestadosList.innerHTML = '<li class="item-content"><div class="item-inner"><div class="item-title">Erro ao carregar itens emprestados.</div></div></li>';
            return;
        }

        if (emprestados.length === 0) {
            emprestadosList.innerHTML = '<li class="item-content"><div class="item-inner"><div class="item-title">Nenhum item emprestado.</div></div></li>';
        } else {
            emprestados.forEach(item => {
                const itemHTML = `
                <li class="item">
                    <div class="item-content">
                        <div class="item-media">
                            <img src="${item.imagem}" width="120">
                        </div>
                        <div class="item-inner">
                            <div class="item-title">${item.nome}</div>
                            <div class="item-subtitle">
                                De: ${item.dataInicio ? item.dataInicio : 'Data de início não disponível'} 
                                Até: ${item.dataFim ? item.dataFim : 'Data de fim não disponível'}
                            </div>
                        </div>
                    </div>
                    <div class="item-action">
                        <button class="devolver-btn" data-id="${item.id}">Devolver</button>
                    </div>
                </li>
                `;
                emprestadosList.insertAdjacentHTML('beforeend', itemHTML);
            });
        }
    }

    // Função para lidar com a ação de devolver
    function handleItemAction(event) {
        const target = event.target;

        if (target.classList.contains('devolver-btn')) {
            const id = parseInt(target.getAttribute('data-id'), 10);

            // Mostrar alerta de confirmação
            app.dialog.confirm('Tem certeza de que deseja devolver este item?', 'Confirmar Devolução', function () {
                // Código a ser executado se o usuário confirmar
                removeItem(id);
            });
        }
    }

    // Função para remover o item
    async function removeItem(id) {
        // Remover o item do banco de dados Supabase
        const { error } = await supabase
            .from('itensEmprestados')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Erro ao remover item do Supabase:', error.message);
        } else {
            console.log('Item removido do Supabase com sucesso');
            // Recarregar a lista de itens
            carregarItensEmprestados();
        }
    }

    // Adicionar ouvintes de eventos aos botões
    document.getElementById('emprestados-list').addEventListener('click', handleItemAction);

    // Inicializar a aba do usuário ao carregar a página
    carregarItensEmprestados();
} else {
    // Se não há um usuário logado, redirecionar para a página de login ou mostrar uma mensagem
    window.location.href = 'login.html'; // Ou qualquer outra ação apropriada
}

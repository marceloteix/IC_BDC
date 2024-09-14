// Função para buscar e exibir o item
async function buscarItem(id) {
    // Pegar os produtos do localStorage
    var produtos = JSON.parse(localStorage.getItem('produtos'));

    var item = produtos.find(produto => produto.id === id);

    if (item) {
        // Tem o item
        console.log('Produto encontrado: ', item);

        // Alimentar com os valores
        $("#imagem-detalhe").attr('src', item.imagem);
        $("#nome-detalhe").html(item.nome);
        $("#descricao-detalhe").html(item.descricao);

        var tabelaDetalhes = $("#tabdetalhes");
        tabelaDetalhes.empty(); // Limpar tabela antes de adicionar novos dados

        item.detalhes.forEach(detalhe => {
            var linha = `
            <tr>
                <td>${detalhe.NúmerodePatrimônio}</td>
            </tr>
            `;
            tabelaDetalhes.append(linha);
        });

        // Inicializar o botão "selecionar"
        await initBotaoSelecionar(id);
    } else {
        console.log('Produto não encontrado');
    }
}

// Função para verificar se o item está emprestado
async function isItemEmprestado(itemId) {
    try {
        const { data, error } = await supabase
            .from('itensEmprestados')
            .select('*')
            .eq('id', itemId);

        if (error) throw error;

        // Verifica se o item foi encontrado na lista de itens emprestados
        return data.length > 0;
    } catch (error) {
        console.error('Erro ao verificar item emprestado:', error.message);
        return false;
    }
}

// Inicializar o botão "selecionar"
async function initBotaoSelecionar(id) {
    if (await isItemEmprestado(id)) {
        $(".add-cart").addClass('indisponivel').text('Indisponível');
    } else {
        $(".add-cart").removeClass('indisponivel').text('Selecionar');
    }
}

// Função para adicionar ao carrinho
function adicionarAoCarrinho(item, quantidade) {
    var carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    var itemNoCarrinho = carrinho.find(c => c.item.id === item.id);

    if (itemNoCarrinho) {
        // Item já está no carrinho
        var toastCenter = app.toast.create({
            text: 'Este item já está no carrinho.',
            position: 'center',
            closeTimeout: 2000,
        });
        toastCenter.open();
    } else {
        carrinho.push({
            item: item,
            quantidade: quantidade,
            total_item: quantidade * item.preco
        });

        // Atualizar o localStorage do carrinho
        localStorage.setItem('carrinho', JSON.stringify(carrinho));

        var toastCenter = app.toast.create({
            text: `${item.nome} adicionado ao carrinho`,
            position: 'center',
            closeTimeout: 2000,
        });
        toastCenter.open();
    }
}

// Clique no botão "add-cart"
$(".add-cart").on('click', async function () {
    var id = parseInt(localStorage.getItem('detalhe'));
    var produtos = JSON.parse(localStorage.getItem('produtos'));
    var item = produtos.find(produto => produto.id === id);

    if (item) {
        if (await isItemEmprestado(id)) {
            var toastCenter = app.toast.create({
                text: 'Este item já está emprestado.',
                position: 'center',
                closeTimeout: 2000,
            });
            toastCenter.open();
        } else {
            // Adicionar ao carrinho
            adicionarAoCarrinho(item, 1);
        }
    }
});

// Inicializar a página ao carregar
$(document).ready(function () {
    var id = parseInt(localStorage.getItem('detalhe'));
    buscarItem(id);
});

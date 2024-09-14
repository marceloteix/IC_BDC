function converterParaData(dataStr) {
    if (dataStr.includes("-")) {
        return new Date(dataStr);
    }
    var partes = dataStr.split('/');
    var dia = parseInt(partes[0], 10);
    var mes = parseInt(partes[1], 10) - 1; 
    var ano = parseInt(partes[2], 10);
    return new Date(ano, mes, dia);
}

// Função para verificar se a data atual é posterior à data de devolução
function verificarInadimplencia(dataEmprestimo) {
    var dataDevolucao = converterParaData(dataEmprestimo);
    var dataAtual = new Date();
    return dataAtual > dataDevolucao;
}

// Função para renderizar itens emprestados
async function renderizarItensEmprestados() {
    try {
        // Remover o filtro pelo nome do usuário
        const { data: itensEmprestados, error } = await supabase
            .from('itensEmprestados')
            .select('*');  // Selecionar todos os itens emprestados, sem filtro

        if (error) throw error;

        if (itensEmprestados.length > 0) {
            $("#alugados-list").html(''); // Limpa a lista de itens

            itensEmprestados.forEach(item => {
                if (!item.dataInicio || !item.dataFim) {
                    console.error(`Erro: O item com ID ${item.id} está faltando dataInicio ou dataFim.`);
                    return;
                }

                var inadimplente = verificarInadimplencia(item.dataFim);

                var itemDiv = `
                <li class="item-content">
                    <div class="item-media">
                        <img src="${item.imagem}" width="120">
                    </div>
                    <div class="item-inner">
                        <div class="item-title">${item.nome}</div>
                        <div class="item-subtitle">Emprestado por: ${item.nomeCompleto}</div>
                        <div class="item-text">De: ${item.dataInicio} Até: ${item.dataFim}</div>
                        ${inadimplente ? '<button class="inadimplente-btn">Inadimplência</button>' : ''}
                    </div>
                </li>`;

                $("#alugados-list").append(itemDiv); // Adiciona o item à lista
            });

            // Adiciona um espaçador no final da lista
            var spacerDiv = `<li class="item-content" style="height: 50px;"></li>`;
            $("#alugados-list").append(spacerDiv);
        } else {
            $("#alugados-list").html('<li class="item-content"><div class="item-inner"><div class="item-title">Nenhum item emprestado.</div></div></li>');
        }
    } catch (error) {
        console.error('Erro ao carregar itens emprestados:', error.message);
        $("#alugados-list").html('<li class="item-content"><div class="item-inner"><div class="item-title">Erro ao carregar itens emprestados.</div></div></li>');
    }
}

$(document).ready(function() {
    renderizarItensEmprestados();
});

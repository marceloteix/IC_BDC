// Obtém o usuário logado
var loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

// Verifica se há itens no carrinho
var localCarrinho = localStorage.getItem('carrinho');
if (localCarrinho) {
    var carrinho = JSON.parse(localCarrinho);
    if (carrinho.length > 0) {
        // Renderiza o carrinho e soma os totais
        renderizarCarrinho();
        calcularTotal();
    } else {
        // Mostra o carrinho vazio
        carrinhoVazio();
    }
} else {
    // Mostra o carrinho vazio
    carrinhoVazio();
}

// Função para renderizar os itens no carrinho
function renderizarCarrinho() {
    // Esvazia a área dos itens
    $("#listaCarrinho").empty();

    // Percorre o carrinho e adiciona os itens à área
    $.each(carrinho, function (index, itemCarrinho) {
        var itemDiv = `
        <div class="item-carrinho">
            <div class="area-img">
                <img src="${itemCarrinho.item.imagem}">
            </div>
            <div class="area-details">
                <div class="sup">
                    <span class="name-prod">
                    ${itemCarrinho.item.nome}
                    </span>
                    <a data-index="${index}" class="delete-item" href="#">
                        <i class="mdi mdi-close"></i>
                    </a>
                </div>
                <div class="middle">
                    <span>${itemCarrinho.item.principal_caracteristica}</span>
                </div>
                <div class="count">
                    <!-- Botão "Selecionar Data" -->
                    <button class="selecionar-data" data-index="${index}">Selecionar Data</button>
                    <!-- Campo de input do Flatpickr (inicialmente oculto) -->
                    <div class="flatpickr-container" id="flatpickr-${index}" style="display: none;">
                        <input type="text" placeholder="Selecionar Data de Início e Fim">
                    </div>
                </div>
            </div>
        </div>
        `;

        // Adiciona o item ao carrinho
        $("#listaCarrinho").append(itemDiv);
    });

    // Lida com o clique no botão "Selecionar Data"
    $(".selecionar-data").click(function () {
        var index = $(this).data('index');
    
        var $flatpickrContainer = $(`#flatpickr-${index}`);
        if (!$flatpickrContainer.is(':visible')) {
            $flatpickrContainer.show();
    
            flatpickr(`#flatpickr-${index} input`, {
                locale: "pt",
                dateFormat: "d/m/y",  // Formato de dia/mês/ano
                minDate: "today",  // Data mínima é a data atual
                maxDate: new Date().fp_incr(2 * 30),  // Máximo de dois meses a partir da data atual
                mode: "range",  // Seleciona um intervalo de datas
                disableMobile: true, // Força o uso do Flatpickr em dispositivos móveis
                onChange: function(selectedDates, dateStr, instance) {
                    // Armazena a data de início e fim no localStorage com o formato d/m/y
                    localStorage.setItem('dataSelecionadaInicio-' + index, selectedDates[0].toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }));
                    localStorage.setItem('dataSelecionadaFim-' + index, selectedDates[1].toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }));
                }
            });
    
            // Focar automaticamente o input do Flatpickr
            document.querySelector(`#flatpickr-${index} input`).focus();
            document.querySelector(`#flatpickr-${index} input`)._flatpickr.open();
        }
    });
    

    // Lida com o clique no botão "Alugar"
    $("#botaoAlugar").click(function () {
        // Verifica se uma data foi selecionada
        var datasSelecionadas = [];
        $(".flatpickr-container input").each(function() {
            var dataInicio = localStorage.getItem('dataSelecionadaInicio-' + $(this).closest('.flatpickr-container').attr('id').split('-')[1]);
            var dataFim = localStorage.getItem('dataSelecionadaFim-' + $(this).closest('.flatpickr-container').attr('id').split('-')[1]);
            if (dataInicio && dataFim) {
                datasSelecionadas.push({inicio: dataInicio, fim: dataFim});
            }
        });

        if (datasSelecionadas.length !== carrinho.length) {
            // Se alguma data não foi selecionada, exibe uma mensagem de erro
            app.dialog.alert('Por favor, selecione uma data de início e fim para todos os itens antes de prosseguir.', 'Erro');
            return; // Encerra a execução da função
        }

        // Exibe o app.dialog para os termos do serviço
        app.dialog.confirm(
            'Você concorda com os termos do serviço?', // Mensagem do termo
            'Termos de Serviço', // Título do termo
            function () {
                // Usuário concordou com os termos
                localStorage.setItem('concordou', 'true');

                // Exibe a caixa de diálogo com as datas selecionadas para confirmação
                app.dialog.confirm(
                    'Datas selecionadas: ' + datasSelecionadas.map(d => `Início: ${d.inicio}, Fim: ${d.fim}`).join('; '), 
                    'Confirme o fim do empréstimo:',
                    function () {
                        // Usuário confirmou as datas

                        // Recupera o nome completo do usuário logado
                        var nomeCompleto = loggedInUser.nome;

                        // Recupera a lista de itens emprestados do localStorage
                        var itensEmprestados = JSON.parse(localStorage.getItem('itensEmprestados')) || [];

                        // Adiciona cada item do carrinho à lista de itens emprestados
                        $.each(carrinho, function (index, itemCarrinho) {
                            var itemEmprestado = {
                                id: itemCarrinho.item.id,
                                nome: itemCarrinho.item.nome,
                                imagem: itemCarrinho.item.imagem,
                                dataInicio: datasSelecionadas[index].inicio,
                                dataFim: datasSelecionadas[index].fim,
                                nomeCompleto: nomeCompleto // Usa o nome completo do usuário logado
                            };
                            itensEmprestados.push(itemEmprestado);
                        });

                        // Armazena a lista atualizada de itens emprestados no localStorage
                        localStorage.setItem('itensEmprestados', JSON.stringify(itensEmprestados));

                        // Limpa o carrinho e as datas temporárias
                        localStorage.removeItem('carrinho');
                        localStorage.removeItem('dataSelecionadaInicio');
                        localStorage.removeItem('dataSelecionadaFim');

                        // Exibe uma mensagem de sucesso
                        app.dialog.alert('Aluguel feito com sucesso.', 'Sucesso', function () {
                            // Recarrega a página
                            window.location.reload();
                        });
                    },
                    function () {
                        // Usuário cancelou a confirmação da data
                        app.dialog.alert('Volte e confirme as datas', 'Cancelado');
                    }
                );
            },
            function () {
                // Usuário não concordou com os termos
                app.dialog.alert('Você deve concordar com os termos do serviço para prosseguir.', 'Erro');
            }
        );
    });

    // Lida com o clique no botão "Remover Item"
    $(document).off('click', '.delete-item').on('click', '.delete-item', function () {
        var index = $(this).data('index');
        // Confirmação
        app.dialog.confirm('Tem certeza?', 'Remover', function () {
            // Remove item do carrinho
            carrinho.splice(index, 1);
            // Atualiza o carrinho com item removido
            localStorage.setItem('carrinho', JSON.stringify(carrinho));
            // Atualiza a página
            renderizarCarrinho();
            calcularTotal();
        });
    });

}

// Lida com o clique no botão "Esvaziar"
$(document).on('click', '#esvaziar', function (e) {
    e.preventDefault();

    // Confirmação
    app.dialog.confirm('Tem certeza que deseja esvaziar o carrinho?', 'Esvaziar Carrinho', function () {
        // Limpa o array de itens do carrinho
        carrinho = [];

        // Remove o carrinho do localStorage
        localStorage.removeItem('carrinho');

        // Atualiza a interface, mostrando que o carrinho está vazio
        renderizarCarrinho();
        calcularTotal();
        
    });
});


// Função para calcular o total do carrinho - função não implementada
function calcularTotal() {
    var totalCarrinho = 0;
    $.each(carrinho, function (index, itemCarrinho) {
        totalCarrinho += itemCarrinho.item.total_item;
    });
    // Mostrar o total
    $("#subtotal").html(totalCarrinho.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
}

// Função para mostrar o carrinho vazio
function carrinhoVazio() {
    // Esvaziar lista do carrinho
    $("#listaCarrinho").empty();

    // Esconder os itens de baixo, botão e totais
    $("#toolbarTotais").addClass('display-none');
    $("#toolbarCheckout").addClass('display-none');

    // Mostrar a animação do carrinho vazio
    $("#listaCarrinho").html(`
    <div class="text-align-center carrinho-vazio">
        <img width="300" src="img/empty.gif">  <!-- Restaurar a animação aqui -->
        <p>Seu carrinho está vazio!</p>
    </div>
    `);
}

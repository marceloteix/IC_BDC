const { createClient } = window.supabase; 
const supabaseUrl = 'informação pessoal exluida';
const supabaseKey = 'informação pessoal exluida';
const supabase = createClient(supabaseUrl, supabaseKey);

// Função para converter data do formato 'dd/mm/yyyy' para 'yyyy-mm-dd'
function converterData(data) {
    const partes = data.split('/');
    if (partes.length === 3) {
        const dia = partes[0].padStart(2, '0');
        const mes = partes[1].padStart(2, '0');
        const ano = partes[2];
        return `${ano}-${mes}-${dia}`; // Retorna no formato 'yyyy-mm-dd'
    }
    return null; // Retorna null se a data estiver inválida
}

    // Função para transferir itens emprestados para o banco de dados Supabase
    async function transferirItensEmprestados() {
    // Recupera os dados do localStorage
    let historico = JSON.parse(localStorage.getItem('itensEmprestados'));

    // Verifica se há dados
    if (!historico || historico.length === 0) {
        console.log('Histórico vazio, nada para transferir.');
        return;
    }

    for (const item of historico) {
        const dataInicioConvertida = converterData(item.dataInicio);
        const dataFimConvertida = converterData(item.dataFim);

        if (dataInicioConvertida && dataFimConvertida) {
            const { data, error } = await supabase
                .from('itensEmprestados')
                .upsert([{
                    id: item.id, 
                    nome: item.nome,
                    dataInicio: dataInicioConvertida,
                    dataFim: dataFimConvertida,
                    imagem: item.imagem,
                    nomeCompleto: item.nomeCompleto,
                }]);

            if (error) {
                console.error('Erro ao transferir para o Supabase:', error.message);
            } else {
                console.log('Item transferido para o Supabase:', data);
            }
        }
    }
}

// Função para transferir itens históricos para o banco de dados Supabase
async function transferirItensHistoricos() {
    // Recupera os dados do localStorage
    let historico = JSON.parse(localStorage.getItem('itensEmprestados'));

    // Verifica se há dados
    if (!historico || historico.length === 0) {
        console.log('Histórico vazio, nada para transferir.');
        return;
    }

    for (const item of historico) {
        const dataInicioConvertida = converterData(item.dataInicio);
        const dataFimConvertida = converterData(item.dataFim);

        if (dataInicioConvertida && dataFimConvertida) {
            const { data, error } = await supabase
                .from('historicoEmprestimos')
                .insert([{
                    id: item.id,
                    nome: item.nome,
                    dataInicio: dataInicioConvertida,
                    dataFim: dataFimConvertida,
                    imagem: item.imagem,
                    nomeCompleto: item.nomeCompleto,
                    timestamp: new Date().toISOString()
                }]);

            if (error) {
                console.error('Erro ao armazenar no histórico:', error.message);
            } else {
                console.log('Item armazenado no histórico com sucesso:', data);
            }
        }
    }
}

// Esperar até que o DOM esteja carregado
document.addEventListener('DOMContentLoaded', (event) => {
    // Chamar a função para transferir itens emprestados
    transferirItensEmprestados();
    // Chamar a função para transferir itens históricos
    transferirItensHistoricos();
});

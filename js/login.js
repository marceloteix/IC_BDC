document.addEventListener('DOMContentLoaded', function () {
    // Lidar com o envio do formulário de login
    document.getElementById('loginForm').addEventListener('submit', function (event) {
        event.preventDefault(); // Impedir o envio padrão do formulário

        // Obter os dados do formulário
        var username = document.getElementById('username').value;
        var password = document.getElementById('password').value;

        // Verificar as credenciais com o backendUsuarios.json
        fetch('js/backendUsuarios.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao acessar o backendUsuarios.json');
                }
                return response.json();
            })
            .then(data => {
                // Filtrar o usuário que corresponde às credenciais fornecidas
                var user = data.usuarios.find(user => user.username === username && user.password === password);

                if (user) {
                    // Se as credenciais estiverem corretas, armazena todas as informações do usuário
                    localStorage.setItem('loggedInUser', JSON.stringify(user));
                    window.location.href = 'index.html'; // Redirecionar para a tela do usuário
                } else {
                    // Se as credenciais estiverem incorretas
                    document.getElementById('message').textContent = 'Nome de usuário ou senha inválidos.';
                    document.getElementById('message').style.color = 'red';
                }
            })
            .catch(error => {
                // Exibir mensagem de erro
                document.getElementById('message').textContent = 'Erro ao verificar as credenciais.';
                document.getElementById('message').style.color = 'red';
                console.error('Erro ao buscar backendUsuarios.json:', error);
            });
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const btnEntrar = document.getElementById("btn-entrar");
    const modal = document.getElementById("modal-login");
    const modalContent = document.querySelector(".modal-content");
    const closeModal = document.querySelector(".close-modal");
    const loginForm = document.getElementById("login-form");

    // Exibe o modal ao clicar em "Entrar"
    btnEntrar.addEventListener("click", function () {
        modal.style.display = "flex";
        modalContent.style.display = "block";
    });

    // Fecha modal ao clicar no "X"
    closeModal.addEventListener("click", function () {
        modal.style.display = "none";
        modalContent.style.display = "none";
    });

    // Fecha o modal qnd clicar fora da caixa
    window.addEventListener("click", function (event) {
        if (event.target === modal) {
            modal.style.display = "none";
            modalContent.style.display = "none";
        }
    });

    // Simulação do login (autenticação básica)
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault(); // Evita recarregar a página

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        const btnSubmit = document.getElementById("btn-submit");

        // Desativa o botão e exibe a animação de loading
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = `<div class="loader"></div>`;

        // Simula tempo de carregamento (pode ser removido quando integrar com backend)
        setTimeout(() => {
            const userDB = {
                username: "admin",
                password: "123456"
            };
        
            if (username === userDB.username && password === userDB.password) {
                window.location.href = "/home/";
                // Redireciona para a página inicial
            } else {
                alert("Usuário ou senha incorretos.");
                btnSubmit.disabled = false;
                btnSubmit.classList.remove("loading");
                btnSubmit.innerHTML = "Entrar"; // Restaura o botão
            }
        }, 500); 
    });
});

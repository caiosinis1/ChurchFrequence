document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ aniversariantes.js carregado!");

    const monthSelect = document.getElementById("month-select");
    const birthdayList = document.getElementById("birthday-list");
    const prevButton = document.getElementById("prev-birthday");
    const nextButton = document.getElementById("next-birthday");

    let aniversariantes = [];
    let currentIndex = 0;
    const itemsPerPage = 5; // Quantidade de aniversariantes exibidos por vez

    /* 🔹 Função para carregar os aniversariantes do mês */
    function carregarAniversariantes(mes) {
        console.log(`🔄 Buscando aniversariantes para o mês: ${mes}`);

        fetch(`/listar_aniversariantes/?mes=${mes}`)
            .then(response => response.json())
            .then(data => {
                if (data.status === "sucesso") {
                    aniversariantes = data.aniversariantes;
                    console.log("📌 Aniversariantes recebidos:", aniversariantes);
                    currentIndex = 0;
                    atualizarListaAniversariantes();
                } else {
                    console.error("❌ Erro ao buscar aniversariantes:", data.mensagem);
                    birthdayList.innerHTML = "<p>Erro ao carregar aniversariantes.</p>";
                }
            })
            .catch(error => {
                console.error("❌ Erro na requisição:", error);
                birthdayList.innerHTML = "<p>Erro ao carregar aniversariantes.</p>";
            });
    }

    /* 🔹 Função para atualizar a exibição dos aniversariantes */
    function atualizarListaAniversariantes() {
        birthdayList.innerHTML = ""; // Limpa a lista antes de atualizar

        if (aniversariantes.length === 0) {
            birthdayList.innerHTML = "<p>Nenhum aniversariante</p>";
            prevButton.disabled = true;
            nextButton.disabled = true;
            return;
        }

        let endIndex = Math.min(currentIndex + itemsPerPage, aniversariantes.length);
        let exibidos = aniversariantes.slice(currentIndex, endIndex);

        exibidos.forEach(aniversariante => {
            let p = document.createElement("p");
            p.textContent = `${aniversariante.nome} - ${aniversariante.data_nascimento}`;
            birthdayList.appendChild(p);
        });

        prevButton.disabled = currentIndex === 0;
        nextButton.disabled = endIndex >= aniversariantes.length;
    }

    /* 🔹 Evento para mudar o mês selecionado */
    monthSelect.addEventListener("change", function () {
        let mesSelecionado = monthSelect.value.toLowerCase();
        carregarAniversariantes(mesSelecionado);
    });

    /* 🔹 Navegação entre aniversariantes */
    prevButton.addEventListener("click", function () {
        if (currentIndex > 0) {
            currentIndex -= itemsPerPage;
            atualizarListaAniversariantes();
        }
    });

    nextButton.addEventListener("click", function () {
        if (currentIndex + itemsPerPage < aniversariantes.length) {
            currentIndex += itemsPerPage;
            atualizarListaAniversariantes();
        }
    });

    // Carrega os aniversariantes do mês atual ao carregar a página
    let mesAtual = new Date().toLocaleString("pt-BR", { month: "long" }).toLowerCase();
    monthSelect.value = mesAtual;
    carregarAniversariantes(mesAtual);
});

document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ turmasGeral.js carregado!");

    let form = document.getElementById("turmas-form");

    if (!form) {
        console.error("❌ Formulário não encontrado!");
        return;
    }

    console.log("✅ Formulário encontrado:", form);


    /* 🔹 Função para carregar as turmas na tabela e no select */
    function carregarTurmas() {
        console.log("🔄 Rodando a função carregarTurmas()");

        fetch("/listar_turmas_completas/")
            .then(response => response.json())
            .then(data => {
                console.log("📌 Turmas recebidas:", data);

                let tabelaTurmas = document.getElementById("turmas-tabela-body");
                let selectTurma = document.getElementById("turma-selecionada");

                if (!tabelaTurmas || !selectTurma) {
                    console.error("❌ Elemento de tabela ou select não encontrado");
                    return;
                }

                // Limpa a tabela e o select antes de inserir novos dados
                tabelaTurmas.innerHTML = ""; 
                selectTurma.innerHTML = '<option value="">Selecione uma turma</option>';

                // Popula a tabela e o select
                data.turmas.forEach(turma => {
                    console.log(`🔹 Adicionando turma: ${turma.nome}`);

                    // Adiciona à tabela
                    let row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${turma.nome}</td>
                        <td>${turma.professores.join(", ")}</td>  <!-- Exibe os professores -->
                        <td>${turma.faixa_etaria_de} - ${turma.faixa_etaria_ate}</td>
                    `;
                    tabelaTurmas.appendChild(row);

                    // Adiciona ao select
                    let option = document.createElement("option");
                    option.value = turma.id;
                    option.textContent = turma.nome;
                    selectTurma.appendChild(option);
                });
            })
            .catch(error => console.error("❌ Erro ao buscar turmas:", error));
    }

  /* 🔹 Função para preencher os detalhes da turma no formulário de edição */
  function preencherDadosTurma(turmaId) {
    fetch(`/detalhar_turma/${turmaId}/`)
        .then(response => response.json())
        .then(data => {
            if (data.status === "sucesso") {
                let turma = data.turma;
                console.log("📌 Detalhes da turma recebidos:", turma);

                document.getElementById("turmas-nome").value = turma.nome;
                document.getElementById("turmas-faixa-de").value = turma.faixa_etaria_de;
                document.getElementById("turmas-faixa-ate").value = turma.faixa_etaria_ate;

                // Atualiza os professores responsáveis
                carregarProfessoresEdicao(turma.professores);
            } else {
                console.error("Erro ao buscar detalhes da turma:", data.mensagem);
            }
        })
        .catch(error => console.error("❌ Erro ao buscar turma:", error));
}

/* 🔹 Função para carregar professores e marcar os vinculados à turma */
function carregarProfessoresEdicao(professoresTurma) {
    fetch("/listar_professores/")
        .then(response => response.json())
        .then(data => {
            console.log("📌 Professores recebidos para edição:", data);

            let listaProfessores = document.getElementById("turmas-professores");

            if (!listaProfessores) {
                console.error("❌ Elemento #turmas-professores não encontrado");
                return;
            }

            listaProfessores.innerHTML = "";

            if (data.professores.length === 0) {
                listaProfessores.innerHTML = "<p>Nenhum professor cadastrado</p>";
            } else {
                data.professores.forEach(professor => {
                    let isChecked = professoresTurma.includes(professor.id) ? "checked" : "";

                    let label = document.createElement("label");
                    label.innerHTML = `<input type="checkbox" name="turmas-professor" value="${professor.id}" ${isChecked}> ${professor.nome}`;
                    listaProfessores.appendChild(label);
                });
            }
        })
        .catch(error => console.error("❌ Erro ao buscar professores:", error));
}

/* 🔹 Captura a mudança no select de turmas e preenche os dados no formulário */
document.getElementById("turma-selecionada")?.addEventListener("change", function () {
    let turmaId = this.value;
    if (turmaId) {
        preencherDadosTurma(turmaId);
    }
});

    /* 🔹 Atualizar turma */
    document.getElementById("turmas-form")?.addEventListener("submit", function (event) {
        event.preventDefault(); // Previne o recarregamento da página
        console.log("🛠 Evento de submit acionado!"); 
    
        let turmaId = document.getElementById("turma-selecionada").value;
        let nome = document.getElementById("turmas-nome").value.trim();
        let faixaEtariaDe = document.getElementById("turmas-faixa-de").value.trim();
        let faixaEtariaAte = document.getElementById("turmas-faixa-ate").value.trim();
        
        let professores = [];
        document.querySelectorAll("input[name='turmas-professor']:checked").forEach(checkbox => {
            professores.push(parseInt(checkbox.value));
        });
    
        console.log("📦 Dados enviados para atualização:", {
            id: turmaId,
            nome: nome,
            faixa_etaria_de: faixaEtariaDe,
            faixa_etaria_ate: faixaEtariaAte,
            professores: professores
        });
    
        // 🚨 Se algum dado estiver undefined ou vazio, interrompe a função
        if (!turmaId || !nome || !faixaEtariaDe || !faixaEtariaAte) {
            console.error("❌ Dados inválidos! Verifique os campos.");
            return;
        }
    
        console.log("📡 Enviando requisição para atualizar turma...");

fetch("/atualizar_turma/", {
    method: "POST",
    body: JSON.stringify({
        id: turmaId,
        nome: nome,
        faixa_etaria_de: faixaEtariaDe,
        faixa_etaria_ate: faixaEtariaAte,
        professores: professores
    }),
    headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]").value
    }
})
.then(response => {
    console.log("📡 Requisição enviada! Status:", response.status);
    return response.json();
})
.then(data => {
    console.log("✅ Resposta do servidor:", data);
    if (data.status === "sucesso") {
        Swal.fire("Sucesso!", "Turma atualizada com sucesso!", "success").then(() => {
            carregarTurmas();
        });
    } else {
        Swal.fire("Erro", data.mensagem, "error");
    }
})
.catch(error => console.error("❌ Erro ao atualizar turma:", error));
    });
    

    /* 🔹 Chama a função para carregar as turmas ao carregar a página */
    carregarTurmas();
});

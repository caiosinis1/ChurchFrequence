document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ professoresGeral.js carregado!");

    let professorSelecionadoId = null;

    /* 🔹 Função para carregar os professores na tabela */
    function carregarProfessores() {
        fetch("/listar_professores_geral/")
            .then(response => response.json())
            .then(data => {
                console.log("📌 Professores recebidos:", data);

                const tabelaBody = document.getElementById("professores-tabela-body");
                tabelaBody.innerHTML = ""; // Limpa a tabela antes de inserir novos dados

                data.professores.forEach(professor => {
                    let row = document.createElement("tr");

                    let turmas = professor.turmas.length > 0 ? professor.turmas.join(", ") : "Nenhuma turma";
                    let aniversario = professor.aniversario || "N/A";

                    row.innerHTML = `
                        <td>${professor.nome}</td>
                        <td>${turmas}</td>
                        <td>${aniversario}</td>
                        <td>
                            <button class="btn-excluir-professor" data-professor-id="${professor.id}">🗑️</button>
                        </td>
                    `;

                    // Adiciona evento de clique para carregar os dados no formulário de edição
                    row.addEventListener("click", function () {
                        preencherDadosProfessor(professor.id);
                    });

                    tabelaBody.appendChild(row);
                });
            })
            .catch(error => console.error("❌ Erro ao buscar professores:", error));
    }

    /* 🔹 Função para excluir professor */
    function excluirProfessor(professorId) {
        Swal.fire({
            title: "Tem certeza?",
            text: "Essa ação não pode ser desfeita!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Sim, excluir!",
            cancelButtonText: "Cancelar"
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`/excluir_professor/${professorId}/`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]").value
                    }
                })
                .then(response => response.json())
                .then(data => {
                    if (data.status === "sucesso") {
                        Swal.fire("Excluído!", data.mensagem, "success");
                        carregarProfessores();
                    } else {
                        Swal.fire("Erro!", data.mensagem, "error");
                    }
                })
                .catch(error => console.error("❌ Erro ao excluir professor:", error));
            }
        });
    }

    /* 🔹 Evento para clicar no botão de exclusão */
    document.addEventListener("click", function (event) {
        if (event.target.classList.contains("btn-excluir-professor")) {
            let professorId = event.target.dataset.professorId;
            excluirProfessor(professorId);
        }
    });

    /* 🔹 Função para preencher os detalhes do professor no formulário de edição */
    function preencherDadosProfessor(professorId) {
        fetch(`/detalhar_professor/${professorId}/`)
            .then(response => response.json())
            .then(data => {
                if (data.status === "sucesso") {
                    let professor = data.professor;
                    console.log("📌 Detalhes do professor recebidos:", professor);

                    professorSelecionadoId = professor.id;
                    document.getElementById("professores-nome").value = professor.nome;
                    
                    if (professor.data_nascimento) {
                        let dataFormatada = professor.data_nascimento.split("/").reverse().join("-");
                        document.getElementById("professores-aniversario").value = dataFormatada;
                    } else {
                        document.getElementById("professores-aniversario").value = "";
                    }

                    carregarTurmasProfessor(professor.turmas);
                } else {
                    console.error("Erro ao buscar detalhes do professor:", data.mensagem);
                }
            })
            .catch(error => console.error("❌ Erro ao buscar professor:", error));
    }

    /* 🔹 Função para carregar todas as turmas e marcar as do professor */
    function carregarTurmasProfessor(turmasProfessor) {
        fetch("/listar_turmas/")
            .then(response => response.json())
            .then(data => {
                console.log("📌 Turmas recebidas para professor:", data);

                let listaTurmas = document.getElementById("professores-turmas");
                listaTurmas.innerHTML = ""; // Limpa antes de carregar

                data.turmas.forEach(turma => {
                    let isChecked = turmasProfessor.includes(turma.id) ? "checked" : "";

                    let label = document.createElement("label");
                    label.innerHTML = `<input type="checkbox" name="professores-turma" value="${turma.id}" ${isChecked}> ${turma.nome}`;
                    listaTurmas.appendChild(label);
                });
            })
            .catch(error => console.error("❌ Erro ao buscar turmas:", error));
    }

    /* 🔹 Função para buscar professores e preencher sugestões */
    function buscarProfessores(termo) {
        fetch("/listar_professores_geral/")
            .then(response => response.json())
            .then(data => {
                let listaSugestoes = document.getElementById("professores-sugestoes");
                listaSugestoes.innerHTML = "";
                
                let resultados = data.professores.filter(prof => prof.nome.toLowerCase().includes(termo.toLowerCase()));

                if (resultados.length > 0) {
                    listaSugestoes.style.display = "block";

                    resultados.forEach(professor => {
                        let item = document.createElement("li");
                        item.textContent = professor.nome;
                        item.addEventListener("click", function () {
                            document.getElementById("professor-pesquisa").value = professor.nome;
                            listaSugestoes.style.display = "none";
                            preencherDadosProfessor(professor.id);
                        });
                        listaSugestoes.appendChild(item);
                    });
                } else {
                    listaSugestoes.style.display = "none";
                }
            })
            .catch(error => console.error("Erro ao buscar professores:", error));
    }

    /* 🔹 Captura a entrada na pesquisa */
    document.getElementById("professor-pesquisa")?.addEventListener("input", function () {
        let termo = this.value.trim();
        if (termo.length > 0) {
            buscarProfessores(termo);
        } else {
            document.getElementById("professores-sugestoes").style.display = "none";
        }
    });

    /* 🔹 Atualizar professor */
    document.getElementById("professores-form")?.addEventListener("submit", function (event) {
        event.preventDefault(); // Previne o recarregamento da página

        if (!professorSelecionadoId) {
            Swal.fire("Erro", "Selecione um professor para editar.", "error");
            return;
        }

        let nome = document.getElementById("professores-nome").value;
        let dataNascimento = document.getElementById("professores-aniversario").value;
        
        let turmas = [];
        document.querySelectorAll("input[name='professores-turma']:checked").forEach(checkbox => {
            turmas.push(parseInt(checkbox.value));
        });

        fetch("/atualizar_professor/", {
            method: "POST",
            body: JSON.stringify({
                id: professorSelecionadoId,
                nome: nome,
                data_nascimento: dataNascimento,
                turmas: turmas
            }),
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]").value
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === "sucesso") {
                Swal.fire("Sucesso!", "Professor atualizado com sucesso!", "success").then(() => {
                    carregarProfessores();
                });
            } else {
                Swal.fire("Erro", data.mensagem, "error");
            }
        })
        .catch(error => console.error("❌ Erro ao atualizar professor:", error));
    });

    /* 🔹 Fecha sugestões ao clicar fora */
    document.addEventListener("click", function (event) {
        let listaSugestoes = document.getElementById("professores-sugestoes");
        let inputPesquisa = document.getElementById("professor-pesquisa");

        if (!listaSugestoes.contains(event.target) && event.target !== inputPesquisa) {
            listaSugestoes.style.display = "none";
        }
    });

    /* 🔹 Chama a função para carregar os professores ao carregar a página */
    carregarProfessores();
});

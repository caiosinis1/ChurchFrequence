document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ alunosGeral.js carregado!");

    const inputPesquisa = document.getElementById("aluno-pesquisa");
    const sugestoesLista = document.getElementById("aluno-sugestoes");
    const filtroTurma = document.getElementById("filtro-turma");
    const prevPageBtn = document.getElementById("prev-page");
    const nextPageBtn = document.getElementById("next-page");
    const pageInfo = document.getElementById("page-info");
    let paginaAtual = 1;  // Página inicial

    function carregarTurmas() {
        fetch("/listar_turmas/")
            .then(response => response.json())
            .then(data => {
                console.log("📌 Turmas recebidas:", data);
    
                // Atualiza o filtro de turmas
                let filtroTurma = document.getElementById("filtro-turma");
                filtroTurma.innerHTML = '<option value="">Exibir Todos</option>';
    
                // Atualiza o select de turmas no formulário de edição
                let selectTurma = document.getElementById("alunos-turma");
                selectTurma.innerHTML = '<option value="">Selecione uma turma</option>';
    
                data.turmas.forEach(turma => {
                    let optionFiltro = document.createElement("option");
                    optionFiltro.value = turma.id;
                    optionFiltro.textContent = turma.nome;
                    filtroTurma.appendChild(optionFiltro);
    
                    let optionForm = document.createElement("option");
                    optionForm.value = turma.id;
                    optionForm.textContent = turma.nome;
                    selectTurma.appendChild(optionForm);
                });
            })
            .catch(error => console.error("❌ Erro ao buscar turmas:", error));
    }

    function carregarAlunos(turmaId = "", pagina = 1) {
        let url = `/listar_alunos/?pagina=${pagina}`;
        if (turmaId) {
            url += `&turma_id=${turmaId}`;
        }

        fetch(url)
            .then(response => response.json())
            .then(data => {
                let tabelaBody = document.getElementById("alunos-tabela-body");
                tabelaBody.innerHTML = "";

                data.alunos.forEach(aluno => {
                    let aniversario = aluno.aniversario !== "N/A" ? aluno.aniversario : "N/A";
                    let row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${aluno.nome}</td>
                        <td>${aluno.turma}</td>
                        <td>${aniversario}</td>
                        <td>${aluno.matricula}</td>
                        <td>
                            <button class="btn-excluir-aluno" data-aluno-id="${aluno.id}"> 🗑️ </button>
                        </td>
                    `;
                    tabelaBody.appendChild(row);
                });

                // Atualiza a paginação
                paginaAtual = data.pagina_atual;
                pageInfo.textContent = `Página ${paginaAtual} de ${data.total_paginas}`;

                prevPageBtn.disabled = paginaAtual === 1;
                nextPageBtn.disabled = paginaAtual === data.total_paginas;
            })
            .catch(error => console.error("❌ Erro ao buscar alunos:", error));
    }

    // Atualiza a lista quando uma nova turma for selecionada
    filtroTurma.addEventListener("change", function () {
        paginaAtual = 1;
        carregarAlunos(this.value, paginaAtual);
    });

    // Botão Anterior
    prevPageBtn.addEventListener("click", function () {
        if (paginaAtual > 1) {
            carregarAlunos(filtroTurma.value, --paginaAtual);
        }
    });

    // Botão Próximo
    nextPageBtn.addEventListener("click", function () {
        carregarAlunos(filtroTurma.value, ++paginaAtual);
    });
    


    // Buscar alunos ao digitar na pesquisa
    inputPesquisa.addEventListener("input", function () {
        const termo = this.value.trim().toLowerCase();
        sugestoesLista.innerHTML = "";

        if (termo.length > 0) {
            fetch(`/listar_alunos/?termo=${termo}`)
                .then(response => response.json())
                .then(data => {
                    sugestoesLista.innerHTML = "";

                    if (data.alunos.length > 0) {
                        sugestoesLista.style.display = "block";

                        // Ordenar: primeiro os nomes que **começam** com o termo, depois os que **contêm** o termo em outras posições
                        let alunosOrdenados = data.alunos.sort((a, b) => {
                            let nomeA = a.nome.toLowerCase();
                            let nomeB = b.nome.toLowerCase();

                            let comecaComA = nomeA.startsWith(termo) ? 0 : 1;
                            let comecaComB = nomeB.startsWith(termo) ? 0 : 1;

                            if (comecaComA !== comecaComB) {
                                return comecaComA - comecaComB; // Prioriza os que começam com o termo
                            }
                            return nomeA.localeCompare(nomeB); // Mantém a ordem alfabética dentro de cada grupo
                        });

                        alunosOrdenados.forEach(aluno => {
                            const item = document.createElement("li");
                            item.textContent = aluno.nome;
                            item.addEventListener("click", function () {
                                inputPesquisa.value = aluno.nome;
                                sugestoesLista.style.display = "none";
                                preencherDadosAluno(aluno.id);
                            });
                            sugestoesLista.appendChild(item);
                        });
                    } else {
                        sugestoesLista.style.display = "none";
                    }
                })
                .catch(error => console.error("Erro ao buscar alunos:", error));
        } else {
            sugestoesLista.style.display = "none";
        }
    });

    // Função para preencher os campos ao selecionar um aluno
    function preencherDadosAluno(alunoId) {
        fetch(`/detalhar_aluno/${alunoId}/`)
            .then(response => response.json())
            .then(data => {
                if (data.status === "sucesso") {
                    document.getElementById("alunos-nome").value = data.aluno.nome;
                    document.getElementById("alunos-data-nascimento").value = data.aluno.data_nascimento;
                    document.getElementById("alunos-turma").value = data.aluno.turma_id;
                    document.getElementById("aluno-id").value = alunoId; // Armazena o ID do aluno para atualização
                } else {
                    console.error("Erro ao buscar detalhes do aluno:", data.mensagem);
                }
            })
            .catch(error => console.error("Erro ao buscar detalhes do aluno:", error));
    }

    // Atualizar aluno
    document.getElementById("alunos-form")?.addEventListener("submit", function (event) {
        event.preventDefault(); // Previne o recarregamento da página
    
        let alunoId = document.getElementById("aluno-id")?.value;
        let nome = document.getElementById("alunos-nome").value;
        let dataNascimento = document.getElementById("alunos-data-nascimento").value;
        let turmaId = document.getElementById("alunos-turma").value;
    
        if (!alunoId) {
            Swal.fire("Erro", "Nenhum aluno selecionado para edição.", "error");
            return;
        }
    
        let dadosAtualizados = {
            id: alunoId,
            nome: nome,
            data_nascimento: dataNascimento,
            turma_id: turmaId
        };
    
        console.log("📌 Enviando atualização do aluno:", dadosAtualizados);
    
        fetch("/atualizar_aluno/", {
            method: "POST",
            body: JSON.stringify(dadosAtualizados),
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]").value
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log("✅ Resposta do servidor:", data);
            if (data.status === "sucesso") {
                Swal.fire("Sucesso!", "Aluno atualizado com sucesso!", "success").then(() => {
                    carregarAlunos(); // Recarrega a lista para refletir os dados atualizados
                });
            } else {
                Swal.fire("Erro", data.mensagem, "error");
            }
        })
        .catch(error => console.error("❌ Erro ao atualizar aluno:", error));
    });

    // Função para excluir aluno
    function excluirAluno(alunoId) {
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
                fetch(`/excluir_aluno/${alunoId}/`, {
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
                        carregarAlunos();
                    } else {
                        Swal.fire("Erro!", data.mensagem, "error");
                    }
                })
                .catch(error => console.error("❌ Erro ao excluir aluno:", error));
            }
        });
    }

    // Evento para capturar clique no botão de exclusão
    document.addEventListener("click", function (event) {
        console.log('ola')
        if (event.target.classList.contains("btn-excluir-aluno")) {
            let alunoId = event.target.dataset.alunoId;
            excluirAluno(alunoId);
        }
    });

    // Ocultar sugestões ao clicar fora
    document.addEventListener("click", function (e) {
        if (!inputPesquisa.contains(e.target) && !sugestoesLista.contains(e.target)) {
            sugestoesLista.style.display = "none";
        }
    });

    // Chama a função para carregar as turmas e alunos ao iniciar a página
    carregarTurmas();
    carregarAlunos();
});

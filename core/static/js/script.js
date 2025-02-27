//CODIGOS DE REQUISICAO E RESPOSTA PARA CADASTRO
function getCSRFToken() {
    return document.querySelector("[name=csrfmiddlewaretoken]").value;
}

document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ script.js carregado!");

    let form = document.getElementById("form-cadastro-turma");

    if (form) {
        console.log("✅ Formulário encontrado!");

        form.addEventListener("submit", function (event) {
            event.preventDefault(); // Evita o reload da página
            console.log("✅ Evento de submit acionado!");

            // Captura os dados do formulário
            let formData = new FormData(form);

            // Exibe os dados antes de enviar (para depuração)
            for (let pair of formData.entries()) {
                console.log(`${pair[0]}: ${pair[1]}`);
            }

            // Envia os dados via fetch
            fetch("/cadastrar_turma/", {
                method: "POST",
                body: formData
            })
            .then(response => {
                console.log("✅ Requisição enviada, aguardando resposta...");
                return response.json();
            })
            .then(data => {
                console.log("✅ Resposta do servidor recebida:", data);
                if (data.status === "sucesso") {
                    alert("Turma cadastrada com sucesso! Código: " + data.codigo);
                    window.location.reload();
                } else {
                    alert("Erro ao cadastrar: " + data.mensagem);
                }
            })
            .catch(error => console.error("❌ Erro na requisição:", error));
        });
    } else {
        console.error("❌ ERRO: Formulário não encontrado!");
    }
});

function carregarProfessores() {
    fetch("/listar_professores/")
        .then(response => response.json())
        .then(data => {
            console.log("📌 Professores recebidos:", data);

            let listaProfessores = document.getElementById("lista-professores");

            if (!listaProfessores) {
                console.error("❌ Elemento #lista-professores não encontrado");
                return;
            }

            // Limpa a lista antes de adicionar novos itens
            listaProfessores.innerHTML = "";

            if (data.professores.length === 0) {
                listaProfessores.innerHTML = "<p>Nenhum professor cadastrado</p>";
            } else {
                data.professores.forEach(professor => {
                    let label = document.createElement("label");
                    label.innerHTML = `<input type="checkbox" name="professor" value="${professor.id}"> ${professor.nome}`;
                    listaProfessores.appendChild(label);
                });
            }
        })
        .catch(error => console.error("❌ Erro ao buscar professores:", error));
}

/* 🔹 Dispara a função ao abrir o modal de cadastro de turma */
document.getElementById("abrir-modal-cadastro-turma")?.addEventListener("click", function () {
    carregarProfessores();
});

//PARTE DE ALUNOS

document.addEventListener("DOMContentLoaded", function () {
    console.log("script.js carregado!");

    let formAluno = document.getElementById("form-cadastro-aluno");

    if (formAluno) {
        console.log("Formulário de aluno encontrado!");

        formAluno.addEventListener("submit", function (event) {
            event.preventDefault();
            console.log("Evento de submit acionado!");

            let nomeAluno = document.getElementById("nome-aluno").value.trim();
            let dataNascimentoAluno = document.getElementById("data-nascimento-aluno").value;
            let turmaSelecionada = document.getElementById("turma").value;

            if (!nomeAluno || !dataNascimentoAluno) {
                Swal.fire({
                    icon: "error",
                    title: "Erro no cadastro",
                    text: "Nome e data de nascimento são obrigatórios.",
                    confirmButtonText: "Entendi",
                });
                return;
            }

            let formData = new FormData(formAluno);

            console.log("🔍 Turma selecionada:", turmaSelecionada);

            if (!turmaSelecionada) {
                Swal.fire({
                    icon: "error",
                    title: "Erro no cadastro",
                    text: "Nenhuma turma selecionada. Escolha uma turma antes de cadastrar o aluno.",
                    confirmButtonText: "Entendi",
                });
                return;
            }

            formData.append("nome-aluno", nomeAluno);
            formData.append("data-nascimento-aluno", dataNascimentoAluno);
            formData.append("turma", turmaSelecionada);

            fetch("/cadastrar_aluno/", {
                method: "POST",
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                console.log("Resposta do servidor recebida:", data);
                
                if (data.status === "sucesso") {
                    Swal.fire({
                        title: "Aluno cadastrado!",
                        text: `Matrícula: ${data.matricula}`,
                        icon: "success",
                        confirmButtonColor: "#3085d6",
                        confirmButtonText: "OK"
                    }).then(() => {
                        window.location.reload();
                    });
                } else {
                    Swal.fire({
                        title: "Erro no cadastro",
                        text: data.mensagem,
                        icon: "error",
                        confirmButtonColor: "#d33",
                        confirmButtonText: "Entendi"
                    });
                }
            })
            .catch(error => {
                console.error("Erro na requisição:", error);
                Swal.fire({
                    title: "Erro inesperado",
                    text: "Ocorreu um erro inesperado. Tente novamente mais tarde.",
                    icon: "error",
                    confirmButtonColor: "#d33",
                    confirmButtonText: "Fechar"
                });
            });
        });
    }
});


document.addEventListener("DOMContentLoaded", function () {
    function carregarTurmas() {
        fetch("/listar_turmas/")
            .then(response => response.json())
            .then(data => {
                console.log("📌 Turmas recebidas:", data);
                
                let selectTurma = document.getElementById("turma");

                if (!selectTurma) {
                    console.error("❌ Erro: Select de turmas não encontrado!");
                    return;
                }

                selectTurma.innerHTML = '<option value="">-- Escolha uma turma --</option>'; 

                if (data.turmas.length === 0) {
                    selectTurma.innerHTML += '<option value="" disabled>Nenhuma turma cadastrada</option>';
                } else {
                    data.turmas.forEach(turma => {
                        let option = document.createElement("option");
                        option.value = turma.id;
                        option.textContent = turma.nome;
                        selectTurma.appendChild(option);
                    });
                }
            })
            .catch(error => console.error("Erro ao buscar turmas:", error));
    }

    // Aciona o carregamento de turmas ao abrir o modal
    document.getElementById("abrir-modal-cadastro-aluno")?.addEventListener("click", function () {
        console.log("📌 Modal de aluno aberto, carregando turmas...");
        carregarTurmas();
    });

    // Garante que as turmas sejam carregadas também ao iniciar a página
    carregarTurmas();
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//PARTE DOS PROFESSORES

document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ script.js carregado!");

    let formProfessor = document.getElementById("form-cadastro-professor");

    if (formProfessor) {
        console.log("✅ Formulário de professor encontrado!");

        formProfessor.addEventListener("submit", function (event) {
            event.preventDefault();
            console.log("✅ Evento de submit acionado!");

            let formData = new FormData(formProfessor);
            console.log("📌 Dados do formulário antes do envio:", Object.fromEntries(formData));

            fetch("/cadastrar_professor/", {
                method: "POST",
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                console.log("✅ Resposta do servidor recebida:", data);

                if (data.status === "sucesso") {
                    Swal.fire({
                        title: "Professor cadastrado!",
                        text: `Matrícula: ${data.matricula}`,
                        icon: "success",
                        confirmButtonColor: "#3085d6",
                        confirmButtonText: "OK"
                    }).then(() => {
                        window.location.reload();
                    });
                } else {
                    Swal.fire({
                        title: "Erro no cadastro",
                        text: data.mensagem,
                        icon: "error",
                        confirmButtonColor: "#d33",
                        confirmButtonText: "Entendi"
                    });
                }
            })
            .catch(error => {
                console.error("❌ Erro na requisição:", error);
                Swal.fire({
                    title: "Erro inesperado",
                    text: "Ocorreu um erro inesperado. Tente novamente mais tarde.",
                    icon: "error",
                    confirmButtonColor: "#d33",
                    confirmButtonText: "Fechar"
                });
            });
        });
    }

    // Função para carregar turmas no modal de professores
    function carregarTurmasProfessor() {
        fetch("/listar_turmas/")
            .then(response => response.json())
            .then(data => {
                console.log("📌 Turmas recebidas para professor:", data);

                let container = document.getElementById("turmas-professor");
                container.innerHTML = "";

                if (data.turmas.length === 0) {
                    container.innerHTML = "<p>Nenhuma turma cadastrada</p>";
                } else {
                    data.turmas.forEach(turma => {
                        let label = document.createElement("label");
                        label.innerHTML = `<input type="checkbox" name="turma-professor" value="${turma.id}"> ${turma.nome}`;
                        container.appendChild(label);
                    });
                }
            })
            .catch(error => console.error("❌ Erro ao buscar turmas:", error));
    }

    // Dispara o carregamento das turmas ao abrir o modal
    document.getElementById("abrir-modal-cadastro-professor")?.addEventListener("click", function () {
        carregarTurmasProfessor();
    });

    // Lógica para fechar o modal corretamente
    document.getElementById("fechar-modal-cadastro-professor")?.addEventListener("click", function () {
        document.getElementById("modal-cadastro-professor").style.display = "none";
    });

    window.addEventListener("click", function (event) {
        if (event.target === document.getElementById("modal-cadastro-professor")) {
            document.getElementById("modal-cadastro-professor").style.display = "none";
        }
    });
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////
//CODIGO PARA OBTER OS TOTAIS E MOSTRAR NOS CARDS DA HOME

document.addEventListener("DOMContentLoaded", function () {
    function carregarTotais() {
        fetch("/obter_totais/")
            .then(response => response.json())
            .then(data => {
                console.log("📊 Totais recebidos:", data);

                document.getElementById("total-professores").textContent = data.total_professores;
                document.getElementById("total-alunos").textContent = data.total_alunos;
                document.getElementById("total-turmas").textContent = data.total_turmas;
            })
            .catch(error => console.error("❌ Erro ao buscar totais:", error));
    }

    carregarTotais();
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////


document.getElementById('menu-toggle').addEventListener('click', function() {
    document.getElementById('nav-links').classList.toggle('active');
});


// JS DOS DROPDOWNS NO MENU
document.querySelectorAll('.dropdown > a').forEach(dropdown => {
    dropdown.addEventListener('click', function(event) {
        event.preventDefault();
        const menu = this.nextElementSibling;

        if (menu.classList.contains('show')) {
            menu.classList.remove('show');
        } else {
            document.querySelectorAll('.dropdown-menu').forEach(otherMenu => {
                otherMenu.classList.remove('show');
            });

            menu.classList.add('show'); 
        }
    });
});

// Fecha o dropdown se clicar fora
window.addEventListener('click', function(event) {
    if (!event.target.closest('.dropdown')) {
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            menu.classList.remove('show');
        });
    }
});


// Fecha o dropdown se clicar fora
window.addEventListener('click', function(event) {
    if (!event.target.closest('.dropdown')) {
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            menu.classList.remove('show');
        });
    }
});

// JS DOS MODAIS DE CADASTRO
const modais = {
    turma: {
        abrir: 'abrir-modal-cadastro-turma',
        fechar: 'fechar-modal-cadastro-turma',
        modal: 'modal-cadastro-turma'
    },
    aluno: {
        abrir: 'abrir-modal-cadastro-aluno',
        fechar: 'fechar-modal-cadastro-aluno',
        modal: 'modal-cadastro-aluno'
    },
    professor: {
        abrir: 'abrir-modal-cadastro-professor',
        fechar: 'fechar-modal-cadastro-professor',
        modal: 'modal-cadastro-professor'
    }
};

// Garante que todos os modais iniciem fechados
window.addEventListener('DOMContentLoaded', () => {
    Object.values(modais).forEach(({ modal }) => {
        document.getElementById(modal).style.display = 'none';
    });
});

// Adiciona eventos de clique para abrir e fechar os modais
Object.values(modais).forEach(({ abrir, fechar, modal }) => {
    document.getElementById(abrir)?.addEventListener('click', function(event) {
        event.preventDefault();
        document.getElementById(modal).style.display = 'flex';
    });

    document.getElementById(fechar)?.addEventListener('click', function() {
        document.getElementById(modal).style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target === document.getElementById(modal)) {
            document.getElementById(modal).style.display = 'none';
        }
    });
});

//JS CARD DOS ANIVERSARIANTES
const aniversariantes = [
    { nome: "Ana Souza", data: "02/03" },
    { nome: "Carlos Lima", data: "05/03" },
    { nome: "Fernanda Oliveira", data: "10/03" },
    { nome: "Gabriel Santos", data: "12/03" },
    { nome: "Juliana Mendes", data: "18/03" },
    { nome: "Lucas Pereira", data: "22/03" },
    { nome: "Mariana Silva", data: "25/03" },
    { nome: "Rodrigo Costa", data: "28/03" },
];

let paginaAtual = 0;
const itensPorPagina = 5;
const birthdayList = document.getElementById("birthday-list");
const prevButton = document.getElementById("prev-birthday");
const nextButton = document.getElementById("next-birthday");

function atualizarAniversariantes() {
    birthdayList.innerHTML = "";
    const inicio = paginaAtual * itensPorPagina;
    const fim = inicio + itensPorPagina;
    const listaPaginada = aniversariantes.slice(inicio, fim);

    if (listaPaginada.length === 0) {
        birthdayList.innerHTML = "<p>Nenhum aniversariante</p>";
    } else {
        listaPaginada.forEach(pessoa => {
            const p = document.createElement("p");
            p.textContent = `${pessoa.nome} - ${pessoa.data}`;
            birthdayList.appendChild(p);
        });
    }

    prevButton.disabled = paginaAtual === 0;
    nextButton.disabled = fim >= aniversariantes.length;
}

prevButton.addEventListener("click", () => {
    if (paginaAtual > 0) {
        paginaAtual--;
        atualizarAniversariantes();
    }
});

nextButton.addEventListener("click", () => {
    if ((paginaAtual + 1) * itensPorPagina < aniversariantes.length) {
        paginaAtual++;
        atualizarAniversariantes();
    }
});

// Inicializa a lista de aniversariantes
atualizarAniversariantes();




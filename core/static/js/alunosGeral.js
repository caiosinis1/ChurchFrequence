// Lista de alunos simulada
const alunosLista = [
    "Ana Souza",
    "Carlos Lima",
    "Fernanda Oliveira",
    "Gabriel Santos",
    "Juliana Mendes",
    "Lucas Pereira",
    "Mariana Silva",
    "Rodrigo Costa"
];

// Elementos da busca
const inputPesquisa = document.getElementById("aluno-pesquisa");
const sugestoesLista = document.getElementById("aluno-sugestoes");

// Filtra sugestões conforme digitação
inputPesquisa.addEventListener("input", function() {
    const termo = this.value.toLowerCase();
    sugestoesLista.innerHTML = "";

    if (termo.length > 0) {
        const resultados = alunosLista.filter(aluno => aluno.toLowerCase().includes(termo));
        if (resultados.length > 0) {
            sugestoesLista.style.display = "block";
            resultados.forEach(aluno => {
                const item = document.createElement("li");
                item.textContent = aluno;
                item.addEventListener("click", function() {
                    inputPesquisa.value = aluno;
                    sugestoesLista.style.display = "none";
                });
                sugestoesLista.appendChild(item);
            });
        } else {
            sugestoesLista.style.display = "none";
        }
    } else {
        sugestoesLista.style.display = "none";
    }
});

// Oculta sugestões ao clicar fora
document.addEventListener("click", function(e) {
    if (!inputPesquisa.contains(e.target) && !sugestoesLista.contains(e.target)) {
        sugestoesLista.style.display = "none";
    }
});


// Lista de alunos fictícios
const alunosFicticios = [
    { matricula: "2024001", nome: "Ana Souza", turma: "Turma A", aniversario: "02/03" },
    { matricula: "2024002", nome: "Carlos Lima", turma: "Turma B", aniversario: "05/04" },
    { matricula: "2024003", nome: "Fernanda Oliveira", turma: "Turma C", aniversario: "10/05" },
    { matricula: "2024004", nome: "Gabriel Santos", turma: "Turma A", aniversario: "12/06" },
    { matricula: "2024005", nome: "Juliana Mendes", turma: "Turma B", aniversario: "18/07" },
    { matricula: "2024006", nome: "Lucas Pereira", turma: "Turma C", aniversario: "22/08" },
    { matricula: "2024007", nome: "Mariana Silva", turma: "Turma A", aniversario: "25/09" },
    { matricula: "2024008", nome: "Rodrigo Costa", turma: "Turma B", aniversario: "28/10" }
];

// Preenchendo a tabela de alunos
function preencherTabelaAlunos() {
    const tabelaBody = document.getElementById("alunos-tabela-body");

    // Garante que a tabela comece vazia antes de preencher
    tabelaBody.innerHTML = "";

    alunosFicticios.forEach(aluno => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${aluno.nome}</td>
            <td>${aluno.turma}</td>
            <td>${aluno.aniversario}</td>
            <td>${aluno.matricula}</td>
        `;
        tabelaBody.appendChild(row);
    });
}

// Chamar a função ao carregar a página
document.addEventListener("DOMContentLoaded", preencherTabelaAlunos);
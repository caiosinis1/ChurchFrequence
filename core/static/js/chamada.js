// Simulando os alunos de cada turma
const alunosPorTurma = {
    turma1: ["Ana Souza", "Carlos Lima", "Fernanda Oliveira"],
    turma2: ["Gabriel Santos", "Juliana Mendes", "Lucas Pereira"],
    turma3: ["Mariana Silva", "Rodrigo Costa", "Paula Ribeiro"]
};

// Elementos da página de chamada
const selectTurmaChamada = document.getElementById("turma-selecionada");
const listaAlunosChamada = document.getElementById("lista-alunos-chamada");
const botaoSalvarPresenca = document.getElementById("salvar-presenca-chamada");

// Atualizar a lista de alunos ao selecionar a turma
selectTurmaChamada.addEventListener("change", () => {
    const turmaSelecionada = selectTurmaChamada.value;
    listaAlunosChamada.innerHTML = ""; // Limpa a lista

    if (turmaSelecionada && alunosPorTurma[turmaSelecionada]) {
        alunosPorTurma[turmaSelecionada].forEach(aluno => {
            const div = document.createElement("div");
            div.classList.add("aluno-item-chamada");
            div.innerHTML = `<input type="checkbox" name="presenca-chamada" value="${aluno}"> ${aluno}`;
            listaAlunosChamada.appendChild(div);
        });
    } else {
        listaAlunosChamada.innerHTML = "<p>Selecione uma turma para exibir os alunos.</p>";
    }
});

// Simula o salvamento da presença
botaoSalvarPresenca.addEventListener("click", () => {
    const alunosPresentes = [];
    document.querySelectorAll('input[name="presenca-chamada"]:checked').forEach(checkbox => {
        alunosPresentes.push(checkbox.value);
    });

    if (alunosPresentes.length > 0) {
        alert(`Presença salva para: ${alunosPresentes.join(", ")}`);
    } else {
        alert("Nenhum aluno foi marcado como presente.");
    }
});

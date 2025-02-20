document.addEventListener("DOMContentLoaded", function () {
    const turmaSelect = document.getElementById("turma-selecionada");
    const mesSelect = document.getElementById("mes-selecionado");
    const anoSelect = document.getElementById("ano-selecionado");
    const domingoSelect = document.getElementById("domingo-selecionado");
    const listaAlunos = document.getElementById("lista-alunos-chamada");
    const botaoSalvar = document.getElementById("salvar-presenca-chamada");

    let graficoPresenca = null;

    // Carregar lista de turmas
    fetch("/listar_turmas/")
        .then(response => response.json())
        .then(data => {
            turmaSelect.innerHTML = '<option value="">Selecione uma turma</option>';
            data.turmas.forEach(turma => {
                let option = document.createElement("option");
                option.value = turma.id;
                option.textContent = turma.nome;
                turmaSelect.appendChild(option);
            });
        });

    // Preencher o select de anos (últimos 5 anos e o próximo ano)
    const anoAtual = new Date().getFullYear();
    for (let i = anoAtual - 5; i <= anoAtual + 1; i++) {
        let option = document.createElement("option");
        option.value = i;
        option.textContent = i;
        anoSelect.appendChild(option);
    }

    // Atualizar lista de domingos ao selecionar mês e ano
    function atualizarDomingos() {
        const mes = mesSelect.value;
        const ano = anoSelect.value;

        if (!mes || !ano) return;

        domingoSelect.innerHTML = '<option value="">Selecione um domingo</option>';
        let data = new Date(ano, mes - 1, 1);
        while (data.getMonth() == mes - 1) {
            if (data.getDay() == 0) { // Se for domingo
                let option = document.createElement("option");
                option.value = data.getDate();
                option.textContent = `Domingo ${data.getDate()}`;
                domingoSelect.appendChild(option);
            }
            data.setDate(data.getDate() + 1);
        }
    }

    mesSelect.addEventListener("change", atualizarDomingos);
    anoSelect.addEventListener("change", atualizarDomingos);

    // Carregar alunos ao selecionar todos os filtros
    function carregarAlunos() {
        const turmaId = turmaSelect.value;
        const mes = mesSelect.value;
        const ano = anoSelect.value;
        const domingo = domingoSelect.value;

        if (!turmaId || !mes || !ano || !domingo) {
            listaAlunos.innerHTML = "<p>Selecione todos os campos para exibir os alunos.</p>";
            return;
        }

        fetch(`/listar_presenca/?turma=${turmaId}&mes=${mes}&ano=${ano}&domingo=${domingo}`)
            .then(response => response.json())
            .then(data => {
                if (data.status === "erro") {
                    listaAlunos.innerHTML = "<p>Nenhum aluno encontrado.</p>";
                    return;
                }

                let listaHtml = "";
                data.alunos.forEach(aluno => {
                    listaHtml += `<label>
                                    <input type='checkbox' class='presenca-checkbox' 
                                           data-aluno-id='${aluno.id}' ${aluno.presente ? "checked" : ""}> 
                                    ${aluno.nome}
                                  </label><br>`;
                });
                listaAlunos.innerHTML = listaHtml;
                atualizarGrafico(data.presentes, data.faltantes);
            })
            .catch(error => console.error("Erro ao buscar alunos:", error));
    }

    // Atualizar gráfico de presença
    function atualizarGrafico(presentes, ausentes) {
        const ctx = document.getElementById("graficoPresenca").getContext("2d");
    
        // Destroi o gráfico anterior, se existir
        if (window.graficoPresenca) {
            window.graficoPresenca.destroy();
        }
    
        // Cria um novo gráfico
        window.graficoPresenca = new Chart(ctx, {
            type: "doughnut",
            data: {
                labels: ["Presentes", "Faltantes"],
                datasets: [{
                    data: [presentes, ausentes],
                    backgroundColor: ["#4CAF50", "#FF4C4C"],
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: "bottom" }
                }
            }
        });
    }

    // Evento de mudança para carregar alunos ao selecionar turma, mês, ano e domingo
    turmaSelect.addEventListener("change", carregarAlunos);
    mesSelect.addEventListener("change", carregarAlunos);
    anoSelect.addEventListener("change", carregarAlunos);
    domingoSelect.addEventListener("change", carregarAlunos);

    // Ajustes no layout
    window.addEventListener("load", () => {
        document.querySelector(".chamada-container").style.display = "flex";
        document.querySelector(".chamada-container").style.justifyContent = "center";
        document.querySelector(".chamada-container").style.alignItems = "center";
        document.querySelector(".chamada-container").style.gap = "30px";
    });

    // Salvar presença
    botaoSalvar.addEventListener("click", function () {
        console.log("✅ Botão Salvar Presença foi CLICADO!");
    
        const turmaId = turmaSelect.value;
        const mes = mesSelect.value;
        const ano = anoSelect.value;
        const domingo = domingoSelect.value;
        const presencas = [];

        document.querySelectorAll(".presenca-checkbox").forEach(input => {
            presencas.push({ 
                aluno_id: parseInt(input.dataset.alunoId), // CORRIGIDO: Agora está pegando aluno_id corretamente
                presente: input.checked 
            });
        });
    
        console.log("🔎 Verificação antes do envio:");
        console.log("Turma:", turmaId);
        console.log("Mês:", mes);
        console.log("Ano:", ano);
        console.log("Domingo:", domingo);
        console.log("Presenças:", presencas);
    
        if (!turmaId || !mes || !ano || !domingo || presencas.length === 0) {
            Swal.fire({
                icon: "error",
                title: "Dados incompletos!",
                text: "Preencha todos os campos e marque ao menos um aluno."
            });
            return;
        }
    
        console.log("📤 Enviando requisição para salvar presença...");
    
        fetch("/salvar_presenca/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                turma_id: parseInt(turmaId), 
                mes: parseInt(mes), 
                ano: parseInt(ano), 
                domingo: parseInt(domingo), 
                presencas 
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log("✅ Resposta do servidor:", data);
            Swal.fire({
                icon: data.status === "sucesso" ? "success" : "error",
                title: data.mensagem
            });
            if (data.status === "sucesso") {
                carregarAlunos(); // Atualiza a lista e o gráfico
            }
        })
        .catch(error => console.error("❌ Erro ao salvar presença:", error));
    });

});

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
    
        let domingos = [];  // Lista para armazenar os domingos válidos
    
        while (data.getMonth() == mes - 1) {
            if (data.getDay() == 0) { // Se for domingo
                domingos.push(data.getDate());
            }
            data.setDate(data.getDate() + 1);
        }
    
        // Garante que estamos pegando apenas domingos existentes no mês
        domingos.forEach((dia, index) => {
            let option = document.createElement("option");
            option.value = dia;
            option.textContent = `Domingo ${index + 1} (${dia}/${mes})`; // Melhor exibição
            domingoSelect.appendChild(option);
        });
    }

    mesSelect.addEventListener("change", atualizarDomingos);
    anoSelect.addEventListener("change", atualizarDomingos);

    // Carregar alunos ao selecionar todos os filtros
    

    // Atualizar gráfico de presença
    function atualizarGrafico(presentes, ausentes) {
        console.log("🔹 Atualizando gráfico: Presentes:", presentes, "Ausentes:", ausentes);
    
        const canvas = document.getElementById("graficoPresenca");
        const graficoContainer = document.querySelector(".grafico-card");
    
        if (!canvas) {
            console.error("❌ Canvas do gráfico não encontrado!");
            return;
        }
    
        // Garante que o gráfico está visível
        graficoContainer.style.display = "flex";
        canvas.style.display = "block";
        canvas.style.opacity = "1";
    
        const ctx = canvas.getContext("2d");
    
        // Remove gráfico anterior, se existir
        if (window.graficoPresenca && typeof window.graficoPresenca.destroy === "function") {
            console.log("🗑️ Removendo gráfico antigo...");
            window.graficoPresenca.destroy();
        }
    
        console.log("📊 Criando novo gráfico...");
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
    
        console.log("✅ Gráfico atualizado com sucesso!");
    }

    
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
                console.log("📊 Dados recebidos da API para o gráfico:", {
                    presentes: data.presentes,
                    ausentes: data.faltantes
                });
                atualizarGrafico(data.presentes, data.faltantes);
            })
            .catch(error => console.error("Erro ao buscar alunos:", error));
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
                aluno_id: parseInt(input.dataset.alunoId), 
                presente: input.checked 
            });
        });
    
        console.log("🔎 Verificação antes do envio:");
        console.log({ turmaId, mes, ano, domingo, presencas });
    
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
                carregarAlunos();
            }
        })
        .catch(error => console.error("❌ Erro ao salvar presença:", error));
    });

    document.getElementById("btn-excluir-chamada").addEventListener("click", function () {
        console.log("🗑️ Botão de excluir chamada clicado!");
    
        const turmaId = turmaSelect.value;
        const mes = mesSelect.value;
        const ano = anoSelect.value;
        const domingo = domingoSelect.value;
    
        if (!turmaId || !mes || !ano || !domingo) {
            Swal.fire({
                icon: "error",
                title: "Erro!",
                text: "Selecione todos os filtros para excluir a chamada."
            });
            return;
        }
    
        // 🔹 Criar a data no formato YYYY-MM-DD
        let data_chamada = `${ano}-${mes.padStart(2, "0")}-${domingo.padStart(2, "0")}`;
    
        console.log("📅 Data formatada para exclusão:", data_chamada);
    
        Swal.fire({
            title: "Tem certeza?",
            text: "Essa ação excluirá a chamada desse dia!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Sim, excluir",
            cancelButtonText: "Cancelar"
        }).then((result) => {
            if (result.isConfirmed) {
                fetch("/excluir_chamada/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]").value
                    },
                    body: JSON.stringify({
                        turma_id: parseInt(turmaId),
                        data: data_chamada
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.status === "sucesso") {
                        Swal.fire("Excluído!", "A chamada foi removida com sucesso.", "success")
                            .then(() => window.location.reload());
                    } else {
                        Swal.fire("Erro!", data.mensagem, "error");
                    }
                })
                .catch(error => console.error("❌ Erro ao excluir chamada:", error));
            }
        });
    });
    
});

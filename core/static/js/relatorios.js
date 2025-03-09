document.addEventListener("DOMContentLoaded", function () {
    const turmaSelect = document.getElementById("turma-select");
    const periodoSelect = document.getElementById("periodo-select");
    const mesSelect = document.getElementById("mes-select");
    const anoSelect = document.getElementById("ano-select");
    const gerarRelatorioBtn = document.getElementById("gerar-relatorio");
    const semanasContainer = document.getElementById("semanas-container");
    const exportarPDFBtn = document.getElementById("exportar-pdf");
    const exportarCSVBtn = document.getElementById("exportar-csv");
    const relatorioContainer = document.getElementById("relatorios-container");

    document.addEventListener("DOMContentLoaded", function () {
        const anoAtual = new Date().getFullYear();
    
        if (anoSelect) {
            for (let i = 0; i < 5; i++) {
                let ano = anoAtual - i;
                let option = document.createElement("option");
                option.value = ano;
                option.textContent = ano;
                anoSelect.appendChild(option);
            }
        }
    });

    /* Exibir opções de semana quando "semanal" for selecionado */
    periodoSelect.addEventListener("change", function () {
        if (periodoSelect.value === "semanal") {
            semanasContainer.style.display = "block";
        } else {
            semanasContainer.style.display = "none";
        }
    });

    /* 🔹 Carregar Turmas no Select */
    function carregarTurmas() {
        fetch("/listar_turmas/")
            .then(response => response.json())
            .then(data => {
                console.log("📌 Turmas recebidas:", data);

                if (!turmaSelect) {
                    console.error("❌ Erro: Select de turmas não encontrado!");
                    return;
                }

                // Adiciona opção padrão "Todas as Turmas"
                turmaSelect.innerHTML = '<option value="">Todas as Turmas</option>';

                if (!data.turmas || data.turmas.length === 0) {
                    console.warn("⚠️ Nenhuma turma cadastrada.");
                } else {
                    data.turmas.forEach(turma => {
                        let option = document.createElement("option");
                        option.value = turma.id;
                        option.textContent = turma.nome;
                        turmaSelect.appendChild(option);
                    });
                }
            })
            .catch(error => console.error("❌ Erro ao carregar turmas:", error));
    }

    /* 🔹 Gerar Relatório */
    function carregarRelatorio() {
        const turma = turmaSelect.value || "";
        const periodo = periodoSelect.value || "mensal";
        const mes = mesSelect.value || new Date().getMonth() + 1;
        const ano = anoSelect.value || new Date().getFullYear();
        let semana = "";
    
        if (periodo === "semanal") {
            const semanaSelecionada = document.querySelector('input[name="semana"]:checked');
            if (semanaSelecionada) {
                semana = semanaSelecionada.value;
            } else {
                alert("Selecione uma semana antes de gerar o relatório semanal!");
                return;
            }
        }
    
        fetch(`/gerar_relatorio/?turma=${turma}&periodo=${periodo}&mes=${mes}&ano=${ano}&semana=${semana}`)
            .then(response => response.json())
            .then(data => {
                if (data.status === "sucesso") {
                    exibirRelatorio(data.dados);
                } else {
                    alert("Erro ao gerar relatório: " + data.mensagem);
                }
            })
            .catch(error => console.error("Erro ao gerar relatório:", error));
    }


    /* 🔹 Exibir Relatório na Tabela */
    function formatarData(dataISO) {
        let partes = dataISO.split("-");
        return `${partes[2]}/${partes[1]}/${partes[0]}`; // Converte "YYYY-MM-DD" para "DD/MM/YYYY"
    }
    
    function exibirRelatorio(dados) {
        console.log("📊 Exibindo relatório com dados:", dados);
    
        const tabelaBody = document.getElementById("tabela-relatorio-body");
    
        if (!dados || dados.length === 0) {
            tabelaBody.innerHTML = `<tr><td colspan="4">Nenhum dado disponível</td></tr>`;
            return;
        }
    
        // Limpa a tabela antes de adicionar os novos dados
        tabelaBody.innerHTML = "";
    
        dados.forEach(linha => {
            let dataFormatada = linha.data; // Certifique-se de que a data já veio formatada do backend
    
            if (!dataFormatada || dataFormatada.includes("undefined")) {
                console.error("❌ Erro na data recebida:", linha.data);
                dataFormatada = "Data Inválida"; // Previne que "undefined/undefined/..." apareça
            }
    
            let row = `
                <tr>
                    <td>${dataFormatada}</td>
                    <td>${linha.turma || linha.turma_nome || linha["turma__nome"] || "Não Informado"}</td>
                    <td>${linha.presentes}</td>
                    <td>${linha.faltantes}</td>
                </tr>
            `;
            tabelaBody.innerHTML += row;
        });
    }

    /* 🔹 Exportar Relatório (Corrigido para incluir Ano e Semana) */
    function exportarRelatorio(formato) {
        const turma = turmaSelect.value;
        const periodo = periodoSelect.value;
        const mes = mesSelect.value;
        const ano = anoSelect.value;
        let semana = "";

        if (periodo === "semanal") {
            const semanaSelecionada = document.querySelector('input[name="semana"]:checked');
            if (semanaSelecionada) {
                semana = semanaSelecionada.value;
            }
        }

        window.location.href = `/exportar_${formato}/?turma=${turma}&periodo=${periodo}&mes=${mes}&ano=${ano}&semana=${semana}`;
    }

    exportarPDFBtn.addEventListener("click", function () {
        exportarRelatorio("pdf");
    });



    /* 🔹 Inicializa o carregamento de turmas e anos */
    carregarTurmas();

    /* 🔹 Evento para gerar relatório */
    gerarRelatorioBtn.addEventListener("click", carregarRelatorio);
});

document.addEventListener("DOMContentLoaded", function () {
    const ctx = document.getElementById("grafico")?.getContext("2d");
    const monthSelect = document.getElementById("month-select");

    let attendanceChart = null;

    function atualizarGrafico(mes, ano) {
        console.log(`🔄 Carregando presença para ${mes}/${ano}`);

        fetch(`/obter_presenca_mensal/?mes=${mes}&ano=${ano}`)
            .then(response => response.json())
            .then(data => {
                if (data.status !== "sucesso") {
                    console.error("❌ Erro ao buscar presença:", data.mensagem);
                    return;
                }

                console.log("📊 Dados recebidos da API:", data.presencas);

                data.presencas.sort((a, b) => a.domingo.localeCompare(b.domingo, undefined, { numeric: true }));

                const labels = data.presencas.map(item => item.domingo);
                const valoresPresentes = data.presencas.map(item => item.presentes);
                const valoresAusentes = data.presencas.map(item => item.ausentes ?? 0);

                console.log("📌 Labels geradas:", labels);
                console.log("📌 Valores Presentes:", valoresPresentes);
                console.log("📌 Valores Ausentes:", valoresAusentes);

                if (attendanceChart !== null) {
                    console.log("🛠️ Destruindo gráfico antigo...");
                    attendanceChart.destroy();
                }

                attendanceChart = new Chart(ctx, {
                    type: "bar",
                    data: {
                        labels: labels,
                        datasets: [
                            {
                                label: "Presentes",
                                data: valoresPresentes,
                                backgroundColor: "rgb(46, 119, 46)",
                                borderColor: "rgb(41, 121, 41)",
                                borderWidth: 1
                            },
                            {
                                label: "Ausentes",
                                data: valoresAusentes,
                                backgroundColor: "rgb(172, 51, 77)",
                                borderColor: "rgb(133, 29, 51)",
                                borderWidth: 1
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        animation: {
                            duration: 1500,
                            easing: "easeOutBounce"
                        },
                        scales: {
                            x: {
                                ticks: {
                                    font: {
                                        size: window.innerWidth <= 600 ? 10 : 14
                                    }
                                }
                            },
                            y: {
                                ticks: {
                                    beginAtZero: true,
                                    font: {
                                        size: window.innerWidth <= 600 ? 10 : 14
                                    }
                                }
                            }
                        },
                        plugins: {
                            legend: {
                                labels: {
                                    font: {
                                        size: window.innerWidth <= 600 ? 10 : 14
                                    }
                                }
                            },
                            tooltip: {
                                titleFont: {
                                    size: window.innerWidth <= 600 ? 10 : 14
                                },
                                bodyFont: {
                                    size: window.innerWidth <= 600 ? 10 : 14
                                },
                                callbacks: {
                                    title: function (tooltipItems) {
                                        return tooltipItems[0].label;
                                    },
                                    label: function (tooltipItem) {
                                        return `${tooltipItem.dataset.label}: ${tooltipItem.raw}`;
                                    }
                                }
                            }
                        }
                    }
                });

                console.log("✅ Gráfico atualizado com sucesso!");
            })
            .catch(error => console.error("❌ Erro ao carregar gráfico:", error));
    }

    monthSelect.addEventListener("change", function () {
        const mesSelecionado = monthSelect.value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const anoAtual = new Date().getFullYear();

        const mesesDict = {
            "janeiro": 1, "fevereiro": 2, "marco": 3, "março": 3, "abril": 4, "maio": 5, "junho": 6,
            "julho": 7, "agosto": 8, "setembro": 9, "outubro": 10, "novembro": 11, "dezembro": 12
        };

        const mesNumero = mesesDict[mesSelecionado];
        if (!mesNumero) {
            console.error("❌ Mês inválido:", mesSelecionado);
            return;
        }

        atualizarGrafico(mesNumero, anoAtual);
    });

    // 🔴 SOLUÇÃO PARA DEFINIR O MÊS PADRÃO AO CARREGAR A PÁGINA
    const mesAtual = new Date().toLocaleString("pt-BR", { month: "long" }).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    monthSelect.value = mesAtual; // Seleciona o mês atual no <select>

    // Garante que o mês selecionado no <select> existe no dicionário antes de atualizar o gráfico
    const mesesDict = {
        "janeiro": 1, "fevereiro": 2, "marco": 3, "março": 3, "abril": 4, "maio": 5, "junho": 6,
        "julho": 7, "agosto": 8, "setembro": 9, "outubro": 10, "novembro": 11, "dezembro": 12
    };

    const mesNumeroInicial = mesesDict[mesAtual];
    if (mesNumeroInicial) {
        atualizarGrafico(mesNumeroInicial, new Date().getFullYear());
    } else {
        console.error("❌ Mês inválido na inicialização:", mesAtual);
    }
});

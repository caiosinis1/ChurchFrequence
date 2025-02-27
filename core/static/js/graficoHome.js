document.addEventListener("DOMContentLoaded", function () {
    const ctx = document.getElementById("grafico")?.getContext("2d");
    const monthSelect = document.getElementById("month-select");

    let attendanceChart = null; // Variável global do gráfico

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

                // Ordenando corretamente os domingos
                data.presencas.sort((a, b) => a.domingo.localeCompare(b.domingo, undefined, { numeric: true }));

                const labels = data.presencas.map(item => item.domingo);
                const valoresPresentes = data.presencas.map(item => item.presentes);
                const valoresAusentes = data.presencas.map(item => item.ausentes ?? 0); // Certificando-se de que "ausentes" sempre tem um valor

                console.log("📌 Labels geradas:", labels);
                console.log("📌 Valores Presentes:", valoresPresentes);
                console.log("📌 Valores Ausentes:", valoresAusentes);

                // **DESTRUIR O GRÁFICO ANTERIOR SE EXISTIR**
                if (attendanceChart !== null) {
                    console.log("🛠️ Destruindo gráfico antigo...");
                    attendanceChart.destroy();
                }

                // **CRIANDO NOVO GRÁFICO COM PRESENTES E AUSENTES**
                attendanceChart = new Chart(ctx, {
                    type: "bar",
                    data: {
                        labels: labels,
                        datasets: [
                            {
                                label: "Presentes",
                                data: valoresPresentes,
                                backgroundColor: "rgb(46, 119, 46)", // Verde
                                borderColor: "rgb(41, 121, 41)",
                                borderWidth: 1
                            },
                            {
                                label: "Ausentes",
                                data: valoresAusentes,
                                backgroundColor: "rgb(172, 51, 77)", // Vermelho
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
                                        size: window.innerWidth <= 600 ? 10 : 14 // Reduz fonte em telas menores
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
                                        size: window.innerWidth <= 600 ? 10 : 14 // Reduz fonte de "Presentes" e "Ausentes"
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
                                        return tooltipItems[0].label; // Corrige a exibição do título no tooltip
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
        const mesSelecionado = monthSelect.value.toLowerCase();
        const anoAtual = new Date().getFullYear();
        const mesesDict = {
            "janeiro": 1, "fevereiro": 2, "março": 3, "abril": 4, "maio": 5, "junho": 6,
            "julho": 7, "agosto": 8, "setembro": 9, "outubro": 10, "novembro": 11, "dezembro": 12
        };

        const mesNumero = mesesDict[mesSelecionado];
        if (!mesNumero) {
            console.error("❌ Mês inválido:", mesSelecionado);
            return;
        }

        atualizarGrafico(mesNumero, anoAtual);
    });

    // Adiciona evento de redimensionamento para ajustar a fonte em tempo real
    window.addEventListener("resize", function () {
        if (attendanceChart) {
            attendanceChart.options.scales.x.ticks.font.size = window.innerWidth <= 600 ? 10 : 14;
            attendanceChart.options.scales.y.ticks.font.size = window.innerWidth <= 600 ? 10 : 14;
            attendanceChart.options.plugins.legend.labels.font.size = window.innerWidth <= 600 ? 10 : 14;
            attendanceChart.update();
        }
    });

    // Carregar gráfico ao abrir a página com o mês atual
    const mesAtual = new Date().toLocaleString("pt-BR", { month: "long" }).toLowerCase();
    monthSelect.value = mesAtual;
    atualizarGrafico(new Date().getMonth() + 1, new Date().getFullYear());
});

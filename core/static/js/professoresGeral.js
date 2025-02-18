// JS para autocomplete da pesquisa de professores
const professores = ["Carlos Souza", "Ana Lima", "Fernanda Oliveira", "Gabriel Santos"];
const inputPesquisa = document.getElementById("professor-pesquisa");
const listaSugestoes = document.getElementById("professores-sugestoes");

inputPesquisa.addEventListener("input", function() {
    const valor = this.value.toLowerCase();
    listaSugestoes.innerHTML = "";

    if (valor.length > 0) {
        const sugestoes = professores.filter(nome => nome.toLowerCase().includes(valor));
        
        sugestoes.forEach(nome => {
            const item = document.createElement("li");
            item.textContent = nome;
            item.addEventListener("click", function() {
                inputPesquisa.value = nome;
                listaSugestoes.innerHTML = "";
            });
            listaSugestoes.appendChild(item);
        });

        listaSugestoes.style.display = "block";
    } else {
        listaSugestoes.style.display = "none";
    }
});

document.addEventListener("click", function(event) {
    if (!listaSugestoes.contains(event.target) && event.target !== inputPesquisa) {
        listaSugestoes.style.display = "none";
    }
});
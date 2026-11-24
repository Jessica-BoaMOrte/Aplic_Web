
        // 4 Arrays paralelos com informações
       
const alimentos = ["Batata", "Cenoura", "Brócolis", "Morango"];
const calorias = ["52 kcal", "34 kcal", "25 kcal", "30 kcal"];
const proteinas = ["1,2g", "1,3g", "2,3g", "0,9g"];
const vitaminas = ["C e Complexo B", "A, K e C", "A, K e C", "C e B9"];

const imagens = [
    "https://thumbs.dreamstime.com/b/batata-crua-81331913.jpg?w=768",
    "https://media.istockphoto.com/id/1388403435/pt/foto/fresh-carrots-isolated-on-white-background.jpg?s=612x612&w=0&k=20&c=0YvPTagvrgMNfCjQvkUUdv9Hd2z06eg87qkitTr_dOI=",
    "https://www.infoescola.com/wp-content/uploads/2010/08/brocolis.jpg",
    "https://media.istockphoto.com/id/1412854156/pt/foto/strawberries-isolated-strawberry-whole-and-a-half-on-white-background-strawberry-slice-with.jpg?s=612x612&w=0&k=20&c=qjoZ9imnXieGFQapcmjFvTRgHr-noWSGjFwqfMcj-nw="
];

// Mapeamento dos elementos da DOM
const selectAlimentos = document.getElementById("selectAlimentos");
const btnDetalhes = document.getElementById("btnDetalhes");
const divCalorias = document.getElementById("divCalorias");
const divProteinas = document.getElementById("divProteinas");
const divVitaminas = document.getElementById("divVitaminas");
const divImagem = document.getElementById("divImagem");


// EventListener para o evento onclick do botão
btnDetalhes.addEventListener("click", function() {

    // Pega o índice selecionado na listbox
    const index = selectAlimentos.value;

    // Se houver seleção válida
    if (index !== "") {

        // Preenche as divs usando o mesmo índice nos arrays
        divCalorias.textContent = calorias[index];
        divProteinas.textContent = proteinas[index];
        divVitaminas.textContent = vitaminas[index];
    

        // Exibe a imagem dos alimentos
        divImagem.innerHTML = `<img src="${imagens[index]}" alt="Imagem de ${alimentos[index]}">`;
    }
});


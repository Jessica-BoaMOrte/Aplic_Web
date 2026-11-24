
        // 5 Arrays paralelos com informações da Wikipédia
       
const siglas    = ["GO", "MT", "MS", "DF"];
const capitais  = ["Goiânia", "Cuiabá", "Campo Grande", "Brasília"];
const areas     = ["340.242,854 km²", "903.208,362 km²", "357.142,082 km²", "5.760,783 km²"];
const populacoes= ["7.350.483 hab.", "3.658.649 hab.", "2.924.631 hab.", "2.982.818 hab."];

const bandeiras = [
    "https://www.gov.br/receitafederal/pt-br/acesso-a-informacao/acoes-e-programas/cidadania-fiscal/naf/nucleos/arquivos-e-imagens/goias.png/@@images/image.png",
    "https://upload.wikimedia.org/wikipedia/commons/0/0b/Bandeira_de_Mato_Grosso.svg",
    "https://upload.wikimedia.org/wikipedia/commons/6/64/Bandeira_de_Mato_Grosso_do_Sul.svg",
    "https://www.gov.br/receitafederal/pt-br/acesso-a-informacao/acoes-e-programas/cidadania-fiscal/naf/nucleos/arquivos-e-imagens/distrito-federal.png/@@images/image.png"
];

// Mapeamento dos elementos da DOM
const selectEstados = document.getElementById("selectEstados");
const btnDetalhes   = document.getElementById("btnDetalhes");
const divCapital    = document.getElementById("divCapital");
const divArea       = document.getElementById("divArea");
const divPopulacao  = document.getElementById("divPopulacao");
const divBandeira   = document.getElementById("divBandeira");

// EventListener para o evento onclick do botão
btnDetalhes.addEventListener("click", function() {

    // Pega o índice selecionado na listbox
    const index = selectEstados.value;

    // Se houver seleção válida
    if (index !== "") {

        // Preenche as divs usando o mesmo índice nos arrays
        divCapital.textContent = capitais[index];
        divArea.textContent = areas[index];
        divPopulacao.textContent = populacoes[index];

        // Exibe a imagem da bandeira
        divBandeira.innerHTML = `<img src="${bandeiras[index]}" alt="Bandeira de ${siglas[index]}">`;
    }
});


// Arquivo de configuração e processamento do Partido DISNEY

const candidatos = [];

async function carregarCandidatos() {
    try {
        const resposta = await fetch("candidatos.json");

        if (!resposta.ok) {
            throw new Error("Erro ao carregar candidatos.json");
        }

        const dados = await resposta.json();

        // Carrega somente os candidatos da DISNEY
        const candidatosPartido = dados.PDisney;

        candidatos.length = 0;

        candidatosPartido.forEach(candidato => {
            candidatos.push({
                nome: candidato.nome,
                foto: candidato.foto,
                cargo: "",
                numero: ""
            });
        });

        console.log("Candidatos da DISNEY:", candidatos);

    } catch (erro) {
        console.error("Erro:", erro);
    }
}

function validarNumeroCandidato(numero, cargo) {
    numero = String(numero).trim();

    switch (cargo) {

        case "Presidente":
        case "Governador(a)":
            return /^91$/.test(numero);

        case "Senador(a)":
            return /^91\d$/.test(numero);

        case "Deputado(a) Federal":
            return /^91\d{2}$/.test(numero);

        case "Deputado(a) Estadual":
            return /^91\d{3}$/.test(numero);

        default:
            return false;
    }
}

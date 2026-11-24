// Guarda o card que foi clicado no momento
var cardAtualSelecionado = null;

// Guarda a idade total da criança em meses para verificar vacinas atrasadas
var idadeTotalMesesCrianca = null;

// --- PARTE 1: CÁLCULO AUTOMÁTICO DE IDADE (ANOS E MESES) ---
var campoNascimento = document.getElementById('dataNascimento');
var campoIdadeAnos = document.getElementById('idadeAnos');
var campoIdadeMeses = document.getElementById('idadeMeses');

campoNascimento.addEventListener('change', function() {
  var valorData = campoNascimento.value;

  if (valorData === '') {
    campoIdadeAnos.value = '';
    campoIdadeMeses.value = '';
    idadeTotalMesesCrianca = null;
    verificarVacinasAtrasadas(false);
    return;
  }

  var partes = valorData.split('-');
  var anoNasc = parseInt(partes[0], 10);
  var mesNasc = parseInt(partes[1], 10);
  var diaNasc = parseInt(partes[2], 10);

  var hoje = new Date();
  var anoHoje = hoje.getFullYear();
  var mesHoje = hoje.getMonth() + 1;
  var diaHoje = hoje.getDate();

  var anos = anoHoje - anoNasc;
  var meses = mesHoje - mesNasc;

  if (diaHoje < diaNasc) {
    meses = meses - 1;
  }

  if (meses < 0) {
    anos = anos - 1;
    meses = meses + 12;
  }

  if (anos < 0) {
    alert('A data de nascimento não pode ser maior que a data de hoje!');
    campoNascimento.value = '';
    campoIdadeAnos.value = '';
    campoIdadeMeses.value = '';
    idadeTotalMesesCrianca = null;
    verificarVacinasAtrasadas(false);
    return;
  }

  campoIdadeAnos.value = anos + (anos === 1 ? ' ano' : ' anos');
  campoIdadeMeses.value = meses + (meses === 1 ? ' mês' : ' meses');

  // Guarda o total de meses de vida da criança e verifica se há vacinas atrasadas
  idadeTotalMesesCrianca = (anos * 12) + meses;
  verificarVacinasAtrasadas(false);
});


// --- PARTE 2: FUNÇÕES DE VALIDAÇÃO DE SOUTH AFRICAN ID NUMBER E CARTÃO SUS ---
function limparNumeros(texto) {
  var resultado = '';
  for (var i = 0; i < texto.length; i++) {
    var caractere = texto[i];
    if (caractere >= '0' && caractere <= '9') {
      resultado = resultado + caractere;
    }
  }
  return resultado;
}

/*
 * REGRA DE VERIFICAÇÃO DO SOUTH AFRICAN ID NUMBER (13 DÍGITOS):
 * Formato: AAMMDD SSSS C A Z
 * - AAMMDD (6 dígitos): Data de nascimento (Ano, Mês e Dia). O mês deve ser de 01 a 12 e o dia válido para o mês.
 * - SSSS (4 dígitos): Sequência e gênero (0000-4999 Feminino; 5000-9999 Masculino).
 * - C (1 dígito): Cidadania (0 = Cidadão Sul-Africano; 1 = Residente Permanente).
 * - A (1 dígito): Classificação histórica (atualmente 8 ou 9).
 * - Z (1 dígito): Dígito verificador calculado pelo Algoritmo de Luhn sobre os 12 primeiros dígitos:
 *     1. Percorre-se os 12 primeiros dígitos da direita para a esquerda.
 *     2. Dobra-se o valor de cada segundo dígito (posições 11, 9, 7, 5, 3 e 1 em índice base 0).
 *        Se o dobro for maior que 9, subtrai-se 9 (equivalente a somar os algarismos).
 *     3. Somam-se todos os 12 dígitos resultantes.
 *     4. O dígito verificador Z é obtido por: (10 - (soma % 10)) % 10.
 *     5. O ID é válido se Z for igual ao 13º dígito informado.
 */
function validarSouthAfricanID(idTexto) {
  var id = limparNumeros(idTexto);

  // 1. Deve conter exatamente 13 dígitos numéricos
  if (id.length !== 13) {
    return false;
  }

  // 2. Validação básica da data de nascimento (AAMMDD)
  var mes = parseInt(id.substring(2, 4), 10);
  var dia = parseInt(id.substring(4, 6), 10);

  if (mes < 1 || mes > 12 || dia < 1 || dia > 31) {
    return false;
  }

  // Dias máximos por mês (considerando fevereiro com 29 dias para anos bissextos)
  var diasPorMes = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (dia > diasPorMes[mes - 1]) {
    return false;
  }

  // 3. Validação do dígito de cidadania (11º dígito -> índice 10): deve ser '0' ou '1'
  var cidadania = id[10];
  if (cidadania !== '0' && cidadania !== '1') {
    return false;
  }

  // 4. Cálculo do dígito verificador pelo Algoritmo de Luhn nos 12 primeiros dígitos
  var soma = 0;
  var dobrar = true; // Começando do índice 11 (12º dígito) para trás, ele deve ser dobrado

  for (var i = 11; i >= 0; i--) {
    var digito = parseInt(id[i], 10);

    if (dobrar) {
      digito = digito * 2;
      if (digito > 9) {
        digito = digito - 9;
      }
    }

    soma = soma + digito;
    dobrar = !dobrar;
  }

  var digitoVerificadorCalculado = (10 - (soma % 10)) % 10;
  var digitoVerificadorInformado = parseInt(id[12], 10);

  return digitoVerificadorCalculado === digitoVerificadorInformado;
}

function validarCartaoSUS(susTexto) {
  var cns = limparNumeros(susTexto);

  if (cns.length !== 15) {
    return false;
  }

  var primeiroDigito = cns[0];
  if (
    primeiroDigito !== '1' &&
    primeiroDigito !== '2' &&
    primeiroDigito !== '7' &&
    primeiroDigito !== '8' &&
    primeiroDigito !== '9'
  ) {
    return false;
  }

  var soma = 0;
  for (var i = 0; i < 15; i++) {
    soma = soma + parseInt(cns[i], 10) * (15 - i);
  }

  return soma % 11 === 0;
}


// --- PARTE 3: ENVIO E VALIDAÇÃO DO FORMULÁRIO DA CRIANÇA ---
var formulario = document.getElementById('form-crianca');

formulario.addEventListener('submit', function(evento) {
  evento.preventDefault();

  var nome = document.getElementById('nomeCrianca').value;
  var nascimento = document.getElementById('dataNascimento').value;
  var saId = document.getElementById('cpfCrianca').value;
  var sus = document.getElementById('numeroSus').value;
  var resp1 = document.getElementById('responsavel1').value;
  var whatsapp = document.getElementById('whatsappResponsavel').value;

  if (nome === '' || nascimento === '' || saId === '' || sus === '' || resp1 === '' || whatsapp === '') {
    alert('Por favor, preencha todos os campos obrigatórios marcados com *!');
    return;
  }

  if (!validarSouthAfricanID(saId)) {
    alert('O South African ID Number digitado é inválido! Deve conter 13 dígitos válidos.');
    return;
  }

  if (!validarCartaoSUS(sus)) {
    alert('O número do Cartão SUS (CNS) é inválido! Deve conter 15 dígitos válidos.');
    return;
  }

  var mensagem = document.getElementById('mensagem-cadastro');
  mensagem.textContent = 'Iinkcukacha zika-' + nome + ' ziqinisekisiwe kwaye zagcinwa ngempumelelo ekhadini! Ifayile ye-JSON yenziwe.';

  // Ao salvar a carteira, verifica se já se passaram 10 dias desde o último alerta para notificar
  verificarVacinasAtrasadas(true);

  // Gera e baixa o arquivo JSON com os dados do paciente e o histórico de vacinas
  gerarJSONPaciente();
});


// --- PARTE 4: CARREGAR O ARQUIVO JSON E CRIAR OS CARDS ---
fetch('vacinasSUS.json')
  .then(function(resposta) {
    return resposta.json();
  })
  .then(function(dados) {
    var listaVacinas = dados.calendario_vacinacao_infantil_sus;
    var containerCards = document.getElementById('lista-vacinas');

    for (var i = 0; i < listaVacinas.length; i++) {
      var vacinaAtual = listaVacinas[i];
      var dosesSeparadas = separarDoses(vacinaAtual.idade);

      for (var j = 0; j < dosesSeparadas.length; j++) {
        criarCardNaTela(
          containerCards,
          vacinaAtual.vacina,
          dosesSeparadas[j],
          vacinaAtual.para_que_serve,
          j + 1
        );
      }
    }

    // Caso a data de nascimento já esteja preenchida ao carregar os cards
    verificarVacinasAtrasadas(false);
  })
  .catch(function(erro) {
    console.log('Erro ao carregar JSON:', erro);
    document.getElementById('lista-vacinas').innerHTML =
      '<p>Erro ao carregar vacinasSUS.json. Abra usando o Live Server.</p>';
  });

function separarDoses(texto) {
  if (texto.indexOf(';') !== -1) {
    return [texto];
  }
  var textoComVirgulas = texto.replace(' e ', ', ');
  return textoComVirgulas.split(', ');
}

function criarCardNaTela(container, nomeVacina, idadeDose, descricao, numeroDose) {
  var card = document.createElement('div');
  card.className = 'card-vacina';

  // Guarda os dados no dataset do card para facilitar a verificação de atraso
  card.dataset.nomeVacina = nomeVacina;
  card.dataset.idadeDose = idadeDose;
  card.dataset.mesesRecomendados = extrairMesesRecomendados(idadeDose);

  card.innerHTML =
    '<span class="etiqueta-dose">Dose ' + numeroDose + '</span>' +
    '<h3>' + nomeVacina + '</h3>' +
    '<p><strong>Idade:</strong> ' + idadeDose + '</p>' +
    '<p class="status-texto">Status: Pendente</p>' +
    '<div class="detalhes-aplicacao-card escondido"></div>';

  card.addEventListener('click', function() {
    abrirJanela(card, nomeVacina, numeroDose, idadeDose, descricao);
  });

  container.appendChild(card);
}


// --- PARTE 5: CONTROLE DA JANELA (MODAL) E DADOS DA APLICAÇÃO ---
var janela = document.getElementById('janela-detalhes');
var checkTomada = document.getElementById('check-tomada');
var camposAplicacao = document.getElementById('campos-aplicacao');

var inputDataAplicacao = document.getElementById('dataAplicacao');
var inputNumeroLote = document.getElementById('numeroLote');
var inputUnidadeAplicadora = document.getElementById('unidadeAplicadora');
var inputResponsavelAplicacao = document.getElementById('responsavelAplicacao');

var btnConfirmar = document.getElementById('btn-confirmar');
var btnFechar = document.getElementById('btn-fechar');

// Mostra ou esconde os 4 campos extras quando o checkbox muda
checkTomada.addEventListener('change', function() {
  if (checkTomada.checked === true) {
    camposAplicacao.classList.remove('escondido');
  } else {
    camposAplicacao.classList.add('escondido');
  }
});

// Função simples para converter YYYY-MM-DD em DD/MM/YYYY
function formatarDataBrasil(dataISO) {
  if (dataISO === '') return '';
  var partes = dataISO.split('-');
  return partes[2] + '/' + partes[1] + '/' + partes[0];
}

function abrirJanela(cardClicado, nome, numDose, idade, descricao) {
  cardAtualSelecionado = cardClicado;

  document.getElementById('janela-titulo').textContent = nome;
  document.getElementById('janela-dose').textContent = 'Dose ' + numDose;
  document.getElementById('janela-idade').textContent = idade;
  document.getElementById('janela-descricao').textContent = descricao;

  // Verifica se o card já estava marcado como tomado
  if (cardClicado.classList.contains('tomada')) {
    checkTomada.checked = true;
    camposAplicacao.classList.remove('escondido');

    // Recupera os valores salvos anteriormente no próprio card
    inputDataAplicacao.value = cardClicado.dataset.dataAplicacao || '';
    inputNumeroLote.value = cardClicado.dataset.numeroLote || '';
    inputUnidadeAplicadora.value = cardClicado.dataset.unidadeAplicadora || '';
    inputResponsavelAplicacao.value = cardClicado.dataset.responsavelAplicacao || '';
  } else {
    checkTomada.checked = false;
    camposAplicacao.classList.add('escondido');

    // Limpa os campos para um novo preenchimento
    inputDataAplicacao.value = '';
    inputNumeroLote.value = '';
    inputUnidadeAplicadora.value = '';
    inputResponsavelAplicacao.value = '';
  }

  janela.classList.remove('escondido');
}

btnConfirmar.addEventListener('click', function() {
  if (cardAtualSelecionado !== null) {
    var textoStatus = cardAtualSelecionado.querySelector('.status-texto');
    var caixaDetalhesCard = cardAtualSelecionado.querySelector('.detalhes-aplicacao-card');

    if (checkTomada.checked === true) {
      var dataApl = inputDataAplicacao.value;
      var lote = inputNumeroLote.value;
      var unidade = inputUnidadeAplicadora.value;
      var responsavel = inputResponsavelAplicacao.value;

      // Valida se os campos da aplicação foram preenchidos (lote sem verificação de formato)
      if (dataApl === '' || lote === '' || unidade === '' || responsavel === '') {
        alert('Preencha a data de aplicação, número do lote, unidade aplicadora e responsável!');
        return;
      }

      // Salva os dados no próprio elemento HTML do card usando dataset
      cardAtualSelecionado.dataset.dataAplicacao = dataApl;
      cardAtualSelecionado.dataset.numeroLote = lote;
      cardAtualSelecionado.dataset.unidadeAplicadora = unidade;
      cardAtualSelecionado.dataset.responsavelAplicacao = responsavel;

      cardAtualSelecionado.classList.remove('atrasada');
      cardAtualSelecionado.classList.add('tomada');
      textoStatus.textContent = 'Status: Aplicada ✓';

      // Mostra o resumo da aplicação dentro do card
      caixaDetalhesCard.innerHTML =
        '<strong>Data:</strong> ' + formatarDataBrasil(dataApl) + '<br>' +
        '<strong>Lote:</strong> ' + lote + '<br>' +
        '<strong>Unidade:</strong> ' + unidade + '<br>' +
        '<strong>Responsável:</strong> ' + responsavel;
      caixaDetalhesCard.classList.remove('escondido');

    } else {
      // Se desmarcou a opção, volta o card para Pendente e limpa os dados
      cardAtualSelecionado.classList.remove('tomada');
      textoStatus.textContent = 'Status: Pendente';
      caixaDetalhesCard.innerHTML = '';
      caixaDetalhesCard.classList.add('escondido');

      delete cardAtualSelecionado.dataset.dataAplicacao;
      delete cardAtualSelecionado.dataset.numeroLote;
      delete cardAtualSelecionado.dataset.unidadeAplicadora;
      delete cardAtualSelecionado.dataset.responsavelAplicacao;
    }

    // Atualiza a lista de vacinas atrasadas após confirmar uma dose
    verificarVacinasAtrasadas(false);
  }

  janela.classList.add('escondido');
});

btnFechar.addEventListener('click', function() {
  janela.classList.add('escondido');
});


// --- PARTE 6: VERIFICAÇÃO DE VACINAS ATRASADAS, ALERTA DEFESA CIVIL (A CADA 10 DIAS) E WHATSAPP ---

// Converte o texto da idade da dose (em Xhosa) para o número de meses recomendados
function extrairMesesRecomendados(textoIdade) {
  var texto = textoIdade.toLowerCase();

  // "Ekuzalweni" = Ao nascer (0 meses)
  if (texto.indexOf('ekuzalweni') !== -1) {
    return 0;
  }

  // Procura o primeiro número presente no texto
  var matchNumero = texto.match(/\d+/);
  if (!matchNumero) {
    return 0;
  }

  var valor = parseInt(matchNumero[0], 10);

  // "iminyaka" / "kwiminyaka" = anos -> multiplica por 12 para converter em meses
  if (texto.indexOf('minyaka') !== -1) {
    return valor * 12;
  }

  // "iinyanga" / "kwiinyanga" = meses
  return valor;
}

// Percorre todos os cards, marca os atrasados e dispara alertas se necessário
function verificarVacinasAtrasadas(forcarVerificacao10Dias) {
  var cards = document.querySelectorAll('.card-vacina');
  var vacinasAtrasadas = [];

  for (var i = 0; i < cards.length; i++) {
    var card = cards[i];
    var textoStatus = card.querySelector('.status-texto');

    // Se já foi tomada, garante que não fique marcada como atrasada
    if (card.classList.contains('tomada')) {
      card.classList.remove('atrasada');
      continue;
    }

    var mesesRec = parseInt(card.dataset.mesesRecomendados, 10);

    // Considera atrasada se a criança já passou do mês recomendado e ainda não tomou
    if (idadeTotalMesesCrianca !== null && idadeTotalMesesCrianca > mesesRec) {
      card.classList.add('atrasada');
      textoStatus.textContent = 'Status: Atrasada ⚠️';
      vacinasAtrasadas.push(card.dataset.nomeVacina + ' (' + card.dataset.idadeDose + ')');
    } else {
      card.classList.remove('atrasada');
      textoStatus.textContent = 'Status: Pendente';
    }
  }

  var painelAtrasadas = document.getElementById('painel-atrasadas');
  var resumoAtrasadas = document.getElementById('resumo-atrasadas');

  if (vacinasAtrasadas.length > 0) {
    painelAtrasadas.classList.remove('escondido');
    resumoAtrasadas.textContent =
      'Isilumkiso: Kukho izitofu zokugonya ezili-' + vacinasAtrasadas.length + ' ezisemva kwexesha!';

    // Verifica a regra de 1 vez a cada 10 dias para disparar o alerta automático
    if (forcarVerificacao10Dias) {
      checarPeriodicidade10Dias(vacinasAtrasadas);
    }
  } else {
    painelAtrasadas.classList.add('escondido');
  }
}

// Controla no localStorage para que o alerta automático ocorra apenas 1 vez a cada 10 dias
function checarPeriodicidade10Dias(listaAtrasadas) {
  var CHAVE_STORAGE = 'ultimo_alerta_vacina_10_dias';
  var DEZ_DIAS_EM_MS = 10 * 24 * 60 * 60 * 1000; // 10 dias em milissegundos
  var agora = Date.now();
  var ultimoEnvio = localStorage.getItem(CHAVE_STORAGE);

  // Se nunca foi enviado ou se já se passaram 10 dias (864.000.000 ms)
  if (!ultimoEnvio || (agora - parseInt(ultimoEnvio, 10)) >= DEZ_DIAS_EM_MS) {
    localStorage.setItem(CHAVE_STORAGE, agora.toString());
    exibirAlertaDefesaCivil(listaAtrasadas);
    dispararNotificacaoNavegadorWhatsApp(listaAtrasadas);
  }
}

// Emite som de sirene/alerta estilo Defesa Civil usando Web Audio API
function tocarSomDefesaCivil() {
  try {
    var AudioCtx = window.AudioContext || window.webkitAudioContext;
    var ctx = new AudioCtx();
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(853, ctx.currentTime); // Tom característico de alerta de emergência
    gain.gain.setValueAtTime(0.15, ctx.currentTime);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  } catch (e) {
    console.log('Áudio bloqueado pelo navegador antes da interação:', e);
  }
}

// Monta a mensagem formatada em Xhosa com os dados da criança e vacinas atrasadas
function montarMensagemAlerta(listaAtrasadas) {
  var nomeCrianca = document.getElementById('nomeCrianca').value || 'Umntwana';
  var nomeResp = document.getElementById('responsavel1').value || 'Mzali';

  var texto =
    'Molo ' + nomeResp + ',\n' +
    'ISILUMKISO SEZEMPILO (UMzantsi Afrika): U-' + nomeCrianca + ' unezitofu zokugonya ezisemva kwexesha:\n\n';

  for (var i = 0; i < listaAtrasadas.length; i++) {
    texto += '• ' + listaAtrasadas[i] + '\n';
  }

  texto += '\nNceda uye kwikliniki ekufutshane ngokukhawuleza. (Esi silumkiso sithunyelwa kanye ngeentsuku ezili-10).';
  return texto;
}

// Abre o modal estilo Defesa Civil na tela e toca o sinal sonoro
function exibirAlertaDefesaCivil(listaAtrasadas) {
  var modalDC = document.getElementById('alerta-defesa-civil');
  var textoDC = document.getElementById('texto-alerta-dc');

  textoDC.textContent = montarMensagemAlerta(listaAtrasadas);
  modalDC.classList.remove('escondido');
  tocarSomDefesaCivil();
}

// Dispara notificação do navegador e abre o WhatsApp Web/App com a mensagem pronta para o responsável
function enviarNotificacaoWhatsApp(listaAtrasadas) {
  var telefone = limparNumeros(document.getElementById('whatsappResponsavel').value);
  if (telefone === '') {
    alert('Nceda ufake inombolo ye-WhatsApp yomzali kuqala!');
    return;
  }

  var mensagem = montarMensagemAlerta(listaAtrasadas);
  dispararNotificacaoNavegadorWhatsApp(listaAtrasadas);

  var urlWhatsApp = 'https://wa.me/' + telefone + '?text=' + encodeURIComponent(mensagem);
  window.open(urlWhatsApp, '_blank');
}

// Notificação nativa do sistema/navegador avisando sobre o envio no WhatsApp
function dispararNotificacaoNavegadorWhatsApp(listaAtrasadas) {
  if ('Notification' in window) {
    if (Notification.permission === 'granted') {
      new Notification('WhatsApp - Isilumkiso Sokugonya', {
        body: montarMensagemAlerta(listaAtrasadas)
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(function(permissao) {
        if (permissao === 'granted') {
          new Notification('WhatsApp - Isilumkiso Sokugonya', {
            body: montarMensagemAlerta(listaAtrasadas)
          });
        }
      });
    }
  }
}

// Obtém a lista atual de vacinas atrasadas a partir dos cards na tela
function obterListaAtrasadasAtuais() {
  var cardsAtrasados = document.querySelectorAll('.card-vacina.atrasada');
  var lista = [];
  for (var i = 0; i < cardsAtrasados.length; i++) {
    lista.push(cardsAtrasados[i].dataset.nomeVacina + ' (' + cardsAtrasados[i].dataset.idadeDose + ')');
  }
  return lista;
}

// Eventos dos botões do painel e do modal de Defesa Civil / WhatsApp
document.getElementById('btn-simular-defesa-civil').addEventListener('click', function() {
  var lista = obterListaAtrasadasAtuais();
  if (lista.length > 0) {
    exibirAlertaDefesaCivil(lista);
  }
});

document.getElementById('btn-enviar-whatsapp').addEventListener('click', function() {
  var lista = obterListaAtrasadasAtuais();
  if (lista.length > 0) {
    enviarNotificacaoWhatsApp(lista);
  }
});

document.getElementById('btn-whatsapp-modal').addEventListener('click', function() {
  var lista = obterListaAtrasadasAtuais();
  if (lista.length > 0) {
    enviarNotificacaoWhatsApp(lista);
  }
});

document.getElementById('btn-fechar-dc').addEventListener('click', function() {
  document.getElementById('alerta-defesa-civil').classList.add('escondido');
});


// --- PARTE 7: EXPORTAÇÃO DOS DADOS DO PACIENTE E VACINAS EM ARQUIVO JSON ---
function gerarJSONPaciente() {
  var nome = document.getElementById('nomeCrianca').value.trim();
  var dataNascimento = document.getElementById('dataNascimento').value;
  var idadeAnos = document.getElementById('idadeAnos').value;
  var idadeMeses = document.getElementById('idadeMeses').value;
  var southAfricanId = limparNumeros(document.getElementById('cpfCrianca').value);
  var cartaoSus = limparNumeros(document.getElementById('numeroSus').value);
  var responsavel1 = document.getElementById('responsavel1').value.trim();
  var responsavel2 = document.getElementById('responsavel2').value.trim();
  var whatsapp = limparNumeros(document.getElementById('whatsappResponsavel').value);

  var cards = document.querySelectorAll('.card-vacina');
  var vacinas = [];

  for (var i = 0; i < cards.length; i++) {
    var card = cards[i];
    var aplicada = card.classList.contains('tomada');
    var atrasada = card.classList.contains('atrasada');

    var registroVacina = {
      vacina: card.dataset.nomeVacina || '',
      dose: card.querySelector('.etiqueta-dose') ? card.querySelector('.etiqueta-dose').textContent : '',
      idade_recomendada: card.dataset.idadeDose || '',
      status: aplicada ? 'Aplicada' : (atrasada ? 'Atrasada' : 'Pendente')
    };

    if (aplicada) {
      registroVacina.aplicacao = {
        data_aplicacao: card.dataset.dataAplicacao || '',
        numero_lote: card.dataset.numeroLote || '',
        unidade_aplicadora: card.dataset.unidadeAplicadora || '',
        responsavel_aplicacao: card.dataset.responsavelAplicacao || ''
      };
    }

    vacinas.push(registroVacina);
  }

  var dadosCarteirinha = {
    data_exportacao: new Date().toISOString(),
    paciente: {
      nome_completo: nome,
      data_nascimento: dataNascimento,
      idade_anos: idadeAnos,
      idade_meses: idadeMeses,
      south_african_id: southAfricanId,
      cartao_saude_sus: cartaoSus,
      responsavel_1: responsavel1,
      responsavel_2: responsavel2 || null,
      whatsapp_responsavel: whatsapp
    },
    vacinas: vacinas
  };

  var jsonString = JSON.stringify(dadosCarteirinha, null, 2);
  var blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
  var url = URL.createObjectURL(blob);

  var nomeArquivoSeguro = nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');

  if (!nomeArquivoSeguro) {
    nomeArquivoSeguro = 'paciente';
  }

  var linkDownload = document.createElement('a');
  linkDownload.href = url;
  linkDownload.download = 'carteirinha_' + nomeArquivoSeguro + '.json';
  document.body.appendChild(linkDownload);
  linkDownload.click();
  document.body.removeChild(linkDownload);
  URL.revokeObjectURL(url);
}

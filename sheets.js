const { GoogleSpreadsheet } = require('google-spreadsheet');
const creds = require('./credenciais.json');

// ID da planilha compartilhada
const doc = new GoogleSpreadsheet('1RA5sclobWJt8smpqRsYc6EvRGFK_x3dhndG2V2SCfkg');

const campanhas = [
  'Fala {{ first_name }}, aqui é o Alessandro do Barba Lenhador 👋\nPassando para saber, como está o crescimento com o Minoxidil?\nVocê tem alguma dúvida? Estou aqui para ajudar!',
  'Fala {{ first_name }}, aqui é o Alessandro do Barba Lenhador 👋\nJá faz um tempo que você iniciou o tratamento, gostaria de saber como está o crescimento com o Minoxidil?\nVocê tem alguma dúvida? Estou aqui para ajudar!',
  'Fala {{ first_name }}, aqui é o Alessandro do Barba Lenhador 👋\nVi que faz um tempo que você iniciou o uso do Minoxidill, está tendo resultado?\nVocê tem alguma dúvida? Estou aqui para ajudar!',
  'Fala {{ first_name }}, aqui é o Alessandro do Barba Lenhador 👋\nVocê está perto de completar os 6 meses de tratamento! Como tem sido sua evolução até agora?\nVocê tem alguma dúvida? Estou aqui para ajudar!'
];

const palavrasConversao = ['pix aprovado', 'pedido confirmado'];

function normalizarTexto(texto) {
  return texto?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

async function processarMensagem(dados) {
  const mensagem = dados?.text?.message;
  const telefone = dados?.phone;

  if (!mensagem || !telefone) return;

  await doc.useServiceAccountAuth(creds);
  await doc.loadInfo();
  const sheet = doc.sheetsByTitle['LENHADOR'];
  await sheet.loadHeaderRow();

  const linhas = await sheet.getRows();

  const mensagemNormalizada = normalizarTexto(mensagem);

  // Verifica se é mensagem de conversão
  if (palavrasConversao.some(palavra => mensagemNormalizada.includes(palavra))) {
    const linha = linhas.find(row => row.Telefone === telefone && row.Conversao === 'Não');
    if (linha) {
      linha.Conversao = 'Sim';
      linha.DataConversao = new Date().toLocaleDateString('pt-BR');
      await linha.save();
    }
    return;
  }

  // Verifica se é uma das mensagens de campanha
  const padraoEncontrado = campanhas.find(msg => {
    const base = msg.split('{{')[0].trim();
    return mensagem.startsWith(base);
  });

  if (padraoEncontrado) {
    await sheet.addRow({
      Telefone: telefone,
      Mensagem: mensagem,
      Conversao: 'Não',
      DataEnvio: new Date().toLocaleDateString('pt-BR')
    });
  }
}

module.exports = processarMensagem;

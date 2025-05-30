const { GoogleSpreadsheet } = require('google-spreadsheet');
const creds = require('./credenciais.json');

const doc = new GoogleSpreadsheet('1RA5sclobWJt8smpqRsYc6EvRGFK_x3dhndG2V2SCfkg'); // ID da sua planilha
const ABA = 'LENHADOR';

const mensagensCampanha = {
  'Fala {{ first_name }}, aqui é o Alessandro do Barba Lenhador 👋\nPassando para saber, como está o crescimento com o Minoxidil?\nVocê tem alguma dúvida? Estou aqui para ajudar!': '1 Frasco',
  'Fala {{ first_name }}, aqui é o Alessandro do Barba Lenhador 👋\nJá faz um tempo que você iniciou o tratamento, gostaria de saber como está o crescimento com o Minoxidil?\nVocê tem alguma dúvida? Estou aqui para ajudar!': '2 Frascos',
  'Fala {{ first_name }}, aqui é o Alessandro do Barba Lenhador 👋\nVi que faz um tempo que você iniciou o uso do Minoxidill, está tendo resultado?\nVocê tem alguma dúvida? Estou aqui para ajudar!': '3 Frascos',
  'Fala {{ first_name }}, aqui é o Alessandro do Barba Lenhador 👋\nVocê está perto de completar os 6 meses de tratamento! Como tem sido sua evolução até agora?\nVocê tem alguma dúvida? Estou aqui para ajudar!': '6 Frascos'
};

function normalizarTexto(texto) {
  return texto
    .replace(/\{\{ first_name \}\}/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function processarMensagem(data) {
  if (!data || !data.text || !data.text.message) return;

  const texto = data.text.message.trim();
  const numero = data.phone;
  const nome = data.senderName || '';
  const dataAtual = new Date().toLocaleDateString('pt-BR');

  const campanha = Object.entries(mensagensCampanha).find(([msg]) =>
    normalizarTexto(msg).toLowerCase() === texto.toLowerCase()
  );

  await doc.useServiceAccountAuth(creds);
  await doc.loadInfo();
  const sheet = doc.sheetsByTitle[ABA];
  await sheet.loadHeaderRow();

  if (campanha) {
    await sheet.addRow({
      Data: dataAtual,
      Nome: nome,
      Telefone: numero,
      Campanha: campanha[1],
      Conversão: 'Não',
      DataConversão: ''
    });
    console.log('📥 Campanha registrada:', campanha[1]);
  }

  const textoLower = texto.toLowerCase();
  if (textoLower.includes('pedido confirmado') || textoLower.includes('pix aprovado')) {
    const rows = await sheet.getRows();
    const linha = rows.find(r => r.Telefone === numero && r.Conversão === 'Não');

    if (linha) {
      linha.Conversão = 'Sim';
      linha.DataConversão = dataAtual;
      await linha.save();
      console.log('✅ Conversão registrada para:', numero);
    }
  }
}

module.exports = { processarMensagem };

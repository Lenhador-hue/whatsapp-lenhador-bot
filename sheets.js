const { GoogleSpreadsheet } = require('google-spreadsheet');
const creds = require('./credenciais.json');

const doc = new GoogleSpreadsheet('1RA5sclobWJt8smpqRsYc6EvRGFK_x3dhndG2V2SCfkg');

const CAMPANHAS = [
  { nome: '1 Frasco', palavras: ['passando para saber', 'como está o crescimento com o minoxidil'] },
  { nome: '2 Frascos', palavras: ['gostaria de saber como está o crescimento'] },
  { nome: '3 Frascos', palavras: ['faz um tempo que você iniciou', 'está tendo resultado'] },
  { nome: '6 Frascos', palavras: ['você está perto de completar os 6 meses'] },
];

const CONVERSOES = ['pix aprovado', 'pedido confirmado', 'pagamento aprovado', 'compra realizada', 'fechamos'];

function identificarCampanha(mensagem) {
  const texto = mensagem.toLowerCase();
  for (const campanha of CAMPANHAS) {
    if (campanha.palavras.every(p => texto.includes(p))) {
      return campanha.nome;
    }
  }
  return null;
}

function detectarConversao(mensagem) {
  const texto = mensagem.toLowerCase();
  return CONVERSOES.some(p => texto.includes(p));
}

async function registrarMensagemOuAtualizar({ numero, texto, dataHora }) {
  await doc.useServiceAccountAuth(creds);
  await doc.loadInfo();
  const aba = doc.sheetsByTitle['LENHADOR'];
  const linhas = await aba.getRows();

  const conversao = detectarConversao(texto);

  if (conversao) {
    const linha = linhas.find(l => l.Numero === numero && l.Conversao === 'Não');
    if (linha) {
      linha.Conversao = 'Sim';
      linha['Data Conversao'] = dataHora;
      await linha.save();
      return;
    }
  }

  const campanha = identificarCampanha(texto);
  if (campanha) {
    await aba.addRow({
      'Data Campanha': dataHora,
      'Numero': numero,
      'Mensagem': texto,
      'Campanha': campanha,
      'Conversao': 'Não',
      'Data Conversao': ''
    });
  }
}

module.exports = { registrarMensagemOuAtualizar };

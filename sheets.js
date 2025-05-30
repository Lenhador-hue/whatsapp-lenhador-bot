// === sheets.js ===
const { GoogleSpreadsheet } = require('google-spreadsheet');
const credenciais = require('./credenciais.json');

// **Atualize este ID** para o que aparece na URL da sua planilha:
const SHEET_ID = '1RA5sclobWJt8smpqRsYc6EvRGFK_x3dhndG2V2SCfkg';
const aba = 'LENHADOR';

async function processarMensagem(data) {
  const doc = new GoogleSpreadsheet(SHEET_ID);
  await doc.useServiceAccountAuth(credenciais);
  await doc.loadInfo();

  const sheet = doc.sheetsByTitle[aba];
  if (!sheet) throw new Error(`Aba "${aba}" não encontrada na planilha.`);

  // Extrai número e texto
  const telefone = data.phone;
  const mensagem = data.text?.message?.trim() || '';

  if (!mensagem) {
    console.log('❌ Mensagem vazia, ignorada.');
    return;
  }

  // Padrões
  const campanhas = ['1 frasco', '2 frascos', '3 frascos', '6 frascos'];
  const padraoCampanha = new RegExp(`(${campanhas.join('|')})`, 'i');
  const padraoConversao = /(pix|pedido|confirmado|foi aprovado|pagamento|finalizei|feito)/i;

  // 1) Se for mensagem de campanha
  if (padraoCampanha.test(mensagem)) {
    await sheet.addRow({
      'Data': new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
      'Número': telefone,
      'Mensagem': mensagem,
      'Campanha': mensagem,
      'Conversão': ''            // deixa em branco no registro inicial
    });
    console.log('✅ Campanha registrada');
    return;
  }

  // 2) Se for confirmação/conversão
  if (padraoConversao.test(mensagem)) {
    const rows = await sheet.getRows();
    // encontra última linha pendente para este número
    const row = rows.reverse()
      .find(r => r['Número'] === telefone && !r['Conversão']);
    if (row) {
      row['Conversão'] = 'sim';
      await row.save();
      console.log('✅ Conversão registrada');
    } else {
      console.log('⚠️ Nenhuma campanha pendente encontrada para marcar conversão.');
    }
  }
}

module.exports = { processarMensagem };

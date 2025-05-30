// === sheets.js ===
const { GoogleSpreadsheet } = require('google-spreadsheet');
// Aponte aqui para o seu arquivo de credenciais JSON (secret file)
const credenciais = require('./credenciais.json');

// ✔️ Novo ID da sua planilha
const SHEET_ID = '1RA5sclobWJt8smpqRsYc6EvRGFK_x3dhndG2V2SCfkg';
const ABA = 'LENHADOR';

async function processarMensagem(data) {
  const doc = new GoogleSpreadsheet(SHEET_ID);
  await doc.useServiceAccountAuth(credenciais);
  await doc.loadInfo();

  const sheet = doc.sheetsByTitle[ABA];
  if (!sheet) {
    console.error(`❌ Aba "${ABA}" não encontrada.`);
    return;
  }

  const nome     = data.senderName || '';
  const telefone = data.phone      || '';
  const mensagem = data.text?.message || '';

  if (!mensagem) {
    console.log('❌ Mensagem vazia, ignorada.');
    return;
  }

  // Campanhas válidas
  const campanhas      = ['1 frasco', '2 frascos', '3 frascos', '6 frascos'];
  const padraoCampanha = new RegExp(`(${campanhas.join('|')})`, 'i');
  const padraoConv     = /(pix|pedido|confirmado|foi aprovado|pagamento|finalizei|feito)/i;

  // 👉 Registra nova campanha
  if (padraoCampanha.test(mensagem)) {
    await sheet.addRow({
      data:      new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
      nome,
      telefone,
      campanha: mensagem,
      status:   'pendente'
    });
    console.log('✅ Campanha registrada');
    return;
  }

  // 👉 Marca conversão
  if (padraoConv.test(mensagem)) {
    const rows = await sheet.getRows();
    const row  = rows.reverse().find(r => r.telefone === telefone && r.status === 'pendente');
    if (row) {
      row.status = 'conversão';
      await row.save();
      console.log('✅ Conversão registrada');
    } else {
      console.log('⚠️ Nenhuma campanha pendente encontrada para conversão.');
    }
  }
}

module.exports = { processarMensagem };

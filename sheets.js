// === sheets.js ===
const { GoogleSpreadsheet } = require('google-spreadsheet');
const credenciais = require('./credenciais.json');

// ID da sua planilha e aba
const SHEET_ID = '1Io0jlHVYRo2KGQKdMUw9xVhnqnrL1M38BFaZ87IL5lw';
const ABA = 'LENHADOR';

async function processarMensagem(data) {
  const doc = new GoogleSpreadsheet(SHEET_ID);
  await doc.useServiceAccountAuth(credenciais);
  await doc.loadInfo();

  const sheet = doc.sheetsByTitle[ABA];
  if (!sheet) {
    console.error(`Aba ${ABA} não encontrada.`);
    return;
  }

  const nome = data.senderName || '';
  const mensagem = data.text?.message || '';
  const telefone = data.phone || '';

  if (!mensagem) {
    console.log('❌ Mensagem vazia, ignorada.');
    return;
  }

  // Palavras-chave de campanha e conversão
  const campanhas = ['1 frasco', '2 frascos', '3 frascos', '6 frascos'];
  const padraoCampanha = new RegExp(`(${campanhas.join('|')})`, 'i');
  const padraoConversao = /(pix aprovado|pedido confirmado|pagamento aprovado|compra realizada|fechamos)/i;

  // Registra campanhas
  if (padraoCampanha.test(mensagem)) {
    await sheet.addRow({
      data: new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
      nome,
      telefone,
      campanha: mensagem,
      status: 'pendente'
    });
    console.log('✅ Campanha registrada');
    return;
  }

  // Atualiza conversões
  if (padraoConversao.test(mensagem)) {
    const rows = await sheet.getRows();
    const row = rows.reverse().find(r => r.telefone === telefone && r.status === 'pendente');
    if (row) {
      row.status = 'conversão';
      await row.save();
      console.log('✅ Conversão registrada');
    } else {
      console.log('⚠️ Nenhuma campanha pendente encontrada para conversão.');
    }
  }
}

module.exports = processarMensagem;

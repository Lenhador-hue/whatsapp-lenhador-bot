const { GoogleSpreadsheet } = require('google-spreadsheet');
const credenciais = require('./credenciais.json');

const SHEET_ID = '1Io0jlHVYRo2KGQKdMUw9xVhnqnrL1M38BFaZ87IL5lw'; // substitua se for diferente
const aba = 'LENHADOR';

async function processarMensagem(data) {
  const doc = new GoogleSpreadsheet(SHEET_ID);
  await doc.useServiceAccountAuth(credenciais);
  await doc.loadInfo();

  const sheet = doc.sheetsByTitle[aba];
  if (!sheet) {
    console.error(`Aba ${aba} não encontrada.`);
    return;
  }

  const nome = data?.senderName || '';
  const mensagem = data?.text?.message || '';

  if (!mensagem) {
    console.log('❌ Mensagem vazia, ignorada.');
    return;
  }

  // Filtra apenas campanhas válidas
  const campanhas = ['1 frasco', '2 frascos', '3 frascos', '6 frascos'];
  const padrao = new RegExp(`(${campanhas.join('|')})`, 'i');
  const confirmacoes = /(pix|pedido|confirmado|foi aprovado|pagamento|finalizei|feito)/i;

  // Se for uma campanha
  if (padrao.test(mensagem)) {
    await sheet.addRow({
      data: new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
      nome,
      telefone: data.phone,
      campanha: mensagem,
      status: 'pendente'
    });
    console.log('✅ Campanha registrada');
  }

  // Se for uma confirmação
  if (confirmacoes.test(mensagem)) {
    const rows = await sheet.getRows();
    const row = rows.reverse().find(r => r.telefone === data.phone && r.status !== 'conversão');
    if (row) {
      row.status = 'conversão';
      await row.save();
      console.log('✅ Conversão registrada');
    } else {
      console.log('⚠️ Nenhuma campanha correspondente encontrada para marcar como conversão.');
    }
  }
}

module.exports = { processarMensagem };

// ── sheets.js ──
const { GoogleSpreadsheet } = require('google-spreadsheet');
const credentials = require('./credenciais.json');

// **Troque AQUI pelo ID da sua planilha (aquele do URL do Google Sheets):**
const SHEET_ID = '1RA5sclobWJt8smpqRsYc6EvRGFK_x3dhndG2V2SCfkg';
const SHEET_TITLE = 'LENHADOR';

async function processarMensagem(data) {
  console.log('🔍 [sheets] Iniciando processarMensagem...');
  console.log('🔢 phone=', data.phone, 'mensagem=', data.text?.message);

  // Autentica e carrega o doc
  const doc = new GoogleSpreadsheet(SHEET_ID);
  try {
    await doc.useServiceAccountAuth(credentials);
    await doc.loadInfo();
  } catch (err) {
    console.error('❌ [sheets] Erro ao autenticar/carregar planilha:', err);
    return;
  }

  const sheet = doc.sheetsByTitle[SHEET_TITLE];
  if (!sheet) {
    console.error(`❌ [sheets] Aba "${SHEET_TITLE}" não encontrada.`);
    return;
  }
  console.log('✅ [sheets] Conectado à aba', SHEET_TITLE);

  const mensagem = data.text?.message?.toLowerCase() || '';
  const telefone  = data.phone;
  // só capturamos “1 frasco”“2 frascos” “3 frascos” “6 frascos”
  const padraoCampanha = /\b(1 frasco|2 frascos|3 frascos|6 frascos)\b/;
  const padraoConfirm   = /(pix aprovado|pedido confirmado|pagamento aprovado|compra realizada|fechamos)/;

  // CAMPAIGNS
  if (padraoCampanha.test(mensagem)) {
    try {
      await sheet.addRow({
        Data:       new Date().toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo'}),
        Número:     telefone,
        Mensagem:   data.text.message,
        Campanha:   data.text.message,
        Conversão:  'pendente'
      });
      console.log('✅ [sheets] Campanha registrada!');
    } catch (err) {
      console.error('❌ [sheets] Erro ao gravar campanha:', err);
    }
    return;
  }

  // CONFIRMATIONS
  if (padraoConfirm.test(mensagem)) {
    try {
      const rows = await sheet.getRows();
      const match = rows
        .reverse()
        .find(r => r.Número === telefone && r.Conversão === 'pendente');
      if (match) {
        match.Conversão = 'confirmado';
        await match.save();
        console.log('✅ [sheets] Conversão marcada!');
      } else {
        console.log('⚠️ [sheets] Nenhuma campanha “pendente” encontrada para', telefone);
      }
    } catch (err) {
      console.error('❌ [sheets] Erro ao atualizar conversão:', err);
    }
  }
}

module.exports = { processarMensagem };

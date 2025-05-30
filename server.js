// === server.js ===
const express = require('express');
const bodyParser = require('body-parser');
// Importa diretamente a função que processa e grava na planilha
const processarMensagem = require('./sheets');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(bodyParser.json());

app.post('/webhook', async (req, res) => {
  console.log('✅ Webhook recebido!');
  console.log(JSON.stringify(req.body, null, 2));

  try {
    await processarMensagem(req.body);
    console.log('✅ processarMensagem executada');
  } catch (e) {
    console.error('❌ Erro ao processar mensagem:', e);
  }

  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

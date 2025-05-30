const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const processarMensagem = require('./sheets'); // importa função do sheets.js

app.use(bodyParser.json());

app.post('/', async (req, res) => {
  console.log('✅ Webhook recebido!');
  console.log(req.body);

  try {
    await processarMensagem(req.body); // envia para o sheets.js
    res.sendStatus(200);
  } catch (error) {
    console.error('Erro ao processar mensagem:', error);
    res.sendStatus(500);
  }
});

// ✅ Essencial para funcionar no Render:
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

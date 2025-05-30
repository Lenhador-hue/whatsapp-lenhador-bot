const express = require('express');
const bodyParser = require('body-parser');
const { processarMensagem } = require('./sheets');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/webhook', async (req, res) => {
  console.log('✅ Webhook recebido!');
  console.log(JSON.stringify(req.body, null, 2)); // Mostra no console o corpo da mensagem
  await processarMensagem(req.body);
  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

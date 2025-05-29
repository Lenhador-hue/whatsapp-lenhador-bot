const express = require('express');
const bodyParser = require('body-parser');
const { registrarMensagemOuAtualizar } = require('./sheets');
const app = express();

app.use(bodyParser.json());

app.post('/webhook', async (req, res) => {
  const body = req.body;

  if (!body.message || !body.phone) {
    return res.status(400).send('Dados incompletos');
  }

  const numero = body.phone;
  const texto = body.message;
  const dataHora = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

  await registrarMensagemOuAtualizar({ numero, texto, dataHora });
  res.sendStatus(200);
});

app.listen(3000, () => console.log('Servidor rodando na porta 3000'));

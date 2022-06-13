const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
app.use(bodyParser.json());

const HTTP_OK_STATUS = 200;
const PORT = '3000';

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.listen(PORT, () => {
  console.log('Online');
});

const FILE = './talker.json';

// 1
app.get('/talker', (_req, res) => {
  try {
    const talkers = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    if (!talkers) return res.status(200).send(talkers);
    return res.status(200).send(talkers);
  } catch (err) {
    return res.json(err);
  }
});

// 2
app.get('/talker/:id', (req, res) => {
  try {
    const { id } = req.params;
    const talkers = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    const talker = talkers.find((talk) => talk.id === Number(id));
    console.log(talker);
    if (!talker) {
      return res.status(404).json({
        message: 'Pessoa palestrante não encontrada',
      });
    }
    return res.status(200).send(talker);
  } catch (err) {
    return res.json(err);
  }
});

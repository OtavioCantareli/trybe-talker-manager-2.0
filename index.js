const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const crypto = require('crypto');

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

// Validations
const validEmail = (req, res, next) => {
  const regex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g;
  const { email } = req.body;
  if (!email || email === '' || email === ' ') {
    return res.status(400).json({
      message: 'O campo "email" é obrigatório',
    });
  }
  if (!regex.test(email)) {
    return res.status(400).json({
      message: 'O "email" deve ter o formato "email@email.com"',
    });
  }
  return next();
};

const validPW = (req, res, next) => {
  const size = 6;
  const { password } = req.body;
  if (!password || password === '' || password === ' ') {
    return res.status(400).json({
      message: 'O campo "password" é obrigatório',
    });
  }
  if (password.length < size) {
    return res.status(400).json({
      message: 'O "password" deve ter pelo menos 6 caracteres',
    });
  }
  return next();
};

// 3
app.post('/login', validEmail, validPW, (req, res) => {
  try {
    const token = crypto.randomBytes(48).toString('base64').substring(0, 16);
    return res.status(200).json({ token });
  } catch (err) {
    return res.json(err);
  }
});

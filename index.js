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
    return res.json({ err });
  }
});

// 2
app.get('/talker/:id', (req, res) => {
  try {
    const { id } = req.params;
    const talkers = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    const talker = talkers.find((talk) => talk.id === Number(id));
    if (!talker) {
      return res.status(404).json({
        message: 'Pessoa palestrante não encontrada',
      });
    }
    return res.status(200).send(talker);
  } catch (err) {
    return res.json({ err });
  }
});

// 4
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
    req.headers.authorization = token;
    return res.status(200).json({ token });
  } catch (err) {
    return res.json({ err });
  }
});

// 5
const validToken = (req, res, next) => {
  const size = 16;
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({
      message: 'Token não encontrado',
    });
  }
  if (token.length !== size) {
    return res.status(401).json({
      message: 'Token inválido',
    });
  }
  return next();
};

const validName = (req, res, next) => {
  const size = 3;
  const { name } = req.body;
  if (!name || name === '') {
    return res.status(400).json({
      message: 'O campo "name" é obrigatório',
    });
  }
  if (name.length < size) {
    return res.status(400).json({
      message: 'O "name" deve ter pelo menos 3 caracteres',
    });
  }
  return next();
};

const validAge = (req, res, next) => {
  const minAge = 18;
  const { age } = req.body;
  if (!age || age === '') {
    return res.status(400).json({
      message: 'O campo "age" é obrigatório',
    });
  }
  if (age < minAge) {
    return res.status(400).json({
      message: 'A pessoa palestrante deve ser maior de idade',
    });
  }
  return next();
};

const validTalk = (req, res, next) => {
  const { talk } = req.body;
  if (!talk) {
    return res.status(400).json({
      message: 'O campo "talk" é obrigatório',
    });
  }
  return next();
};

const validDate = (req, res, next) => {
  const { watchedAt } = req.body.talk;
  if (!watchedAt) {
    return res.status(400).json({
      message: 'O campo "watchedAt" é obrigatório',
    });
  }
  const regex = /^\d{2}[/]\d{2}[/]\d{4}$/;
  if (!regex.test(watchedAt)) {
    return res.status(400).json({
      message: 'O campo "watchedAt" deve ter o formato "dd/mm/aaaa"',
    });
  }
  return next();
};

const validRate = (req, res, next) => {
  const { rate } = req.body.talk;
  if (rate < 1 || rate > 5) {
    return res.status(400).json({
      message: 'O campo "rate" deve ser um inteiro de 1 à 5',
    });
  }
  if (!rate) {
    return res.status(400).json({
      message: 'O campo "rate" é obrigatório',
    });
  }
  return next();
};

app.post('/talker',
  validToken,
  validName,
  validAge,
  validTalk,
  validDate,
  validRate,
  (req, res) => {
    try {
      const { name, age, talk: { watchedAt, rate } } = req.body;
      const talkers = JSON.parse(fs.readFileSync(FILE, 'utf8'));
      const talker = {
        id: talkers.length + 1,
        name,
        age,
        talk: {
          watchedAt, rate,
        },
      };
      talkers.push(talker);
      fs.writeFileSync(FILE, JSON.stringify(talkers));
      return res.status(201).json(talker);
    } catch (err) {
      return res.json({ err });
    }
  });

// 6
app.put('/talker/:id', 
  validToken, 
  validName,
  validAge,
  validTalk,
  validDate,
  validRate,
  (req, res) => {
    try {
      const { id } = req.params;
      const { name, age, talk: { watchedAt, rate } } = req.body;
      const talkers = JSON.parse(fs.readFileSync(FILE, 'utf8'));
      const index = talkers.findIndex((talk) => talk.id === Number(id));
      talkers[index] = {
        name,
        age,
        talk: {
          watchedAt, rate,
        },
      };
      return res.status(200).json(talkers[index]);
    } catch (err) {
      res.json({ err });
    }
  });

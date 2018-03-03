const express = require('express'),
  checkJwt = require('../../checkJwt')

const app = express.Router()

app.post('/items', checkJwt, (req, res) => {
  res.status(201).send({ message: 'This is the POST endpoint' })
})

module.exports = app

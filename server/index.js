const express = require('express'),
  cors = require('cors'),
  bodyParser = require('body-parser')

const app = express()

app.use(cors())

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use('/api/assets/v1/', require('./app/assets'))

app.listen(process.env.port || 3030)

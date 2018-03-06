import express from 'express'
import cors from 'cors'
import { json, urlencoded } from 'body-parser'
import fs from 'fs'
import morgan from 'morgan'
import path from 'path'
import { MongoClient } from 'mongodb'
import fileUpload from 'express-fileupload'

import assets from './app/assets'

const app = express()

app.use(cors())

app.use(json())
app.use(urlencoded({ extended: true }))

app.use(
  morgan('dev', {
    skip: (req, res) => res.statusCode < 400
  })
)

app.use(
  morgan('common', {
    stream: fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
  })
)

app.disable('etag')

app.use((req, res, next) => {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate')
  res.header('Expires', '-1')
  res.header('Pragma', 'no-cache')

  req.headers['if-none-match'] = 'no-match-for-this'

  next()
})

app.use(fileUpload())

MongoClient.connect(process.env.MONGO_URI, (err, conn) => {
  if (err) {
    console.error('No connection to the database')
    throw err
  }
  app.locals.db = conn.db(process.env.MONGO_DATABASE)

  app.listen(process.env.port || 3030)
})

app.use('/api/assets/v1/', assets)

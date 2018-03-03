import express from 'express'
import cors from 'cors'
import { json, urlencoded } from 'body-parser'
import fs from 'fs'
import morgan from 'morgan'
import path from 'path'

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

app.use('/api/assets/v1/', assets)

app.listen(process.env.port || 3030)

import { Router } from 'express'
import checkJwt from '../../checkJwt'

const app = Router()

app.post('/items', checkJwt, (req, res) => {
  res.status(201).send()
})

export default app

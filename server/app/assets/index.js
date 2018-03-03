import { Router } from 'express'
import { ObjectID } from 'mongodb'

import checkJwt from '../../checkJwt'

const app = Router()

app.get('/items', checkJwt, async (req, res, next) => {
  try {
    const db = req.app.locals.db

    res.json(
      await db
        .collection('assets_item')
        .find({})
        .toArray()
    )
  } catch (e) {
    next(e)
  }
})

app.get('/item/:id', checkJwt, async (req, res, next) => {
  try {
    const db = req.app.locals.db

    res.json({
      ...(await db.collection('assets_item').findOne({ _id: ObjectID(req.params.id) })),
      calculation: {
        absolute: null,
        relative: null
      }
    })
  } catch (e) {
    next(e)
  }
})

app.get('/item', checkJwt, async (req, res, next) => {
  try {
    const db = req.app.locals.db

    res.json(await db.collection('assets_item').findOne())
  } catch (e) {
    next(e)
  }
})

app.post('/item/:id', checkJwt, async (req, res, next) => {
  try {
    const db = req.app.locals.db

    const mongoRes = await db.collection('assets_item').updateOne({ _id: ObjectID(req.params.id) }, { $set: req.body })

    if (mongoRes.result.ok === 1 && mongoRes.result.n === 1) {
      res.json({ status: 'ok' })
    } else if (mongoRes.result.ok === 1) {
      res.status(404).json({ status: 'err', errorCode: 404, errorMessage: 'ID Item not found' })
    } else {
      res.status(400).json({ status: 'err' })
    }
  } catch (e) {
    next(e)
  }
})

app.put('/item', checkJwt, async (req, res, next) => {
  try {
    const db = req.app.locals.db

    const mongoRes = await db.collection('assets_item').insertOne(req.body)

    if (mongoRes.result.ok === 1 && mongoRes.result.n === 1) {
      res.json({ status: 'ok', id: mongoRes.insertedId })
    } else {
      res.status(400).json({ status: 'err' })
    }
  } catch (e) {
    next(e)
  }
})

app.delete('/item/:id', checkJwt, async (req, res, next) => {
  try {
    const db = req.app.locals.db

    await db.collection('assets_item').deleteOne({ _id: ObjectID(req.params.id) })

    res.sendStatus(204)
  } catch (e) {
    next(e)
  }
})

export default app

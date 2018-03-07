import { Router } from 'express'
import { ObjectID } from 'mongodb'
import { createReadStream } from 'streamifier'
import oneDriveApi from 'onedrive-api'
import uuid from 'uuid/v4'
import { extname } from 'path'

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

app.put('/item/:id/document', checkJwt, async (req, res, next) => {
  const id = uuid()
  const db = req.app.locals.db

  try {
    console.log('start')
    const apiRes = await oneDriveApi.items.uploadSimple({
      accessToken: req.headers['x-onedrive-token'],
      filename: `${id}${extname(req.files.file.name)}`,
      readableStream: createReadStream(req.files.file.data),
      parentPath: `/DMS/Assets/${req.params.id}`
    })

    await db.collection('assets_item').updateOne(
      { _id: ObjectID(req.params.id) },
      {
        $push: {
          documents: {
            id,
            key: 'New Document',
            filename: req.files.file.name,
            oneDriveId: apiRes.id,
            oneDriveUrl: apiRes['@microsoft.graph.downloadUrl']
          }
        }
      }
    )

    res.sendStatus(201)
  } catch (e) {
    console.log(e)
    res.sendStatus(500)
  }
})

app.get('/item/:id/document/:docId', checkJwt, async (req, res, next) => {
  const db = req.app.locals.db

  try {
    const item = await db.collection('assets_item').findOne({ _id: ObjectID(req.params.id) }, { documents: 1, _id: 0 })
    const doc = item.documents.find(doc => doc.id === req.params.docId)

    const apiRes = await oneDriveApi.items.getMetadata({
      accessToken: req.headers['x-onedrive-token'],
      itemId: doc.oneDriveId
    })

    console.log(apiRes)
    res.json({ link: apiRes['@microsoft.graph.downloadUrl'] })
  } catch (e) {
    console.error(e)
    res.sendStatus(500)
  }
})

export default app

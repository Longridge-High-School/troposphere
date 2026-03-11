import express from 'express'
import bodyParser from 'body-parser'

import {authenticateRequests} from './middleware/authenticate'

import {router as personRouter} from './endpoints/person'

export const app = express()

app.use(bodyParser.json())

app.use(authenticateRequests)
app.use('/person', personRouter)

app.get('/me', (req, res) => {
  res.json({platform: res.locals.platform})
})

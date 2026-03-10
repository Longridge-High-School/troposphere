import express from 'express'

import {getPrisma} from '../lib/prisma'

const router = express.Router()

router.get('/:person', async (req, res) => {
  const prisma = getPrisma()

  const person = await prisma.person.findFirst({where: {id: req.params.person}})

  if (!person) {
    res.status(404)
    res.json({
      error: 'Person not found',
      params: req.params
    })
    return
  }

  res.status(200)
  res.json(person)
})

interface SyncResponseBody {
  /* The Match Type will either be "internal" for the internal id, or the key in the PersonServiceIds table */
  matchType: string
  matchId: string
}

router.post('/sync', async (req, res) => {
  const prisma = getPrisma()

  const body = JSON.parse(req.body) as SyncResponseBody

  let personId = undefined

  if (body.matchType !== 'internal') {
    const serviceId = await prisma.personServiceIds.findFirst({
      where: {serviceKey: body.matchType, serviceId: body.matchId}
    })
  }
})

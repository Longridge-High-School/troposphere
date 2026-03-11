import express from 'express'

import {getPrisma} from '../lib/prisma'
import {
  createPersonWithMatch,
  getPersonFromMatch,
  type PersonCreateData
} from '../lib/person'

export const router = express.Router()

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
  platform?: string
  platformId: string
  person: PersonCreateData
}

router.post('/sync', async (req, res) => {
  const prisma = getPrisma()

  const body = req.body as SyncResponseBody

  const targetPlatform = body.platform ? body.platform : res.locals.platform

  const matchedPerson = await getPersonFromMatch(
    targetPlatform,
    body.platformId
  )

  if (matchedPerson === null) {
    // No match was found for this person in the database, create an entry for them.
    const newPerson = await createPersonWithMatch(
      targetPlatform,
      body.platformId,
      res.locals.platform,
      body.person
    )

    res.status(201)
    res.json({result: 'created', person: newPerson})
    return
  }

  if (matchedPerson.source !== res.locals.platform) {
    res.status(403)
    res.json({
      result: 'error',
      message: `This person belongs to the source ${matchedPerson.source}`
    })
  }

  const shouldUpdate = (
    Object.keys(body.person) as Array<keyof PersonCreateData>
  ).reduce((should, property) => {
    if (should) {
      return true
    }

    if (body.person[property] !== matchedPerson[property]) {
      return true
    }

    return false
  }, false as boolean)

  if (shouldUpdate) {
    const updatedPerson = await prisma.person.update({
      where: {id: matchedPerson.id},
      data: {...body.person}
    })

    res.status(201)
    res.json({result: 'updated', person: updatedPerson})
    return
  }

  res.status(200)
  res.json({result: 'no-change', person: matchedPerson})
})

router.get('/sync/:source', async (req, res) => {
  const prisma = getPrisma()

  if (res.locals.platform !== req.params.source) {
    res.status(403)
    res.json({result: 'error'})
    return
  }

  const people = await prisma.person.findMany({
    where: {source: req.params.source},
    include: {serviceIds: {where: {serviceKey: req.params.source}}}
  })

  res.json({
    result: 'success',
    people: people.map(person => {
      return {personId: person.id, sourceId: person.serviceIds[0].serviceId}
    })
  })
})

router.post('/sync/:source', async (req, res) => {
  const prisma = getPrisma()

  if (res.locals.platform !== req.params.source) {
    res.status(403)
    res.json({result: 'error'})
    return
  }

  const deletedCount = await prisma.person.deleteMany({
    where: {id: {notIn: req.body.people}, source: req.params.source}
  })

  res.status(200)
  res.json({result: 'success', deleted: deletedCount.count})
})

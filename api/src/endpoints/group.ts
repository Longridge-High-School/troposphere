import express from 'express'

import {getPrisma} from '../lib/prisma'

export const router = express.Router()

router.get('/:group', async (req, res) => {
  const prisma = getPrisma()

  const group = await prisma.group.findFirst({where: {id: req.params.group}})

  if (!group) {
    res.status(404)
    res.json({
      error: 'Group not found',
      params: req.params
    })
    return
  }

  res.status(200)
  res.json(group)
})

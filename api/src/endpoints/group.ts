import express from 'express'

import {getPrisma} from '../lib/prisma'
import {type GroupCreateData, setGroupMembers} from '../lib/group'
import {log} from '../lib/log'

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

interface SyncResponseBody {
  platform?: string
  platformId: string
  group: GroupCreateData
  members: Array<{platform: string; platformId: string}>
}

router.post('/sync', async (req, res) => {
  const prisma = getPrisma()

  const body = req.body as SyncResponseBody

  const targetPlatform = body.platform ? body.platform : res.locals.platform

  const matchedGroup = await prisma.group.findFirst({
    where: {source: targetPlatform, sourceId: body.platformId}
  })

  if (matchedGroup === null) {
    const newGroup = await prisma.group.create({
      data: {...body.group, source: targetPlatform, sourceId: body.platformId}
    })

    await log(`New group created (${newGroup.name})`, 'group', newGroup.id)

    const groupMembershipChanges = await setGroupMembers(
      newGroup.id,
      body.members
    )

    res.status(201)
    res.json({result: 'created', group: newGroup, groupMembershipChanges})
    return
  }

  if (matchedGroup.source !== res.locals.platform) {
    await log(
      `Source ${res.locals.platform} tried to sync group belonging to source ${matchedGroup.source}`,
      'group',
      matchedGroup.id
    )

    res.status(403)
    res.json({
      result: 'error',
      message: `This group belongs to the source ${matchedGroup.source}`
    })
  }

  const updatedGroup = await prisma.group.update({
    where: {id: matchedGroup.id},
    data: {...body.group}
  })
  const groupMembershipChanges = await setGroupMembers(
    matchedGroup.id,
    body.members
  )

  await log(`Updated Group ${matchedGroup.name}`, 'group', matchedGroup.id)
  res.status(201)
  res.json({result: 'updated', group: updatedGroup, groupMembershipChanges})
})

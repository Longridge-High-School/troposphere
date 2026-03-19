import {type Group} from 'generated/prisma/client'

import {getPrisma} from './prisma'
import {getPersonFromMatch} from './person'
import {log} from './log'

export type GroupCreateData = Omit<
  Group,
  'id' | 'createdAt' | 'updatedAt' | 'source'
>

export const setGroupMembers = async (
  groupId: string,
  members: Array<{platform: string; platformId: string}>
) => {
  const prisma = getPrisma()

  const group = await prisma.group.findFirstOrThrow({
    where: {id: groupId},
    include: {memberships: true}
  })
  const groupMemberIds = group.memberships.map(({personId}) => personId)

  const results: {
    added: Array<{platform: string; platformId: string; internalId: string}>
    removed: Array<{platform: string; platformId: string; internalId: string}>
    noChange: Array<{platform: string; platformId: string; internalId: string}>
    noMatch: Array<{platform: string; platformId: string; internalId: string}>
  } = {added: [], removed: [], noChange: [], noMatch: []}

  await Promise.all(
    members.map(({platform, platformId}) => {
      const promise = async () => {
        const person = await getPersonFromMatch(platform, platformId)

        if (person === null) {
          results.noMatch.push({platform, platformId, internalId: 'no-match'})
          return
        }

        if (groupMemberIds.includes(person.id)) {
          results.noChange.push({platform, platformId, internalId: person.id})
          return
        }

        await prisma.groupMembership.create({
          data: {groupId: group.id, personId: person.id}
        })
        results.added.push({platform, platformId, internalId: person.id})

        await log(`Added to group ${group.name}`, 'person', person.id)
      }

      return promise()
    })
  )

  await Promise.all(
    groupMemberIds.map(personId => {
      const promise = async () => {
        if (
          ![
            ...results.added.map(({internalId}) => internalId),
            ...results.noChange.map(({internalId}) => internalId)
          ].includes(personId)
        ) {
          // Delete Many because Delete requires ID
          await prisma.groupMembership.deleteMany({
            where: {groupId: group.id, personId}
          })
          await log(`Removed from group ${group.name}`, 'person', personId)
          results.removed.push({
            platform: 'internal',
            platformId: personId,
            internalId: personId
          })
        }
      }

      return promise()
    })
  )

  return results
}

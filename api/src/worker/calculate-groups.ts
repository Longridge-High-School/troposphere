import {type Group} from 'generated/prisma/client'
import {getPrisma} from '../lib/prisma'

export const calculateGroup = async (groupId: string) => {
  const prisma = getPrisma()

  const group = await prisma.group.findFirst({where: {id: groupId}})

  if (!group) {
    return
  }

  switch (group.filterType) {
    case 'property':
      return calculateGroupFromProperty(group)
      break
  }
}

const getSourceList = async (sourceListId: string) => {
  const prisma = getPrisma()

  switch (sourceListId) {
    case 'all':
      return await prisma.person.findMany()
    case 'none':
      return []
    default:
      const members = await prisma.groupMembership.findMany({
        where: {groupId: sourceListId},
        include: {person: true}
      })
      return members.map(({person}) => {
        return person
      })
  }
}

const calculateGroupFromProperty = async (group: Group) => {
  const sourceList = await getSourceList(group.parent ? group.parent : 'all')
}

import {getPrisma} from '../lib/prisma'

export const calculateGroup = async (groupId: string) => {
  const prisma = getPrisma()

  const group = await prisma.group.findFirst({where: {id: groupId}})
}

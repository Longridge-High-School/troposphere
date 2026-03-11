import {getPrisma} from '../src/lib/prisma'
import {faker} from '@faker-js/faker'

export const clearDatabase = async () => {
  const prisma = getPrisma()

  await prisma.groupMembership.deleteMany()
  await prisma.group.deleteMany()
  await prisma.personServiceIds.deleteMany()
  await prisma.person.deleteMany()
  await prisma.aPIKey.deleteMany()
}

export const createAPIKey = async (platform: string = 'test') => {
  const prisma = getPrisma()

  const apiKey = await prisma.aPIKey.create({
    data: {platform, key: faker.string.uuid()}
  })

  return apiKey.key
}

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

export const createSampleData = async () => {
  const prisma = getPrisma()

  const domain = 'test.com'

  for (let i = 0; i < 100; i++) {
    const accountName = faker.internet.username()

    await prisma.person.create({
      data: {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        title: faker.person.prefix(),
        accountName,
        email: `${accountName}@${domain}`,
        type: 'staff',
        cohort: '',
        staffCode: faker.person.firstName().substring(0, 2),
        source: 'test'
      }
    })
  }
}

import {describe, test, expect, afterAll} from 'vitest'
import {faker} from '@faker-js/faker'

import {getPrisma} from '../src/lib/prisma'
import {clearDatabase} from './helpers'

import {getPersonFromMatch} from '../src/lib/person'

describe('Person Library', () => {
  afterAll(async () => {
    await clearDatabase()
  })

  test('It should find a person', async () => {
    const prisma = getPrisma()

    const notFoundPerson = await getPersonFromMatch('not-found', '123456')

    expect(notFoundPerson).toBeNull()

    const internalPerson = await prisma.person.create({
      data: {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        title: faker.person.prefix(),
        cohort: '',
        staffCode: 'IP1',
        type: 'staff',
        accountName: '',
        email: '',
        source: 'test'
      }
    })

    const internalFoundPerson = await getPersonFromMatch(
      'internal',
      internalPerson.id
    )

    expect(internalFoundPerson).not.toBeNull()
    expect(internalFoundPerson!.id).toBe(internalPerson.id)
  })
})

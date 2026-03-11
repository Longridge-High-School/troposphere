import {type Person} from 'generated/prisma/client'

import {getPrisma} from './prisma'

export const getPersonFromMatch = async (
  matchType: string,
  matchId: string
): Promise<Person | null> => {
  const prisma = getPrisma()

  if (matchType === 'internal') {
    const person = await prisma.person.findFirst({where: {id: matchId}})

    return person
  }

  const match = await prisma.personServiceIds.findFirst({
    where: {serviceKey: matchType, serviceId: matchId},
    include: {person: true}
  })

  if (match) {
    return match.person
  }

  return null
}

export type PersonCreateData = Omit<
  Person,
  'id' | 'createdAt' | 'updatedAt' | 'source'
>

export const createPersonWithMatch = async (
  matchType: string,
  matchId: string,
  source: string,
  person: Partial<PersonCreateData>
) => {
  const prisma = getPrisma()

  const dbPerson = await prisma.person.create({
    data: {
      cohort: '',
      accountName: '',
      email: '',
      staffCode: '',
      firstName: '',
      lastName: '',
      title: '',
      type: '',
      ...person,
      id: matchType === 'internal' ? matchId : undefined,
      source
    }
  })

  if (matchType !== 'internal') {
    await prisma.personServiceIds.create({
      data: {personId: dbPerson.id, serviceKey: matchType, serviceId: matchId}
    })
  }

  return dbPerson
}

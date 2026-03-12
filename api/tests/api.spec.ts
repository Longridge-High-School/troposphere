import {describe, test, expect, beforeAll, afterAll} from 'vitest'
import request from 'supertest'
import {faker} from '@faker-js/faker'

import {clearDatabase, createAPIKey} from './helpers'

import {app} from '../src/api'

describe('API', () => {
  let apiKey = ''

  beforeAll(async () => {
    apiKey = await createAPIKey()
  })

  afterAll(async () => {
    await clearDatabase()
  })

  test('It should authenticate', async () => {
    const response = await request(app).get('/me').set('Auth', apiKey)

    expect(response.status).toBe(200)
    expect(response.body.platform).toBe('test')

    const failResponse = await request(app).get('/me').set('Auth', 'bad-key')

    expect(failResponse.status).toBe(403)
    expect(failResponse.body.result).toBe('error')
  })

  describe('Person API', () => {
    let internalUserId = ''

    test('It should sync a person', async () => {
      const platformId = faker.string.uuid()
      const testPerson = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        title: faker.person.prefix(),
        staffCode: 'IP1',
        type: 'staff'
      }

      // Confirm that a completely new user is created.
      const initialResponse = await request(app)
        .post('/person/sync')
        .set('Auth', apiKey)
        .set('Content-Type', 'application/json')
        .send({platformId, person: testPerson})

      expect(initialResponse.status).toBe(201)
      expect(initialResponse.body.result).toBe('created')

      internalUserId = initialResponse.body.person.id

      // Confirm that resending the original user results in no-chaange
      const unchangedResponse = await request(app)
        .post('/person/sync')
        .set('Auth', apiKey)
        .set('Content-Type', 'application/json')
        .send({platformId, person: testPerson})

      expect(unchangedResponse.status).toBe(200)
      expect(unchangedResponse.body.result).toBe('no-change')

      // Confirm that changing a detail results in updated
      const changedResponse = await request(app)
        .post('/person/sync')
        .set('Auth', apiKey)
        .set('Content-Type', 'application/json')
        .send({
          platformId,
          person: {accountName: faker.internet.username(), ...testPerson}
        })

      expect(changedResponse.status).toBe(201)
      expect(changedResponse.body.result).toBe('updated')

      const anotherApiKey = await createAPIKey('imposter')
      const cantUpdateResponse = await request(app)
        .post('/person/sync')
        .set('Auth', anotherApiKey)
        .set('Content-Type', 'application/json')
        .send({platform: 'test', platformId, person: testPerson})

      expect(cantUpdateResponse.status).toBe(403)
      expect(cantUpdateResponse.body.result).toBe('error')
    })

    test('It should find users', async () => {
      const findResponse = await request(app)
        .get(`/person/${internalUserId}`)
        .set('Auth', apiKey)

      expect(findResponse.status).toBe(200)

      const notFoundResponse = await request(app)
        .get(`/person/not-found`)
        .set('Auth', apiKey)

      expect(notFoundResponse.status).toBe(404)
    })

    test('It should allow a service to find all its users and clear them', async () => {
      const findUsersResponse = await request(app)
        .get(`/person/sync/test`)
        .set('Auth', apiKey)

      expect(findUsersResponse.body.people).toHaveLength(1)

      const badFindUsersResponse = await request(app)
        .get(`/person/sync/bad`)
        .set('Auth', apiKey)

      expect(badFindUsersResponse.status).toBe(403)
      expect(badFindUsersResponse.body.result).toBe('error')

      const clearUsersResponse = await request(app)
        .post(`/person/sync/test`)
        .set('Auth', apiKey)
        .send({people: [internalUserId]})

      expect(clearUsersResponse.status).toBe(200)
      expect(clearUsersResponse.body.deleted).toBe(0)

      const realClearUsersResponse = await request(app)
        .post(`/person/sync/test`)
        .set('Auth', apiKey)
        .send({people: []})

      expect(realClearUsersResponse.status).toBe(200)
      expect(realClearUsersResponse.body.deleted).toBe(1)
    })
  })

  describe('Group API', () => {
    let internalGroupId = ''

    test('It should sync a group')
  })
})

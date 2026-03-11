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
  })

  describe('Person API', () => {
    test('It should sync a person', async () => {
      const platformId = faker.string.uuid()
      const testPerson = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        title: faker.person.prefix(),
        staffCode: 'IP1',
        type: 'staff'
      }

      const initialResponse = await request(app)
        .post('/person/sync')
        .set('Auth', apiKey)
        .set('Content-Type', 'application/json')
        .send({platformId, person: testPerson})

      expect(initialResponse.status).toBe(201)
    })
  })
})

import request from 'supertest'
import { UniqueConstraintError } from 'sequelize'
import app from '../app.js'
import sequelize from '../shared/database/database.js'
import User from '../users/model.js'

const validUser = {
    dni: '0801199912345',
    name: 'Ada Lovelace',
}

beforeAll(async () => {
    await sequelize.sync({ force: true })
})

beforeEach(async () => {
    await User.destroy({ where: {} })
})

afterAll(async () => {
    await sequelize.close()
})

describe('health endpoints', () => {
    test('GET /health returns 200', async () => {
        const response = await request(app).get('/health')

        expect(response.status).toBe(200)
        expect(response.body.status).toBe('ok')
        expect(response.body.version).toBe('test')
    })

    test('GET /ready returns 200 when the database and schema are available', async () => {
        const response = await request(app).get('/ready')

        expect(response.status).toBe(200)
        expect(response.body).toEqual({ status: 'ready' })
    })

    test('GET /ready returns 503 when the database is unavailable', async () => {
        const authenticate = jest
            .spyOn(sequelize, 'authenticate')
            .mockRejectedValue(new Error('database down'))

        const response = await request(app).get('/ready')

        expect(response.status).toBe(503)
        expect(response.body).toEqual({ status: 'not-ready' })
        authenticate.mockRestore()
    })
})

describe('GET /api/users', () => {
    test('returns an empty list when there are no users', async () => {
        const response = await request(app).get('/api/users')

        expect(response.status).toBe(200)
        expect(response.body).toEqual([])
    })

    test('returns all users', async () => {
        await User.create(validUser)

        const response = await request(app).get('/api/users')

        expect(response.status).toBe(200)
        expect(response.body).toHaveLength(1)
        expect(response.body[0]).toMatchObject(validUser)
    })

    test('returns 500 when the database query fails', async () => {
        const findAll = jest.spyOn(User, 'findAll').mockRejectedValue(new Error('boom'))

        const response = await request(app).get('/api/users')

        expect(response.status).toBe(500)
        expect(response.body).toEqual({ error: 'Internal Server Error' })
        findAll.mockRestore()
    })
})

describe('GET /api/users/:id', () => {
    test('returns a user by id', async () => {
        const created = await User.create(validUser)

        const response = await request(app).get(`/api/users/${created.id}`)

        expect(response.status).toBe(200)
        expect(response.body).toMatchObject(validUser)
    })

    test('returns 404 when the user does not exist', async () => {
        const response = await request(app).get('/api/users/999999')

        expect(response.status).toBe(404)
        expect(response.body).toEqual({ error: 'User not found: 999999' })
    })

    test('returns 400 when the id is not a positive integer', async () => {
        const response = await request(app).get('/api/users/not-a-number')

        expect(response.status).toBe(400)
        expect(response.body.errors).toBeDefined()
    })

    test('returns 500 when the database query fails', async () => {
        const findByPk = jest.spyOn(User, 'findByPk').mockRejectedValue(new Error('boom'))

        const response = await request(app).get('/api/users/1')

        expect(response.status).toBe(500)
        expect(response.body).toEqual({ error: 'Internal Server Error' })
        findByPk.mockRestore()
    })
})

describe('POST /api/users', () => {
    test('creates a user and returns 201', async () => {
        const response = await request(app).post('/api/users').send(validUser)

        expect(response.status).toBe(201)
        expect(response.body).toMatchObject(validUser)
        expect(response.body.id).toBeDefined()
    })

    test('returns 400 when the dni already exists', async () => {
        await User.create(validUser)

        const response = await request(app).post('/api/users').send(validUser)

        expect(response.status).toBe(400)
        expect(response.body).toEqual({ error: `User already exists: ${validUser.dni}` })
    })

    test('returns 400 when required fields are missing', async () => {
        const response = await request(app).post('/api/users').send({ dni: '123' })

        expect(response.status).toBe(400)
        expect(response.body.errors).toBeDefined()
    })

    test('returns 400 when the JSON body is invalid', async () => {
        const response = await request(app)
            .post('/api/users')
            .set('Content-Type', 'application/json')
            .send('{"name":')

        expect(response.status).toBe(400)
        expect(response.body).toEqual({ error: 'Invalid JSON payload' })
    })

    test('returns 400 when the unique constraint wins a concurrent race', async () => {
        const findOne = jest.spyOn(User, 'findOne').mockResolvedValue(null)
        const create = jest
            .spyOn(User, 'create')
            .mockRejectedValue(new UniqueConstraintError({ errors: [] }))

        const response = await request(app).post('/api/users').send(validUser)

        expect(response.status).toBe(400)
        expect(response.body).toEqual({ error: `User already exists: ${validUser.dni}` })
        findOne.mockRestore()
        create.mockRestore()
    })

    test('returns 500 when the database query fails', async () => {
        const findOne = jest.spyOn(User, 'findOne').mockRejectedValue(new Error('boom'))

        const response = await request(app).post('/api/users').send(validUser)

        expect(response.status).toBe(500)
        expect(response.body).toEqual({ error: 'Internal Server Error' })
        findOne.mockRestore()
    })
})

describe('unknown routes', () => {
    test('returns 404 with a JSON body', async () => {
        const response = await request(app).get('/api/unknown')

        expect(response.status).toBe(404)
        expect(response.body.error).toContain('Not found')
    })
})

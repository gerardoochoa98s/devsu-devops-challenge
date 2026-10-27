import { validateSchema } from '../shared/middleware/validateSchema.js'

const buildResponse = () => ({
    status: jest.fn().mockReturnThis(),
    send: jest.fn(),
})

describe('validateSchema', () => {
    test('calls next when the payload is valid', async () => {
        const schema = { validate: jest.fn().mockResolvedValue(true) }
        const request = { body: { name: 'Ada' }, query: {}, params: {} }
        const response = buildResponse()
        const next = jest.fn()

        await validateSchema(schema)(request, response, next)

        expect(schema.validate).toHaveBeenCalledWith(
            { body: request.body, query: request.query, params: request.params },
            { abortEarly: false }
        )
        expect(next).toHaveBeenCalledTimes(1)
        expect(response.status).not.toHaveBeenCalled()
    })

    test('returns 400 with Yup details', async () => {
        const inner = [
            { message: 'name is required', path: 'body.name' },
            { message: 'dni is required', path: 'body.dni' },
        ]
        const schema = {
            validate: jest.fn().mockRejectedValue(Object.assign(new Error('invalid'), { inner })),
        }
        const response = buildResponse()

        await validateSchema(schema)({ body: {}, query: {}, params: {} }, response, jest.fn())

        expect(response.status).toHaveBeenCalledWith(400)
        expect(response.send).toHaveBeenCalledWith({
            errors: [
                { message: 'name is required', path: 'body.name' },
                { message: 'dni is required', path: 'body.dni' },
            ],
        })
    })

    test('returns 400 with a generic error when the failure is not a Yup error', async () => {
        const schema = { validate: jest.fn().mockRejectedValue(new Error('plain failure')) }
        const response = buildResponse()

        await validateSchema(schema)({ body: {}, query: {}, params: {} }, response, jest.fn())

        expect(response.status).toHaveBeenCalledWith(400)
        expect(response.send).toHaveBeenCalledWith({
            errors: [{ message: 'plain failure', path: undefined }],
        })
    })
})

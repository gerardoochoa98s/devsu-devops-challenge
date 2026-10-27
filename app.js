import express from 'express'
import helmet from 'helmet'
import config from './config.js'
import sequelize from './shared/database/database.js'
import { usersRouter } from './users/router.js'

const app = express()

app.disable('x-powered-by')
app.use(helmet())
app.use(express.json({ limit: '10kb' }))

app.get('/health', (_request, response) => {
    response.status(200).json({
        status: 'ok',
        version: config.version,
        uptime: process.uptime(),
    })
})

app.get('/ready', async (_request, response) => {
    try {
        await sequelize.authenticate()
        // Readiness must also prove that migrations have run. This prevents the
        // service from receiving traffic before the users table exists.
        await sequelize.query('SELECT 1 FROM users LIMIT 1')
        response.status(200).json({ status: 'ready' })
    } catch {
        response.status(503).json({ status: 'not-ready' })
    }
})

app.use('/api/users', usersRouter)

app.use((request, response) => {
    response.status(404).json({ error: `Not found: ${request.method} ${request.path}` })
})

app.use((error, _request, response, _next) => {
    if (error.type === 'entity.parse.failed') {
        return response.status(400).json({ error: 'Invalid JSON payload' })
    }

    console.error('Unhandled error', error)
    return response.status(500).json({ error: 'Internal Server Error' })
})

export default app

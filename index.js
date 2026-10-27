import app from './app.js'
import config from './config.js'
import sequelize from './shared/database/database.js'

const server = app.listen(config.port, config.host, () => {
    console.log(
        JSON.stringify({
            level: 'info',
            message: 'server started',
            host: config.host,
            port: config.port,
            env: config.env,
            version: config.version,
        })
    )
})

const shutdown = (signal) => {
    console.log(JSON.stringify({ level: 'info', message: 'shutting down', signal }))

    const forceExitTimer = setTimeout(() => {
        console.error('Graceful shutdown timed out, forcing exit')
        process.exit(1)
    }, 10_000)

    forceExitTimer.unref()

    server.close(async (error) => {
        if (error) {
            console.error('Error closing HTTP server', error)
            process.exit(1)
        }

        try {
            await sequelize.close()
        } catch (closeError) {
            console.error('Error closing database connection', closeError)
        }

        clearTimeout(forceExitTimer)
        process.exit(0)
    })
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

import dotenv from 'dotenv'

dotenv.config()

const toBoolean = (value, defaultValue = false) => {
    if (value === undefined) return defaultValue
    return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase())
}

const toInteger = (value, defaultValue) => {
    const parsed = Number.parseInt(value, 10)
    return Number.isNaN(parsed) ? defaultValue : parsed
}

const dialect = (process.env.DB_DIALECT || 'sqlite').toLowerCase()

if (!['sqlite', 'postgres'].includes(dialect)) {
    throw new Error(`Unsupported DB_DIALECT "${dialect}". Use "sqlite" or "postgres".`)
}

const config = {
    env: process.env.NODE_ENV || 'development',
    port: toInteger(process.env.PORT, 8000),
    host: process.env.HOST || '0.0.0.0',
    version: process.env.APP_VERSION || 'dev',
    db: {
        dialect,
        storage: process.env.DB_STORAGE || './dev.sqlite',
        host: process.env.DB_HOST || 'localhost',
        port: toInteger(process.env.DB_PORT, 5432),
        name: process.env.DB_NAME || 'devops',
        user: process.env.DB_USER || 'devops',
        password: process.env.DB_PASSWORD || 'devops',
        ssl: toBoolean(process.env.DB_SSL, false),
        logging: toBoolean(process.env.DB_LOGGING, false),
    },
}

if (config.env === 'production' && dialect === 'postgres') {
    const requiredVariables = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD']
    const missingVariables = requiredVariables.filter((name) => !process.env[name])

    if (missingVariables.length > 0) {
        throw new Error(
            `Missing required environment variables for PostgreSQL: ${missingVariables.join(', ')}`
        )
    }
}

export default config

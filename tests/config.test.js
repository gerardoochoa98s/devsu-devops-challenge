jest.mock('dotenv', () => ({ config: jest.fn() }))

const CONFIG_KEYS = [
    'NODE_ENV',
    'PORT',
    'HOST',
    'APP_VERSION',
    'DB_DIALECT',
    'DB_STORAGE',
    'DB_HOST',
    'DB_PORT',
    'DB_NAME',
    'DB_USER',
    'DB_PASSWORD',
    'DB_SSL',
    'DB_LOGGING',
]

const originalEnvironment = { ...process.env }

const loadConfig = (overrides = {}) => {
    jest.resetModules()

    for (const key of CONFIG_KEYS) {
        delete process.env[key]
    }

    Object.assign(process.env, overrides)

    return require('../config.js').default
}

afterEach(() => {
    for (const key of Object.keys(process.env)) {
        if (!(key in originalEnvironment)) {
            delete process.env[key]
        }
    }

    Object.assign(process.env, originalEnvironment)
    jest.resetModules()
})

describe('config', () => {
    test('uses safe local defaults', () => {
        const config = loadConfig()

        expect(config.env).toBe('development')
        expect(config.port).toBe(8000)
        expect(config.host).toBe('0.0.0.0')
        expect(config.version).toBe('dev')
        expect(config.db.dialect).toBe('sqlite')
        expect(config.db.storage).toBe('./dev.sqlite')
        expect(config.db.ssl).toBe(false)
        expect(config.db.logging).toBe(false)
    })

    test('reads PostgreSQL settings and boolean values', () => {
        const config = loadConfig({
            NODE_ENV: 'production',
            PORT: '9000',
            HOST: '127.0.0.1',
            APP_VERSION: '1.2.3',
            DB_DIALECT: 'postgres',
            DB_HOST: 'postgres',
            DB_PORT: '6543',
            DB_NAME: 'users',
            DB_USER: 'app',
            DB_PASSWORD: 'secret',
            DB_SSL: 'yes',
            DB_LOGGING: '1',
        })

        expect(config.port).toBe(9000)
        expect(config.host).toBe('127.0.0.1')
        expect(config.version).toBe('1.2.3')
        expect(config.db).toMatchObject({
            dialect: 'postgres',
            host: 'postgres',
            port: 6543,
            name: 'users',
            user: 'app',
            password: 'secret',
            ssl: true,
            logging: true,
        })
    })

    test('falls back to defaults for invalid integers and false booleans', () => {
        const config = loadConfig({
            PORT: 'not-a-number',
            DB_PORT: 'also-not-a-number',
            DB_SSL: '0',
            DB_LOGGING: 'off',
        })

        expect(config.port).toBe(8000)
        expect(config.db.port).toBe(5432)
        expect(config.db.ssl).toBe(false)
        expect(config.db.logging).toBe(false)
    })

    test('rejects an unsupported dialect', () => {
        expect(() => loadConfig({ DB_DIALECT: 'mysql' })).toThrow('Unsupported DB_DIALECT "mysql"')
    })

    test('requires PostgreSQL credentials in production', () => {
        expect(() =>
            loadConfig({
                NODE_ENV: 'production',
                DB_DIALECT: 'postgres',
            })
        ).toThrow('Missing required environment variables for PostgreSQL')
    })
})

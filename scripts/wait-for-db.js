import sequelize from '../shared/database/database.js'

const maxAttempts = Number.parseInt(process.env.DB_WAIT_ATTEMPTS || '30', 10)
const delayMs = Number.parseInt(process.env.DB_WAIT_DELAY_MS || '2000', 10)

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds))

const waitForDatabase = async () => {
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        try {
            await sequelize.authenticate()
            console.log(`Database reachable after ${attempt} attempt(s)`)
            await sequelize.close()
            return
        } catch (error) {
            console.log(`Database not ready (attempt ${attempt}/${maxAttempts}): ${error.message}`)
            await sleep(delayMs)
        }
    }

    throw new Error(`Database did not become ready after ${maxAttempts} attempts`)
}

waitForDatabase().catch(async (error) => {
    console.error(error.message)
    await sequelize.close().catch(() => {})
    process.exit(1)
})

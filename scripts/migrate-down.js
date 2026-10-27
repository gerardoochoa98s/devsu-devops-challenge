import { Umzug, SequelizeStorage } from 'umzug'
import sequelize from '../shared/database/database.js'

const umzug = new Umzug({
    migrations: {
        glob: ['migrations/*.js', { cwd: process.cwd() }],
    },
    context: sequelize.getQueryInterface(),
    storage: new SequelizeStorage({ sequelize }),
    logger: console,
})

const run = async () => {
    await sequelize.authenticate()
    const reverted = await umzug.down()

    if (reverted.length === 0) {
        console.log('No migrations to revert')
    } else {
        console.log(`Reverted migration(s): ${reverted.map(({ name }) => name).join(', ')}`)
    }

    await sequelize.close()
}

run().catch(async (error) => {
    console.error('Migration rollback failed', error)
    await sequelize.close().catch(() => {})
    process.exit(1)
})

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

    const applied = await umzug.up()

    if (applied.length === 0) {
        console.log('No pending migrations')
    } else {
        console.log(
            `Applied ${applied.length} migration(s): ${applied.map(({ name }) => name).join(', ')}`
        )
    }

    await sequelize.close()
}

run().catch(async (error) => {
    console.error('Migration failed', error)
    await sequelize.close().catch(() => {})
    process.exit(1)
})

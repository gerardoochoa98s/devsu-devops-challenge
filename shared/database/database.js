import { Sequelize } from 'sequelize'
import config from '../../config.js'

const options = {
    dialect: config.db.dialect,
    logging: config.db.logging ? (message) => console.log(message) : false,
    pool: {
        max: 10,
        min: 0,
        acquire: 30_000,
        idle: 10_000,
    },
}

if (config.db.dialect === 'sqlite') {
    options.storage = config.db.storage
} else {
    options.host = config.db.host
    options.port = config.db.port
    options.database = config.db.name
    options.username = config.db.user
    options.password = config.db.password

    if (config.db.ssl) {
        options.dialectOptions = {
            ssl: {
                require: true,
                // Managed providers usually present certificates signed by a CA that is
                // not in the container trust store. Prefer supplying the CA when possible.
                rejectUnauthorized: false,
            },
        }
    }
}

const sequelize = new Sequelize(options)

export default sequelize

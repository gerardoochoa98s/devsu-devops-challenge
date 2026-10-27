import { DataTypes } from 'sequelize'

export const up = async ({ context: queryInterface }) => {
    await queryInterface.createTable('users', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        dni: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
    })
}

export const down = async ({ context: queryInterface }) => {
    await queryInterface.dropTable('users')
}

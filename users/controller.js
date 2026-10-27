import { UniqueConstraintError } from 'sequelize'
import User from './model.js'

export const listUsers = async (_request, response, next) => {
    try {
        const users = await User.findAll()
        return response.status(200).json(users)
    } catch (error) {
        return next(error)
    }
}

export const getUser = async (request, response, next) => {
    try {
        const { id } = request.params
        const user = await User.findByPk(id)

        if (user === null) {
            return response.status(404).json({ error: `User not found: ${id}` })
        }

        return response.status(200).json(user)
    } catch (error) {
        return next(error)
    }
}

export const createUser = async (request, response, next) => {
    try {
        const userRequest = request.body
        const userExist = await User.findOne({ where: { dni: userRequest.dni } })

        if (userExist !== null) {
            return response.status(400).json({ error: `User already exists: ${userRequest.dni}` })
        }

        const user = await User.create(userRequest)
        return response.status(201).json(user)
    } catch (error) {
        // A concurrent request can win the race between findOne and create.
        // The unique index is the source of truth, so translate it to a 400.
        if (error instanceof UniqueConstraintError) {
            return response.status(400).json({ error: `User already exists: ${request.body.dni}` })
        }

        return next(error)
    }
}

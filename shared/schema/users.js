import * as yup from 'yup'

export const addUserSchema = yup.object({
    body: yup.object({
        name: yup.string().trim().required(),
        dni: yup.string().trim().required(),
    }),
})

export const getUserSchema = yup.object({
    params: yup.object({
        id: yup.number().integer().positive().required(),
    }),
})

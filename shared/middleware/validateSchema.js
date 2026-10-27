export const validateSchema = (schema) => async (request, response, next) => {
    try {
        await schema.validate(
            {
                body: request.body,
                query: request.query,
                params: request.params,
            },
            { abortEarly: false }
        )

        return next()
    } catch (error) {
        const details = Array.isArray(error.inner) ? error.inner : [error]

        return response.status(400).send({
            errors: details.map(({ message, path }) => ({
                message,
                path,
            })),
        })
    }
}

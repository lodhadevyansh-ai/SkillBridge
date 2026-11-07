/**
 * Express middleware helper to validate request body, query, or params with a Zod schema.
 */
export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      const issues = result.error.issues || result.error.errors || []
      const errors = issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }))
      return res.status(400).json({
        success: false,
        message: errors[0]?.message || 'Invalid input data',
        errors,
      })
    }
    req.body = result.data
    next()
  }
}

export function validateQuery(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.query)
    if (!result.success) {
      const issues = result.error.issues || result.error.errors || []
      const errors = issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }))
      return res.status(400).json({
        success: false,
        message: errors[0]?.message || 'Invalid query parameters',
        errors,
      })
    }
    req.query = result.data
    next()
  }
}


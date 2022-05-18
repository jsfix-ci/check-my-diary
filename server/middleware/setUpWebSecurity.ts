import express, { Router } from 'express'
import helmet from 'helmet'

export function setUpWebSecurity(): Router {
  const router = express.Router()

  // Secure code best practice - see:
  // 1. https://expressjs.com/en/advanced/best-practice-security.html,
  // 2. https://www.npmjs.com/package/helmet
  router.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          // Hash allows inline script pulled in from https://github.com/alphagov/govuk-frontend/blob/master/src/govuk/template.njk
          scriptSrc: ["'self'", 'code.jquery.com', "'sha256-QcJ5dQ2VUUeQQKlx77D5mkgIF1YsZYgh3xjzaOtW6lI='"],
          styleSrc: ["'self'", 'code.jquery.com'],
          fontSrc: ["'self'"],
        },
      },
      crossOriginEmbedderPolicy: true,
    }),
  )
  return router
}
export default {
  setUpWebSecurity,
}

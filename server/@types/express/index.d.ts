export default {}

declare module 'express-session' {
  // Declare that the session will potentially contain these additional fields
  interface SessionData {
    returnTo: string
    nowInMinutes: number
  }
}

export declare global {
  namespace Express {
    interface User {
      username: string
      token: string
      authSource: string
      employeeName: string | undefined
    }

    interface Request {
      verified?: boolean
      id: string
      authUrl?: string
      hmppsAuthMFAUser?: boolean
      user: User
    }
  }
}

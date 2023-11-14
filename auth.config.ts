import type { NextAuthConfig } from 'next-auth'

export const authConfig: NextAuthConfig = {
  providers: [],
  pages: {
    signIn: '/login'
  },
  callbacks: {
    authorized ({ auth, request: { nextUrl } }) {
      const isLoggedIn = auth?.user != null
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard')
      if (isOnDashboard) {
        return isLoggedIn
      }
      if (isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl))
      }
      return true
    }
  }
}

'use client'

import { validateBoolean } from '@/lib/utils'
import { useEffect, useState } from 'react'

export function useAuthenticated() {
   const [authenticated, setAuthenticated] = useState(null)

   useEffect(() => {
      try {
         if (typeof window !== 'undefined' && window.localStorage) {
            const cookies = document.cookie.split(';')

            // Find the 'logged-in' cookie safely
            const loggedInCookie = cookies.find((cookie) =>
               cookie.trim().startsWith('logged-in')
            )

            // Ensure loggedInCookie exists before splitting
            const isLoggedIn = loggedInCookie
               ? loggedInCookie.split('=')[1] === 'true'
               : false

            setAuthenticated(isLoggedIn)
         }
      } catch (error) {
         console.error({ error })
      }
   }, [])

   return { authenticated: validateBoolean(authenticated, true) }
}


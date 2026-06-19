import {createContext, useEffect, useState } from "react"
import { getMe } from "./services/auth.api"



export const AuthContext = createContext()

export const AuthProvider = ({children}) => {
    
    const [user , setUser ] = useState(null) 
    const [loading , setLoading ] = useState(true)

    useEffect(() => {
        let isMounted = true

        const getAndSetUser = async () => {
            setLoading(true)

            try {
                const data = await getMe()
                if (isMounted) setUser(data?.user ?? null)
            } catch {
                if (isMounted) setUser(null)
            } finally {
                if (isMounted) setLoading(false)
            }
        }

        getAndSetUser()

        return () => {
            isMounted = false
        }
    }, [])

   return (
        <AuthContext.Provider value = {{ user,setUser,loading,setLoading }} >
            {children}
        </AuthContext.Provider>
    )
    
}


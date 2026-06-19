import { useAuth } from "../hooks/userAuth";
import React from 'react'
import { Navigate, useLocation } from "react-router";

const Protected = ( { children } ) => {

    const {loading , user} = useAuth()
    const location = useLocation()

    if(loading)
    {
        return (<main><p>Loading...</p></main>)
    }

    if(!user)
    {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    return children
}

export default Protected
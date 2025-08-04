import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type {AppContextTypes} from "./Types"
import { useNavigate } from "react-router-dom";
import AuthenticationHook from "./Hooks/AuthenticationHook";

const AppContext = createContext<AppContextTypes | null>(null)

export const useAppContext = () => {
    const ctx = useContext(AppContext)
    if(!ctx) throw new Error("App context provider must be used with AppContextProvider.")
    
    return ctx
} 

interface AppContextProviderProps {
    children: ReactNode;
}

export const AppContextProvider = ({ children }: AppContextProviderProps) => {
    const [width] = useState(window.innerWidth)
    const navigate = useNavigate()

    const authHooks = AuthenticationHook()

    const value = useMemo(() => ({
        width,
        authHooks
    }),[
        width,
        authHooks
    ])

    useEffect(() => {
        if(!authHooks.authData.id){
            navigate("/auth")
            return 
        }

        if(authHooks.authData.onBoarding){
            navigate("/onboarding")
            return
        }


    },[authHooks.authData])
    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}
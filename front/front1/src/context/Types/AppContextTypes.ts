import type { User } from "@/types"
import type { SetStateAction } from "react"

interface AuthHooks{
    createUser: (user_email: string) => Promise<boolean>,
    authData: User
    setAuthData: React.Dispatch<SetStateAction<User>>
    loginUser: (email: string, password:string) => Promise<void>
}

export interface AppContextTypes{
    width: number,
    authHooks: AuthHooks
}
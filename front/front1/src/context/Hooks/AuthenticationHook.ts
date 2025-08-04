import { authApi } from "@/services/authApi"
import type { User, ApiResponse } from "@/types"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"

interface LoginResponse {
    user: User;
    token: string
}

function AuthenticationHook() {
    const navigate = useNavigate()
    const [authData, setAuthData] = useState<User>({
        id: "",
        email: "",
        firstName: "",
        lastName: "",
        role: "CUSTOMER",
        isActive: true,
        profileImageUrl: undefined,
        createdAt: "",
        updatedAt: "",
        onBoarding: true
    })
    const createUser = async (user_email: string): Promise<boolean> => {
        const toastId = toast.loading('Creando cuenta...')

        try {
            const result = await authApi.register({ email: user_email })

            toast.dismiss(toastId)

            if (result.success) {
                toast.success(`Cuenta creada con éxito. Se registró ${user_email} correctamente`)
                return true
            } else {
                throw new Error(result.error || 'Error desconocido.')
            }
        } catch (error) {
            toast.dismiss(toastId)
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
            toast.error(`Error al crear una cuenta de Cinnamon: ${errorMessage}`)
            return false
        }
    }
    
    const loginUser = async (email:string, password: string): Promise<void> => {
        const toastId = toast.loading('Iniciando sesión...')

        try {
            const result = await authApi.login(email, password) as ApiResponse<LoginResponse>
            toast.dismiss(toastId)
            
            if (result.success && result.data?.user) {
                const dataResponse: User = result.data.user
                setAuthData(dataResponse)
                localStorage.setItem("authToken", result.data.token)
                toast.success(`Sesión iniciada con éxito. Bienvenido ${dataResponse.firstName}`)
                navigate("/")
            } else {
                throw new Error(result.error || 'Error desconocido.')
            }
        } catch (error) {
            toast.dismiss(toastId)
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
            toast.error(`Error al iniciar sesión: ${errorMessage}`)
            return 
        }
    }

    return {
        createUser,
        loginUser,
        authData, setAuthData
    }
}

export default AuthenticationHook

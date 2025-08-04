import { useState } from "react"
import "./css/Auth.css"
import "./css/Forms.css"
import Login from "./Login/Login"
import Register from "./Register/Register"

function Auth() {
    const [formOptions, setFormOptions] = useState<"login" | "register">("login")

const switchForm = () => {
    if(formOptions == "register") return setFormOptions("login")
    return setFormOptions("register")
}
  return (
    <div className='auth-container'>
      <div className='form-container'>
        <h2 className="form-title">
          Panel de administración | <span>Cinnamon</span>
        </h2>
        <div className="form-content">
          {formOptions == "login" ? (
            <Login/>
          ) : (
            <Register/>
          )}
        </div>
        <div className="auth-footer">
            <button className="create-account-btn"
                onClick={switchForm}
            >
                {formOptions == "login" ? ("Crear una cuenta") : ("Ya tengo cuenta.")}
            </button>
            <button className="reset-psw-btn">Olvidé mi contraseña</button>
        </div>
      </div>
    </div>
  )
}

export default Auth

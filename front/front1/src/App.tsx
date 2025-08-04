import { Route, Routes } from "react-router-dom"
import "./App.css"
import Auth from "@/pages/Auth/Auth"
import Layout from "./Layout/Layout"
import Management from "./pages/Managment/Management"
import Onboarding from "./pages/Onboarding/Onboarding"

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout/>}>
        <Route path="managment/*" element={<Management/>}/>
      </Route>
      <Route path="/onboarding" element={<Onboarding/>}/>
      <Route path="/auth" element={<Auth/>}/>
    </Routes>
  )
}

export default App
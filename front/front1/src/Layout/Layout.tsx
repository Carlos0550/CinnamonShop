import { Outlet } from "react-router-dom"
import "./css/Layout.css"
import "./css/Navbar.css"
import Navbar from "./Navbar"

function Layout() {
  return (
    <div className="layout-container">
        <Navbar/>
        <div className="layout-content">
            <Outlet/>
        </div>
    </div>
  )
}

export default Layout
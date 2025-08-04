import { useAppContext } from "@/context/AppContext"
import "./css/Navbar.css"
import { useState, useEffect } from "react"

import { Link, useLocation } from "react-router-dom"
import { MenuOutlined, CloseOutlined } from "@ant-design/icons"

function Navbar() {
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)

  const links = [
    { name: "Productos", emoji: "💄", path: "/managment/products" },
    { name: "Categorías", emoji: "📂", path: "/managment/categories" },
    { name: "Banners", emoji: "🖼️", path: "/managment/banners" },
    { name: "Promociones", emoji: "🎉", path: "/managment/promotions" },
    { name: "Gestión", emoji: "⚙️", path: "/managment/settings" },
  ]

  const {
    authHooks: {
      authData
    },
    width
  } = useAppContext()

  const [isMobile] = useState<boolean>(width < 768)
  const [defaultPhoto, setDefaultPhoto] = useState<string>("")
  
  const getDefaultPhoto = async (user_name: string) => {
    try {
      const url = new URL("https://ui-avatars.com/api")
      url.searchParams.append("name", encodeURI(user_name))
      url.searchParams.append("background", "0D8ABC")
      url.searchParams.append("color", "fff")
      url.searchParams.append("size", "200")
      const response = await fetch(url.toString())
      const blob = await response.blob()
      const imageUrl = URL.createObjectURL(blob)
      setDefaultPhoto(imageUrl)
      console.log("defaultPhoto: ", imageUrl)
    } catch (error) {
      console.error("Error generando foto dinámica:", error)
    }
  }

  useEffect(() => {
    if (!authData.profileImageUrl) {
      const fullName = `${authData.firstName} ${authData.lastName || ""}`.trim()
      getDefaultPhoto(fullName)
    } else {
      setDefaultPhoto(authData.profileImageUrl)
    }
  }, [authData.profileImageUrl])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <div className="sidebar-container">
      <div className="sidebar-logo-container">
        <picture className="sidebar-logo">
          <img
            src={defaultPhoto}
            alt="logo"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = "/default-avatar.png"
            }}
          />
        </picture>
        <p>{authData.firstName} {authData.lastName}</p>
        
        {isMobile && (
          <button className="menu-toggle" onClick={toggleMenu}>
            {isMenuOpen ? <CloseOutlined /> : <MenuOutlined />}
          </button>
        )}
      </div>

      <div className="links-container">
        <ul className="sidebar-links">
          {links.map((link, index) => (
            <li key={index} className={`sidebar-link ${location.pathname.startsWith(link.path) ? "active" : ""}`}>
              <Link to={link.path} className="link-content" onClick={isMobile ? closeMenu : undefined}>
                <span className="emoji">{link.emoji}</span>
                <span className="link-text">{link.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {isMobile && (
        <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
          <ul className="sidebar-links">
            {links.map((link, index) => (
              <li key={index} className={`sidebar-link ${location.pathname.startsWith(link.path) ? "active" : ""}`}>
                <Link to={link.path} className="link-content" onClick={closeMenu}>
                  <span className="emoji">{link.emoji}</span>
                  <span className="link-text">{link.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default Navbar
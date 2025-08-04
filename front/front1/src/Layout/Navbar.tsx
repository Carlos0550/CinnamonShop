import { useAppContext } from "@/context/AppContext"
import "./css/Layout.css"
import { useState, useEffect } from "react"
import { Spin } from "antd"
import { LoadingOutlined } from "@ant-design/icons"
import { Link, useLocation } from "react-router-dom"

function Navbar() {
  const location = useLocation()
  
  const links = [
    {name: "Productos", emoji: "💄", path: "/managment/products"},
    {name: "Categorías", emoji: "📂", path: "/managment/categories"},
    {name: "Banners", emoji: "🖼️", path: "/managment/banners"},
    {name: "Promociones", emoji: "🎉", path: "/managment/promotions"},
    {name: "Gestión", emoji: "⚙️", path: "/managment/settings"},
  ]

  const {
    authHooks:{
      authData
    }
  } = useAppContext()

  const [generatingPhoto, setGeneratingPhoto] = useState(true)
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  const generateDinamicPhoto = async(user_name: string) => {
    setGeneratingPhoto(true)
    try {
      setProgress(0)
      
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval)
            return 100
          }
          return prev + 10
        })
      }, 100)

      const url = new URL("https://ui-avatars.com/api")
      url.searchParams.append("name", encodeURI(user_name))
      url.searchParams.append("background", "0D8ABC")
      url.searchParams.append("color", "fff")
      url.searchParams.append("size", "200")
      const response = await fetch(url.toString())
      const blob = await response.blob()
      const imageUrl = URL.createObjectURL(blob)
      
      setTimeout(() => {
        setProfileImageUrl(imageUrl)
        setGeneratingPhoto(false)
        setProgress(0)
      }, 1000)
      
    } catch (error) {
      console.error("Error generando foto dinámica:", error)
      setGeneratingPhoto(false)
      setProgress(0)
    }
  }

  useEffect(() => {
    if (!authData.profileImageUrl) {
      const fullName = `${authData.firstName} ${authData.lastName || ""}`.trim()
      generateDinamicPhoto(fullName)
    } else if (authData.profileImageUrl) {
      setProfileImageUrl(authData.profileImageUrl)
    } 
  }, [authData.profileImageUrl])

  return (
    <div className="sidebar-container">
      <div className="sidebar-logo-container">
        <picture className="sidebar-logo">
          {generatingPhoto ? (
            <Spin
              size="large"
              indicator={<LoadingOutlined style={{ fontSize: 24, color: 'white' }} spin />}
              percent={progress}
            />
          ) : (
            <img 
              src={profileImageUrl || "/default-avatar.png"} 
              alt="logo" 
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = "/default-avatar.png"
              }}
            />
          )}
        </picture>
        <p>Cinnamon Manager</p>
      </div>
      <div className="links-container">
        <ul className="sidebar-links">
          {links.map((link, index) => (
            <li key={index} className={`sidebar-link ${location.pathname.startsWith(link.path) ? "active" : ""}`}>
              <Link to={link.path} className="link-content">
                <span className="emoji">{link.emoji}</span>
                <span className="link-text">{link.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default Navbar
import { Link, useLocation, useNavigate } from "react-router-dom"
import { type ReactNode, useEffect, useState } from "react"

interface PegawaiLayoutProps {
  children: ReactNode
}

export default function PegawaiLayout({ children }: PegawaiLayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [userName, setUserName] = useState("Pegawai")

  useEffect(() => {
    const userStr = localStorage.getItem("user")
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUserName(user.nama || user.username || "Pegawai")
      } catch (err) {
        console.error("Error parsing user data:", err)
      }
    }
  }, [])

  const handleLogout = () => {
    if (confirm("Yakin ingin logout?")) {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      navigate("/login")
    }
  }

  const isActive = (path: string) => {
    return location.pathname === path
  }

   const menuItems = [
     {
       path: "/pegawai/dashboard",
       label: "Dashboard",
       icon: "/images/icons/dashboard.png",
     },
     {
       path: "/pegawai/servis",
       label: "Servis HP",
       icon: "/images/icons/handphone.png",
     },
     {
       path: "/pegawai/barang",
       label: "Barang / Stok",
       icon: "/images/icons/stock.png",
     },
     {
       path: "/pegawai/laporan",
       label: "Laporan",
       icon: "/images/icons/report.png",
     },
   ]

  return (
    <div className="flex bg-gray-50 min-h-screen">
      {/* Sidebar */}
      <aside className="bg-gray-800 text-white w-48 fixed h-screen flex flex-col">
        <div className="p-5 border-b border-gray-700">
          <h2 className="text-2xl font-bold">Service HP</h2>
          <p className="text-sm text-gray-400">Pegawai Panel</p>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded transition-colors ${
                    isActive(item.path)
                      ? "bg-gray-700 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  <img src={item.icon} alt={item.label} className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors text-sm"
          >
            <img
              src="/images/icons/logout.png"
              alt="Logout"
              className="w-5 h-5"
            />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-48 p-8">{children}</main>
    </div>
  )
}

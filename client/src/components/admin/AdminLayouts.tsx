import { Link, useLocation, useNavigate } from "react-router-dom"
import type { ReactNode } from "react"

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()

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
      path: "/admin/dashboard",
      label: "Dashboard",
      icon: "/images/icons/dashboard.png",
    },
    {
      path: "/admin/laporan",
      label: "Laporan",
      icon: "/images/icons/report.png",
    },
    {
      path: "/admin/pegawai",
      label: "Pegawai",
      icon: "/images/icons/staff.png",
    },
  ]

  return (
    <div className="flex bg-gray-100 min-h-screen">
      {/* Sidebar */}
      <aside className="bg-gray-900 text-white w-64 p-5 fixed h-screen overflow-y-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold">SFA Ponsel</h2>
          <p className="text-sm text-gray-400">Admin Panel</p>
        </div>

        <nav>
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <img src={item.icon} alt={item.label} className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Info & Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-5 border-t border-gray-800">
          <div className="mb-3">
            <p className="text-sm text-gray-400">Login atas</p>
            <p className="font-medium">Admin User</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
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
      <main className="flex-1 ml-64 p-8">{children}</main>
    </div>
  )
}

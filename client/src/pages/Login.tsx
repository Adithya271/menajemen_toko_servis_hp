import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"


export default function Login() {
  const navigate = useNavigate()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

 
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault()
  setError("")
  setLoading(true)

  try {
    const res = await fetch("http://localhost:8080/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })

    if (!res.ok) {
      if (res.status === 401) {
        setError("Username atau password salah")
      } else {
        setError("Terjadi kesalahan server")
      }
      return
    }

    const data = await res.json()

    if (!data.token || !data.user?.role) {
      setError("Login gagal: Data tidak valid")
      return
    }

    // Simpan token dan role
    localStorage.setItem("token", data.token)
    localStorage.setItem("role", data.user.role)

    // Redirect sesuai role
    if (data.user.role === "admin") {
      navigate("/admin/dashboard")
    } else if (data.user.role === "pegawai") {
      navigate("/pegawai/dashboard")
    } else {
      setError("Role tidak valid")
      return
    }

    alert("Login berhasil!")
  } catch (err) {
    setError(
      err instanceof Error ? err.message : "Terjadi kesalahan saat login"
    )
  } finally {
    setLoading(false)
  }
}


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-[380px] bg-white shadow-xl rounded-xl p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Welcome Back
        </h1>

        <p className="text-center text-gray-600 mb-6">
          Silakan login untuk melanjutkan
        </p>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Username
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Masukkan username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white py-2 rounded-lg font-semibold transition 
              ${
                loading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }
            `}
          >
            {loading ? "Loading..." : "Login"}
          </button>
         
          <Link
            to="/signup"
            className="w-full text-blue-600 font-semibold mt-3 block text-center">
            Belum punya akun? Daftar
          </Link>
        </form>
      </div>
    </div>
  )
}

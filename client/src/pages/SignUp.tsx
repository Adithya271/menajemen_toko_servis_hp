import { useState } from "react"

export default function SignUp() {
  const [nama, setNama] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    const res = await fetch("http://localhost:8080/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nama, username, password }),
    })

    if (!res.ok) {
      if (res.status === 409) setError("Username sudah digunakan")
      else setError("Gagal register")
      return
    }

    setSuccess("Registrasi berhasil! Silakan login.")
    setNama("")
    setUsername("")
    setPassword("")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-[380px] bg-white rounded-xl shadow p-8">
        <h1 className="text-2xl font-bold text-center mb-4">Sign Up Pegawai</h1>

        {error && <p className="text-red-500 text-center mb-3">{error}</p>}
        {success && (
          <p className="text-green-500 text-center mb-3">{success}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full border px-3 py-2 rounded"
            placeholder="Nama"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            required
          />

          <input
            className="w-full border px-3 py-2 rounded"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <input
            className="w-full border px-3 py-2 rounded"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold">
            Daftar
          </button>
        </form>

        <p className="text-center mt-4 text-sm">
          Sudah punya akun?{" "}
          <a href="/login" className="text-blue-600 font-semibold">
            Login
          </a>
        </p>
      </div>
    </div>
  )
}

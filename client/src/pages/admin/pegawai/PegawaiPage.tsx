import { useEffect, useState } from "react"
import AdminLayout from "../../../components/admin/AdminLayouts"

type Pegawai = {
  id_pegawai: number
  id_user: number
  nama_pegawai: string
  jabatan: string
  alamat?: string
  no_hp?: string
  tanggal_masuk?: string
  status: string
  username?: string
}

type AvailableUser = {
  id_user: number
  nama: string
  username: string
}

export default function AdminPegawaiPage() {
  const [list, setList] = useState<Pegawai[]>([])
  const [availableUsers, setAvailableUsers] = useState<AvailableUser[]>([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [current, setCurrent] = useState<
    Partial<Pegawai & { password?: string }>
  >({
    id_user: 0,
    jabatan: "Kasir",
    alamat: "",
    no_hp: "",
    status: "Aktif",
    password: "",
  })

  const token = localStorage.getItem("token") || ""

  async function fetchPegawai() {
    setLoading(true)
    try {
      const res = await fetch("http://localhost:8080/api/admin/pegawai", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) throw new Error("Gagal mengambil data")

      const data = await res.json()
      setList(data)
    } catch (err) {
      alert(
        "Gagal mengambil data pegawai: " +
          (err instanceof Error ? err.message : String(err))
      )
    } finally {
      setLoading(false)
    }
  }

  async function fetchAvailableUsers() {
    try {
      const res = await fetch(
        "http://localhost:8080/api/admin/pegawai/available-users",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      if (!res.ok) throw new Error("Gagal mengambil data user")

      const data = await res.json()
      setAvailableUsers(data)
    } catch (err) {
      console.error("Error fetch available users:", err)
    }
  }

  useEffect(() => {
    fetchPegawai()
  }, [])

  function openAdd() {
    setIsEdit(false)
    setCurrent({
      id_user: 0,
      jabatan: "Kasir",
      alamat: "",
      no_hp: "",
      status: "Aktif",
      password: "",
    })
    fetchAvailableUsers()
    setShowModal(true)
  }

  function openEdit(p: Pegawai) {
    setIsEdit(true)
    setCurrent({
      ...p,
      password: "",
    })
    setShowModal(true)
  }

  async function handleSave() {
    if (!isEdit && (!current.id_user || current.id_user === 0)) {
      alert("Pegawai harus dipilih!")
      return
    }

    if (!current.jabatan?.trim()) {
      alert("Jabatan wajib diisi!")
      return
    }

    try {
      let url = "http://localhost:8080/api/admin/pegawai"
      let method = "POST"

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const body: any = {
        jabatan: current.jabatan,
        alamat: current.alamat?.trim() || "",
        no_hp: current.no_hp?.trim() || "",
        status: current.status || "Aktif",
      }

      if (isEdit) {
        url = `http://localhost:8080/api/admin/pegawai/${current.id_pegawai}`
        method = "PUT"

        if (current.password && current.password.trim() !== "") {
          if (current.password.length < 6) {
            alert("Password minimal 6 karakter!")
            return
          }
          body.password = current.password.trim()
        }
      } else {
        body.id_user = current.id_user
      }

      console.log(" Sending:", method, url, body)

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const errorData = await res
          .json()
          .catch(() => ({ error: "Unknown error" }))
        throw new Error(
          errorData.error || errorData.message || "Request failed"
        )
      }

      alert(
        isEdit
          ? " Pegawai berhasil diperbarui!"
          : " Pegawai berhasil ditambahkan!"
      )
      setShowModal(false)
      fetchPegawai()
    } catch (err) {
      alert(
        "Gagal menyimpan: " + (err instanceof Error ? err.message : String(err))
      )
    }
  }

  async function handleDelete(id: number) {
    if (
      !confirm(
        "Yakin ingin menghapus pegawai ini?\n\nCatatan: Data user tetap ada, hanya dihapus dari daftar pegawai."
      )
    )
      return

    try {
      const res = await fetch(`http://localhost:8080/api/admin/pegawai/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) throw new Error("Delete failed")

      alert(" Pegawai berhasil dihapus!")
      fetchPegawai()
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      alert("Gagal menghapus pegawai")
    }
  }

  //  Helper function untuk mendapatkan style status
  const getStatusStyle = (status: string) => {
    const normalizedStatus = status.toLowerCase()

    if (normalizedStatus === "aktif") {
      return "bg-green-100 text-green-700"
    } else if (normalizedStatus === "nonaktif") {
      return "bg-red-100 text-red-700"
    }

    return "bg-gray-100 text-gray-700"
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Manajemen Pegawai</h1>
            <p className="text-sm text-gray-600 mt-1">
              Kelola data pegawai yang sudah terdaftar di sistem
            </p>
          </div>
          <button
            onClick={openAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <span></span>
            <span>Tambah Pegawai</span>
          </button>
        </div>

        <div className="bg-white shadow rounded-lg overflow-auto">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Nama</th>
                <th className="p-3 text-left">Username</th>
                <th className="p-3 text-left">Jabatan</th>
                <th className="p-3 text-left">No HP</th>
                <th className="p-3 text-left">Tanggal Masuk</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center">
                    Loading...
                  </td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-gray-500">
                    Belum ada data pegawai
                  </td>
                </tr>
              ) : (
                list.map((p) => (
                  <tr key={p.id_pegawai} className="border-t hover:bg-gray-50">
                    <td className="p-3 font-medium">{p.nama_pegawai}</td>
                    <td className="p-3 text-gray-600">{p.username || "-"}</td>
                    <td className="p-3">{p.jabatan}</td>
                    <td className="p-3">{p.no_hp || "-"}</td>
                    <td className="p-3">{p.tanggal_masuk || "-"}</td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${getStatusStyle(
                          p.status
                        )}`}
                      >
                        {p.status.toLowerCase() === "aktif" ? (
                          <span className="text-green-600">✓</span>
                        ) : (
                          <span className="text-red-600">✗</span>
                        )}
                        {p.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => openEdit(p)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded mr-2 hover:bg-yellow-600 transition text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.id_pegawai)}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition text-sm"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {showModal && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowModal(false)}
            ></div>

            <div className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4">
                <h3 className="text-xl font-semibold">
                  {isEdit ? " Edit Data Pegawai" : " Tambah Pegawai Baru"}
                </h3>
                {!isEdit && (
                  <p className="text-sm text-gray-600 mt-1">
                    Pilih pegawai yang sudah signup untuk ditambahkan ke sistem
                  </p>
                )}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSave()
                }}
                className="p-6"
              >
                <div className="space-y-4">
                  {!isEdit && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <label className="block text-sm font-medium mb-2">
                        Pilih Pegawai <span className="text-red-600">*</span>
                      </label>
                      <select
                        required
                        className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={current.id_user || 0}
                        onChange={(e) =>
                          setCurrent({
                            ...current,
                            id_user: parseInt(e.target.value),
                          })
                        }
                      >
                        <option value={0}>-- Pilih Pegawai --</option>
                        {availableUsers.map((user) => (
                          <option key={user.id_user} value={user.id_user}>
                            {user.nama} (@{user.username})
                          </option>
                        ))}
                      </select>
                      {availableUsers.length === 0 && (
                        <p className="text-xs text-red-600 mt-2">
                          Tidak ada user yang tersedia. User harus signup
                          terlebih dahulu.
                        </p>
                      )}
                      <p className="text-xs text-gray-600 mt-2">
                        Pegawai harus melakukan signup terlebih dahulu agar
                        muncul di list ini
                      </p>
                    </div>
                  )}

                  {isEdit && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <label className="block text-sm font-medium mb-1">
                        Nama Pegawai
                      </label>
                      <input
                        type="text"
                        disabled
                        className="w-full border border-gray-300 px-3 py-2 rounded-lg bg-gray-100"
                        value={current.nama_pegawai || ""}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Nama dan username tidak dapat diubah
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Jabatan <span className="text-red-600">*</span>
                    </label>
                    <select
                      required
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={current.jabatan || "Kasir"}
                      onChange={(e) =>
                        setCurrent({ ...current, jabatan: e.target.value })
                      }
                    >
                      <option value="Kasir">Kasir</option>
                      <option value="Teknisi">Teknisi</option>
                    </select>
                  </div>

                  {isEdit && (
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Password{" "}
                        <span className="text-xs text-gray-500 font-normal">
                          (Kosongkan jika tidak ingin mengubah)
                        </span>
                      </label>
                      <input
                        type="password"
                        minLength={6}
                        className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={current.password || ""}
                        onChange={(e) =>
                          setCurrent({ ...current, password: e.target.value })
                        }
                        placeholder="Minimal 6 karakter"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      No HP
                    </label>
                    <input
                      type="tel"
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={current.no_hp || ""}
                      onChange={(e) =>
                        setCurrent({ ...current, no_hp: e.target.value })
                      }
                      placeholder="Contoh: 081234567890"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Alamat
                    </label>
                    <textarea
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      value={current.alamat || ""}
                      onChange={(e) =>
                        setCurrent({ ...current, alamat: e.target.value })
                      }
                      placeholder="Masukkan alamat lengkap"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Status <span className="text-red-600">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          setCurrent({ ...current, status: "Aktif" })
                        }
                        className={`px-4 py-3 rounded-lg border-2 transition-all ${
                          current.status === "Aktif"
                            ? "border-green-500 bg-green-50 text-green-700 font-semibold"
                            : "border-gray-300 bg-white text-gray-700 hover:border-green-300"
                        }`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <span
                            className={`text-xl ${
                              current.status === "Aktif"
                                ? "text-green-600"
                                : "text-gray-400"
                            }`}
                          >
                            ✓
                          </span>
                          <span>Aktif</span>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setCurrent({ ...current, status: "Nonaktif" })
                        }
                        className={`px-4 py-3 rounded-lg border-2 transition-all ${
                          current.status === "Nonaktif"
                            ? "border-red-500 bg-red-50 text-red-700 font-semibold"
                            : "border-gray-300 bg-white text-gray-700 hover:border-red-300"
                        }`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <span
                            className={`text-xl ${
                              current.status === "Nonaktif"
                                ? "text-red-600"
                                : "text-gray-400"
                            }`}
                          >
                            ✗
                          </span>
                          <span>Nonaktif</span>
                        </div>
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Pegawai nonaktif tidak dapat login ke sistem
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                  <button
                    type="button"
                    className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                    onClick={() => setShowModal(false)}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                  >
                    {isEdit ? "Simpan Perubahan" : "Tambah Pegawai"}
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  )
}

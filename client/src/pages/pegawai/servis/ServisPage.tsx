import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import PegawaiLayout from "../../../components/pegawai/PegawaiLayouts"

type Servis = {
  id_servis: number
  nama_pelanggan: string
  tipe_hp: string
  keluhan: string
  status_servis: string
  biaya_total: number
  tanggal_masuk: string
  tanggal_selesai: string
}

export default function PegawaiServisPage() {
  const navigate = useNavigate()
  const [list, setList] = useState<Servis[]>([])
  const [loading, setLoading] = useState(false)

  // ============================
  // FETCH SERVIS (PAKAI TOKEN)
  // ============================
  async function fetchServis() {
    setLoading(true)

    try {
      const token = localStorage.getItem("token") || ""

      const res = await fetch("http://localhost:8080/api/pegawai/servis", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) throw new Error("Gagal mengambil data")

      const data = await res.json()

      if (!Array.isArray(data)) {
        console.error("API bukan array:", data)
        throw new Error("Invalid response format")
      }

      setList(data)
    } catch (err) {
      alert(
        "Gagal mengambil data servis: " +
          (err instanceof Error ? err.message : String(err))
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServis()
  }, [])

  // ============================
  // NAVIGASI
  // ============================
  const openAdd = () => navigate("/pegawai/servis/tambah")
  const openEdit = (s: Servis) =>
    navigate(`/pegawai/servis/edit/${s.id_servis}`)
  const openDetail = (s: Servis) =>
    navigate(`/pegawai/servis/detail/${s.id_servis}`)

  // ============================
  // DELETE SERVIS
  // ============================
  async function handleDelete(id: number) {
    if (!confirm("Yakin ingin menghapus servis ini?")) return

    try {
      const token = localStorage.getItem("token") || ""

      const res = await fetch(
        `http://localhost:8080/api/pegawai/servis/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!res.ok) throw new Error("Delete failed")

      alert("Servis berhasil dihapus!")
      fetchServis()
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      alert("Gagal menghapus servis")
    }
  }

  // ============================
  // FORMAT RUPIAH
  // ============================
  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num)
  }

  const getStatusColor = (status: string) => {
    // Normalize status (handle both spaces and underscores)
    const normalizedStatus = status.toLowerCase().replace(/ /g, "_")

    switch (normalizedStatus) {
      case "pending":
        return "bg-orange-100 text-orange-700"
      case "dalam_perbaikan":
        return "bg-yellow-100 text-yellow-700"
      case "selesai":
        return "bg-green-100 text-green-700"
      case "siap_diambil":
        return "bg-blue-100 text-blue-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  // ============================
  // FORMAT DISPLAY STATUS
  // ============================
  const formatStatus = (status: string) => {
    return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  }

  // ============================
  // RENDER
  // ============================
  return (
    <PegawaiLayout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Kelola Servis HP</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manajemen servis dan perbaikan HP
            </p>
          </div>
          <button
            onClick={openAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            + Tambah Servis
          </button>
        </div>

        <div className="bg-white shadow rounded-lg overflow-auto">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Nama Pelanggan</th>
                <th className="p-3 text-left">Tipe HP</th>
                <th className="p-3 text-left">Keluhan</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-right">Biaya</th>
                <th className="p-3 text-left">Tanggal Masuk</th>
                <th className="p-3 text-left">Tanggal Selesai</th>
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
                    Belum ada data servis
                  </td>
                </tr>
              ) : (
                list.map((s) => (
                  <tr key={s.id_servis} className="border-t hover:bg-gray-50">
                    <td className="p-3 font-medium">{s.nama_pelanggan}</td>
                    <td className="p-3">{s.tipe_hp}</td>
                    <td className="p-3">
                      <div className="max-w-xs truncate" title={s.keluhan}>
                        {s.keluhan}
                      </div>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                          s.status_servis
                        )}`}
                      >
                        {formatStatus(s.status_servis)}
                      </span>
                    </td>
                    <td className="p-3 text-right font-medium">
                      {formatRupiah(s.biaya_total)}
                    </td>
                    <td className="p-3 text-sm">
                      {new Date(s.tanggal_masuk).toLocaleDateString("id-ID")}
                    </td>
                    <td className="p-3 text-sm">
                      {new Date(s.tanggal_selesai).toLocaleDateString("id-ID")}
                    </td>

                    <td className="p-3 text-center whitespace-nowrap">
                      <button
                        onClick={() => openDetail(s)}
                        className="bg-blue-500 text-white px-3 py-1 rounded mr-1 hover:bg-blue-600 transition text-sm"
                      >
                        Detail
                      </button>
                      <button
                        onClick={() => openEdit(s)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded mr-1 hover:bg-yellow-600 transition text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(s.id_servis)}
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
      </div>
    </PegawaiLayout>
  )
}

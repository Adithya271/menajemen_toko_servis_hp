import { useState, useEffect } from "react"
import AdminLayout from "../../../components/admin/AdminLayouts"
import { generateLaporanPdf } from "./utils/laporanPdf"

interface Laporan {
  id_laporan: number
  judul_laporan: string
  jenis_laporan: string
  tanggal_awal: string
  tanggal_akhir: string
  total_servis: number
  total_pendapatan: number
  total_modal: number
  laba_bersih: number
  keterangan?: string
  created_at: string
}

interface DetailServis {
  id_detail: number
  nama_pelanggan: string
  tipe_hp: string
  status_servis: string
  biaya_total: number
  laba_servis: number
}

interface LaporanDetail extends Laporan {
  detail_servis?: DetailServis[]
}

export default function LaporanAdminPage() {
  const [laporanList, setLaporanList] = useState<Laporan[]>([])
  const [selectedLaporan, setSelectedLaporan] = useState<LaporanDetail | null>(
    null,
  )
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [loading, setLoading] = useState(true)

  // Form state
  const [jenisLaporan, setJenisLaporan] = useState("harian")
  const [tanggalAwal, setTanggalAwal] = useState("")
  const [tanggalAkhir, setTanggalAkhir] = useState("")
  const [keterangan, setKeterangan] = useState("")

  useEffect(() => {
    fetchLaporanList()
  }, [])

  const fetchLaporanList = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(
        "http://localhost:8080/api/admin/laporan",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      if (!response.ok) throw new Error("Failed to fetch")

      const data = await response.json()
      setLaporanList(data || [])
    } catch (error) {
      console.error("Error:", error)
      setLaporanList([])
    } finally {
      setLoading(false)
    }
  }

  const fetchLaporanDetail = async (id: number) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(
        `http://localhost:8080/api/admin/laporan/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      if (!response.ok) throw new Error("Failed to fetch detail")

      const data = await response.json()
      setSelectedLaporan(data)
      setShowDetailModal(true)
    } catch (error) {
      console.error("Error:", error)
      alert("Gagal memuat detail laporan")
    }
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!tanggalAwal || !tanggalAkhir) {
      alert("Tanggal harus diisi!")
      return
    }

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(
        "http://localhost:8080/api/admin/laporan",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jenis_laporan: jenisLaporan,
            tanggal_awal: tanggalAwal,
            tanggal_akhir: tanggalAkhir,
            keterangan: keterangan,
          }),
        },
      )

      if (!response.ok) throw new Error("Failed to generate")

      const data = await response.json()
      alert(data.message || "Laporan berhasil dibuat!")

      setShowGenerateModal(false)
      resetForm()
      fetchLaporanList()
    } catch (error) {
      console.error("Error:", error)
      alert("Gagal membuat laporan")
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus laporan ini?")) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(
        `http://localhost:8080/api/admin/laporan/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      if (!response.ok) throw new Error("Failed to delete")

      alert("Laporan berhasil dihapus")
      fetchLaporanList()
    } catch (error) {
      console.error("Error:", error)
      alert("Gagal menghapus laporan")
    }
  }

  const resetForm = () => {
    setJenisLaporan("harian")
    setTanggalAwal("")
    setTanggalAkhir("")
    setKeterangan("")
  }

  const setQuickDate = (type: string) => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, "0")
    const day = String(today.getDate()).padStart(2, "0")

    if (type === "today") {
      const todayStr = `${year}-${month}-${day}`
      setTanggalAwal(todayStr)
      setTanggalAkhir(todayStr)
      setJenisLaporan("harian")
    } else if (type === "week") {
      const weekAgo = new Date(today)
      weekAgo.setDate(weekAgo.getDate() - 7)
      const weekAgoStr = `${weekAgo.getFullYear()}-${String(
        weekAgo.getMonth() + 1,
      ).padStart(2, "0")}-${String(weekAgo.getDate()).padStart(2, "0")}`
      setTanggalAwal(weekAgoStr)
      setTanggalAkhir(`${year}-${month}-${day}`)
      setJenisLaporan("mingguan")
    } else if (type === "month") {
      const firstDay = `${year}-${month}-01`
      const lastDay = new Date(year, parseInt(month), 0).getDate()
      setTanggalAwal(firstDay)
      setTanggalAkhir(`${year}-${month}-${lastDay}`)
      setJenisLaporan("bulanan")
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  const getJenisLabel = (jenis: string) => {
    const labels: Record<string, string> = {
      harian: " Harian",
      mingguan: " Mingguan",
      bulanan: " Bulanan",
      custom: " Custom",
    }
    return labels[jenis] || jenis
  }

  // Tambahkan fungsi helper untuk status color
  const getStatusColor = (status: string) => {
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

  // Format status display
  const formatStatus = (status: string) => {
    return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat laporan...</p>
        </div>
      </div>
    )
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-2">
              <img
                src="/images/icons/report.png"
                alt="Report"
                className="w-10 h-10"
              />
              <h1 className="text-3xl font-bold">Laporan</h1>
            </div>
            <p className="text-purple-100">
              Kelola dan generate laporan servis HP
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Action Button */}
          <div className="mb-6">
            <button
              onClick={() => setShowGenerateModal(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all flex items-center gap-2"
            >
              <img src="/images/icons/plus.png" alt="Add" className="w-5 h-5" />
              Generate Laporan Baru
            </button>
          </div>

          {/* Laporan List */}
          {laporanList.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <span className="text-6xl mb-4 block">📋</span>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Belum Ada Laporan
              </h3>
              <p className="text-gray-600 mb-6">
                Mulai dengan membuat laporan baru
              </p>
              <button
                onClick={() => setShowGenerateModal(true)}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
              >
                Buat Laporan
              </button>
            </div>
          ) : (
            <div className="grid gap-6">
              {laporanList.map((laporan) => (
                <div
                  key={laporan.id_laporan}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">
                            {getJenisLabel(laporan.jenis_laporan).split(" ")[0]}
                          </span>
                          <h3 className="text-xl font-bold text-gray-800">
                            {laporan.judul_laporan}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-600">
                          Periode: {formatDate(laporan.tanggal_awal)} -{" "}
                          {formatDate(laporan.tanggal_akhir)}
                        </p>
                        {laporan.keterangan && (
                          <div className="flex items-start gap-2 mt-2">
                            <img
                              src="/images/icons/comments.png"
                              alt="Info"
                              className="w-4 h-4 mt-0.5 flex-shrink-0"
                            />
                            <p className="text-sm text-gray-500">
                              {laporan.keterangan}
                            </p>
                          </div>
                        )}
                      </div>
                      <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                        {getJenisLabel(laporan.jenis_laporan)}
                      </span>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-xs text-blue-600 mb-1">
                          Total Servis
                        </p>
                        <p className="text-2xl font-bold text-blue-900">
                          {laporan.total_servis}
                        </p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-xs text-green-600 mb-1">
                          Total Pendapatan
                        </p>
                        <p className="text-lg font-bold text-green-900">
                          {formatCurrency(laporan.total_pendapatan)}
                        </p>
                      </div>
                      <div className="bg-red-50 p-4 rounded-lg">
                        <p className="text-xs text-red-600 mb-1">Modal</p>
                        <p className="text-lg font-bold text-red-900">
                          {formatCurrency(laporan.total_modal)}
                        </p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <p className="text-xs text-purple-600 mb-1">
                          Laba Bersih
                        </p>
                        <p className="text-lg font-bold text-purple-900">
                          {formatCurrency(laporan.laba_bersih)}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => fetchLaporanDetail(laporan.id_laporan)}
                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold flex items-center justify-center gap-2"
                      >
                        <img
                          src="/images/icons/eye.png"
                          alt="View"
                          className="w-5 h-5"
                        />
                        Lihat Detail
                      </button>
                      <button
                        onClick={() => handleDelete(laporan.id_laporan)}
                        className="px-6 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition font-semibold flex items-center justify-center gap-2"
                      >
                        <img
                          src="/images/icons/bin.png"
                          alt="Delete"
                          className="w-5 h-5"
                        />
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Generate Modal */}
        {showGenerateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800">
                  Generate Laporan Baru
                </h2>
              </div>

              <form onSubmit={handleGenerate} className="p-6 space-y-6">
                {/* Quick Actions */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Quick Select
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setQuickDate("today")}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                    >
                      Hari Ini
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickDate("week")}
                      className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
                    >
                      Minggu Ini
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickDate("month")}
                      className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition"
                    >
                      Bulan Ini
                    </button>
                  </div>
                </div>

                {/* Jenis Laporan */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Jenis Laporan
                  </label>
                  <select
                    value={jenisLaporan}
                    onChange={(e) => setJenisLaporan(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                  >
                    <option value="harian">Harian</option>
                    <option value="mingguan">Mingguan</option>
                    <option value="bulanan">Bulanan</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                {/* Tanggal */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tanggal Awal
                    </label>
                    <input
                      type="date"
                      value={tanggalAwal}
                      onChange={(e) => setTanggalAwal(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tanggal Akhir
                    </label>
                    <input
                      type="date"
                      value={tanggalAkhir}
                      onChange={(e) => setTanggalAkhir(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Keterangan */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Keterangan (Opsional)
                  </label>
                  <textarea
                    value={keterangan}
                    onChange={(e) => setKeterangan(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                    placeholder="Tambahkan catatan untuk laporan ini..."
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowGenerateModal(false)
                      resetForm()
                    }}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition font-semibold"
                  >
                    Generate Laporan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && selectedLaporan && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">
                  {selectedLaporan.judul_laporan}
                </h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Info Periode */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600 mb-1">Periode Laporan</p>
                  <p className="text-lg font-bold text-blue-900">
                    {formatDate(selectedLaporan.tanggal_awal)} -{" "}
                    {formatDate(selectedLaporan.tanggal_akhir)}
                  </p>
                  {selectedLaporan.keterangan && (
                    <p className="text-sm text-gray-600 mt-2">
                      {selectedLaporan.keterangan}
                    </p>
                  )}
                </div>

                {/* Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-blue-600 mb-2">Total Servis</p>
                    <p className="text-3xl font-bold text-blue-900">
                      {selectedLaporan.total_servis}
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-green-600 mb-2">
                      Total Pendapatan
                    </p>
                    <p className="text-xl font-bold text-green-900">
                      {formatCurrency(selectedLaporan.total_pendapatan)}
                    </p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-red-600 mb-2">Modal</p>
                    <p className="text-xl font-bold text-red-900">
                      {formatCurrency(selectedLaporan.total_modal)}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-purple-600 mb-2">Laba Bersih</p>
                    <p className="text-xl font-bold text-purple-900">
                      {formatCurrency(selectedLaporan.laba_bersih)}
                    </p>
                  </div>
                </div>

                {/* Detail Servis Table */}
                {selectedLaporan.detail_servis &&
                  selectedLaporan.detail_servis.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-4">
                        Detail Servis
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="text-left p-3 border">No</th>
                              <th className="text-left p-3 border">
                                Pelanggan
                              </th>
                              <th className="text-left p-3 border">Tipe HP</th>
                              <th className="text-center p-3 border">Status</th>
                              <th className="text-right p-3 border">
                                Pendapatan
                              </th>
                              <th className="text-right p-3 border">Laba</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedLaporan.detail_servis.map(
                              (detail, idx) => (
                                <tr
                                  key={detail.id_detail}
                                  className="hover:bg-gray-50"
                                >
                                  <td className="p-3 border">{idx + 1}</td>
                                  <td className="p-3 border font-medium">
                                    {detail.nama_pelanggan}
                                  </td>
                                  <td className="p-3 border">
                                    {detail.tipe_hp}
                                  </td>
                                  <td className="p-3 border text-center">
                                    <span
                                      className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                                        detail.status_servis,
                                      )}`}
                                    >
                                      {formatStatus(detail.status_servis)}
                                    </span>
                                  </td>
                                  <td className="p-3 border text-right font-semibold">
                                    {formatCurrency(detail.biaya_total)}
                                  </td>
                                  <td className="p-3 border text-right font-semibold text-green-600">
                                    {formatCurrency(detail.laba_servis)}
                                  </td>
                                </tr>
                              ),
                            )}
                          </tbody>
                          <tfoot className="bg-purple-50 font-bold">
                            <tr>
                              <td colSpan={4} className="text-right p-3 border">
                                Total:
                              </td>
                              <td className="text-right p-3 border">
                                {formatCurrency(
                                  selectedLaporan.total_pendapatan,
                                )}
                              </td>
                              <td className="text-right p-3 border text-green-600">
                                {formatCurrency(selectedLaporan.laba_bersih)}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  )}
              </div>

              <div className="p-6 border-t border-gray-200 flex gap-3">
                <button
                  onClick={() => generateLaporanPdf(selectedLaporan)}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-semibold"
                >
                  Cetak PDF
                </button>

                <button
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition font-semibold"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

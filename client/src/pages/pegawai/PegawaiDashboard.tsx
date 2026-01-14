import { useState, useEffect } from "react"
import PegawaiLayout from "../../components/pegawai/PegawaiLayouts"
import {
  Home,
  Wrench,
  Package,
  TrendingUp,
  AlertCircle,
} from "lucide-react"

interface DashboardStats {
  total_servis_hari_ini: number
  servis_dalam_perbaikan: number
  servis_selesai: number
  stok_menipis: number
  total_pendapatan_hari_ini: number
  total_pendapatan_bulan_ini: number
  servis_hari_ini: Array<{
    id_servis: number
    nama_pelanggan: string
    tipe_hp: string
    status_servis: string
  }>
  barang_menipis: Array<{
    id_barang: number
    nama_barang: string
    stok: number
  }>
}

export default function PegawaiDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
    // Refresh setiap 30 detik
    const interval = setInterval(fetchDashboardData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token")

      // Call real API
      const response = await fetch(
        "http://localhost:8080/api/pegawai/dashboard-stats",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data")
      }

      const data = await response.json()
      setStats(data)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching dashboard:", error)

      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    const colors = {
      pending: "bg-orange-100 text-orange-700",
      dalam_perbaikan: "bg-blue-100 text-blue-700",
      selesai: "bg-green-100 text-green-700",
      siap_diambil: "bg-purple-100 text-purple-700",
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-700"
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: "Pending",
      dalam_perbaikan: "Dalam Perbaikan",
      selesai: "Selesai",
      siap_diambil: "Siap Diambil",
    }
    return labels[status as keyof typeof labels] || status
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <PegawaiLayout>
      <div className="flex min-h-screen bg-gray-50">
        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Dashboard Pegawai
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Selamat datang di sistem management service HP
            </p>
          </div>

          {/* Stats Cards */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Servis Hari Ini */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-blue-100 text-sm mb-1">
                      Total Servis Hari Ini
                    </p>
                    <h3 className="text-4xl font-bold">
                      {stats?.total_servis_hari_ini || 0}
                    </h3>
                  </div>
                  <Home size={32} className="text-blue-200" />
                </div>
                <div className="flex items-center gap-2 text-blue-100 text-sm">
                  <TrendingUp size={16} />
                  <span>Real-time data</span>
                </div>
              </div>

              {/* Servis Dalam Perbaikan */}
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-amber-100 text-sm mb-1">
                      Servis Dalam Perbaikan
                    </p>
                    <h3 className="text-4xl font-bold">
                      {stats?.servis_dalam_perbaikan || 0}
                    </h3>
                  </div>
                  <Wrench size={32} className="text-amber-200" />
                </div>
                <div className="flex items-center gap-2 text-amber-100 text-sm">
                  <AlertCircle size={16} />
                  <span>Perlu dikerjakan</span>
                </div>
              </div>

              {/* Servis Selesai */}
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-green-100 text-sm mb-1">
                      Servis Selesai
                    </p>
                    <h3 className="text-4xl font-bold">
                      {stats?.servis_selesai || 0}
                    </h3>
                  </div>
                  <svg
                    className="w-8 h-8 text-green-200"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="flex items-center gap-2 text-green-100 text-sm">
                  <TrendingUp size={16} />
                  <span>Real time data</span>
                </div>
              </div>

              {/* Stok Menipis */}
              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-red-100 text-sm mb-1">
                      Stok Barang Menipis/Habis
                    </p>
                    <h3 className="text-4xl font-bold">
                      {stats?.stok_menipis || 0}
                    </h3>
                  </div>
                  <Package size={32} className="text-red-200" />
                </div>
                <div className="flex items-center gap-2 text-red-100 text-sm">
                  <AlertCircle size={16} />
                  <span>Perlu restock</span>
                </div>
              </div>
            </div>

            {/* Pendapatan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <img
                    src="/images/icons/salary.png"
                    alt="Money"
                    className="w-6 h-6"
                  />
                  Pendapatan Hari Ini
                </h3>
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {formatCurrency(stats?.total_pendapatan_hari_ini || 0)}
                </div>
                <p className="text-sm text-gray-600">
                  Dari {stats?.total_servis_hari_ini || 0} transaksi
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <img
                    src="/images/icons/barchart.png"
                    alt="Barchart"
                    className="w-6 h-6"
                  />
                  Pendapatan Bulan Ini
                </h3>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {formatCurrency(stats?.total_pendapatan_bulan_ini || 0)}
                </div>
               
              </div>
            </div>

            {/* Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Servis Hari Ini */}
              <div className="bg-white rounded-xl shadow-md border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="font-bold text-gray-800 text-lg">
                    Servis Hari Ini
                  </h3>
                </div>
                <div className="p-6">
                  {stats?.servis_hari_ini &&
                  stats.servis_hari_ini.length > 0 ? (
                    <div className="space-y-3">
                      {stats.servis_hari_ini.map((servis) => (
                        <div
                          key={servis.id_servis}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                        >
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800">
                              {servis.nama_pelanggan}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {servis.tipe_hp}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                              servis.status_servis
                            )}`}
                          >
                            {getStatusLabel(servis.status_servis)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Wrench
                        size={48}
                        className="mx-auto mb-3 text-gray-300"
                      />
                      <p>Belum ada servis hari ini</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Stok Barang */}
              <div className="bg-white rounded-xl shadow-md border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="font-bold text-gray-800 text-lg">
                    Stok Barang
                  </h3>
                </div>
                <div className="p-6">
                  {stats?.barang_menipis && stats.barang_menipis.length > 0 ? (
                    <div className="space-y-3">
                      {stats.barang_menipis.map((barang) => (
                        <div
                          key={barang.id_barang}
                          className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                              <Package size={20} className="text-red-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-800">
                                {barang.nama_barang}
                              </h4>
                              <p className="text-sm text-red-600">
                                Stok menipis!
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-2xl font-bold text-red-600">
                              {barang.stok}
                            </span>
                            <p className="text-xs text-gray-600">unit</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Package
                        size={48}
                        className="mx-auto mb-3 text-gray-300"
                      />
                      <p>Stok barang aman</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PegawaiLayout>
  )
}

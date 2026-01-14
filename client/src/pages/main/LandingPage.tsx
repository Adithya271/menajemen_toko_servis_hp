import { useState } from "react"


interface ServiceDetail {
  id_detail: number
  id_servis: number
  id_barang: number | null
  deskripsi: string
  jumlah: number
  harga_satuan: number
  biaya: number
}

interface Service {
  id_servis: number
  nama_pelanggan: string
  no_whatsapp: string
  tipe_hp: string
  keluhan: string
  status_servis: string
  biaya_total: number
  tanggal_masuk: string
  tanggal_selesai: string | null
  detail: ServiceDetail[]
}

export default function LandingPage() {
  const [searchName, setSearchName] = useState("")
  const [searchPhone, setSearchPhone] = useState("")
  const [results, setResults] = useState<Service[]>([])
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const getStatusInfo = (status: string) => {
    const statusMap: {
      [key: string]: { label: string; color: string; icon: string }
    } = {
      pending: {
        label: "Pending",
        color: "bg-orange-100 text-orange-700",
        icon: "/images/icons/pending.png",
      },
      dalam_perbaikan: {
        label: "Dalam Perbaikan",
        color: "bg-yellow-100 text-yellow-700",
        icon: "/images/icons/repair.png",
      },
      selesai: {
        label: "Selesai",
        color: "bg-green-100 text-green-700",
        icon: "/images/icons/done.png",
      },
      siap_diambil: {
        label: "Siap Diambil",
        color: "bg-blue-100 text-blue-700",
        icon: "/images/icons/ready.png",
      },
    }
    return (
      statusMap[status] || {
        label: status,
        color: "bg-gray-100 text-gray-700",
        icon: "/images/icons/pending.png",
      }
    )
  }

  const searchService = async () => {
    if (!searchName && !searchPhone) {
      setError("Masukkan nama atau nomor WhatsApp")
      return
    }

    setLoading(true)
    setError("")

    try {
      const params = new URLSearchParams()
      if (searchName) params.append("name", searchName)
      if (searchPhone) params.append("phone", searchPhone)

      const response = await fetch(
        `http://localhost:8080/api/servis/search?${params}`
      )

      if (!response.ok) {
        throw new Error("Gagal mencari data servis")
      }

      const data = await response.json()
      setResults(data)
      setShowResults(true)
      setShowDetails(false)
    } catch (err) {
      setError("Terjadi kesalahan saat mencari data")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleShowDetails = (serviceId: number) => {
    const service = results.find((s) => s.id_servis === serviceId)
    if (service) {
      setSelectedService(service)
      setShowDetails(true)
    }
  }

  const closeDetails = () => {
    setShowDetails(false)
    setSelectedService(null)
  }

  return (
    <div className="bg-gray-50">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .float-animation {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .fade-in-up {
          animation: fadeInUp 0.6s ease-out;
        }
        .gradient-bg {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .glass-effect {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
      `}</style>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-700 via-indigo-700 to-purple-900 text-white">
        {/* Background blur */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-[28rem] h-[28rem] bg-purple-300/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-24">
          {/* Heading */}
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight">
              Toko Service Handphone
            </h1>
            <p className="mt-5 text-lg md:text-xl text-purple-100">
              Solusi profesional untuk perbaikan, layanan digital, dan suku
              cadang handphone Anda
            </p>
          </div>

          {/* Cards */}
          <div className="grid gap-8 md:grid-cols-3">
            {/* Card 1 */}
            <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 p-8 transition-all hover:-translate-y-1 hover:shadow-2xl">
              <img
                src="/images/icons/service.png"
                className="w-15 h-15 mx-auto mb-4"
              />
              <h3 className="text-center text-xl font-semibold mb-3">
                Layanan Digital
              </h3>
              <ul className="space-y-2 text-sm text-purple-100">
                <li>* BRI Link</li>
                <li>* Isi Pulsa & Paket Data</li>
              </ul>
            </div>

            {/* Card 2 */}
            <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 p-8 transition-all hover:-translate-y-1 hover:shadow-2xl">
              <img
                src="/images/icons/handphone.png"
                className="w-15 h-15 mx-auto mb-4"
              />
              <h3 className="text-center text-xl font-semibold mb-3">
                Service Handphone
              </h3>
              <p className="text-sm text-purple-100 mb-4">
                Melayani berbagai tipe dan merek handphone
              </p>

              <ul className="grid grid-cols-2 gap-y-2 text-sm text-purple-100">
                <li>* Ganti LCD</li>
                <li>* Ganti Baterai</li>
                <li>* Bootloop</li>
                <li>* Lupa Pola</li>
                <li>* Program Ulang</li>
                <li>* Ganti Tombol</li>
                <li>* Ganti Port Cas</li>
                <li>* Kerusakan Air</li>
              </ul>
            </div>

            {/* Card 3 */}
            <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 p-8 transition-all hover:-translate-y-1 hover:shadow-2xl">
              <img
                src="/images/icons/spare-parts.png"
                className="w-15 h-15 mx-auto mb-4"
              />
              <h3 className="text-center text-xl font-semibold mb-3">
                Suku Cadang
              </h3>
              <p className="text-sm text-purple-100">
                Tersedia suku cadang original dan berkualitas tinggi dengan
                harga bersaing
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Track Service Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Pencarian & Status Servis HP
            </h2>
            <p className="text-gray-600">
              Cek status perbaikan HP Anda dengan mudah
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-8 rounded-3xl shadow-xl">
            {/* Search Form */}
            <div className="mb-8">
              <div className="bg-white p-6 rounded-2xl shadow-md">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Cari Servis
                </label>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-2">
                      Nama Pelanggan
                    </label>
                    <input
                      type="text"
                      value={searchName}
                      onChange={(e) => setSearchName(e.target.value)}
                      placeholder="Contoh: Budi Santoso"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-2">
                      Nomor WhatsApp
                    </label>
                    <input
                      type="text"
                      value={searchPhone}
                      onChange={(e) => setSearchPhone(e.target.value)}
                      placeholder="Contoh: 081234567890"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition"
                    />
                  </div>
                </div>
                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}
                <button
                  onClick={searchService}
                  disabled={loading}
                  className="w-full mt-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <img
                    src="/images/icons/search.png"
                    alt="Search"
                    className="w-5 h-5"
                  />
                  {loading ? "Mencari..." : "Cari"}
                </button>
              </div>
            </div>

            {/* Results Section */}
            {showResults && (
              <div className="bg-white p-6 rounded-2xl shadow-md">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Hasil Pencarian
                </h3>
                {results.length === 0 ? (
                  <div className="text-center py-8">
                    <img
                      src="/images/icons/sad.png"
                      className="w-30 h-30 mx-auto mb-4"
                    />
                    <p className="text-gray-600">
                      Tidak ada servis ditemukan dengan kriteria tersebut
                    </p>
                  </div>
                ) : (
                  <div>
                    {results.map((service) => {
                      const status = getStatusInfo(service.status_servis)
                      return (
                        <div
                          key={service.id_servis}
                          className="border-2 border-gray-200 rounded-xl p-6 mb-4 hover:border-purple-400 transition cursor-pointer"
                          onClick={() => handleShowDetails(service.id_servis)}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-bold text-lg text-gray-800">
                                {service.nama_pelanggan}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {service.tipe_hp}
                              </p>
                            </div>
                            <span
                              className={`px-4 py-2 rounded-full text-sm font-semibold ${status.color} flex items-center gap-2`}
                            >
                              <img
                                src={status.icon}
                                alt={status.label}
                                className="w-5 h-5"
                              />
                              {status.label}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                            <div>
                              <p className="text-gray-500">Tanggal Masuk</p>
                              <p className="font-medium">
                                {new Date(
                                  service.tanggal_masuk
                                ).toLocaleDateString("id-ID")}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">Total Biaya</p>
                              <p className="font-bold text-purple-600">
                                Rp {service.biaya_total.toLocaleString("id-ID")}
                              </p>
                            </div>
                          </div>
                          <button className="mt-4 text-purple-600 font-semibold text-sm hover:text-purple-800">
                            Lihat Detail →
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Details Section */}
            {showDetails && selectedService && (
              <div className="mt-6 bg-white p-8 rounded-2xl shadow-md">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">
                    Detail Servis
                  </h3>
                  <button
                    onClick={closeDetails}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    &times;
                  </button>
                </div>
                <div className="space-y-6">
                  {/* Status Badge */}
                  <div className="flex justify-center">
                    <span
                      className={`px-6 py-3 rounded-full text-lg font-bold ${
                        getStatusInfo(selectedService.status_servis).color
                      } flex items-center gap-2`}
                    >
                      <img
                        src={getStatusInfo(selectedService.status_servis).icon}
                        alt={getStatusInfo(selectedService.status_servis).label}
                        className="w-6 h-6"
                      />
                      {getStatusInfo(selectedService.status_servis).label}
                    </span>
                  </div>

                  {/* Customer Info */}
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h4 className="font-bold text-gray-700 mb-4">
                      Informasi Pelanggan
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Nama</p>
                        <p className="font-semibold">
                          {selectedService.nama_pelanggan}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">WhatsApp</p>
                        <p className="font-semibold">
                          ****{selectedService.no_whatsapp.slice(-4)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Tipe HP</p>
                        <p className="font-semibold">
                          {selectedService.tipe_hp}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Tanggal Masuk</p>
                        <p className="font-semibold">
                          {new Date(
                            selectedService.tanggal_masuk
                          ).toLocaleDateString("id-ID")}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Problem */}
                  <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
                    <p className="text-sm text-gray-600 mb-1">Keluhan</p>
                    <p className="font-medium text-gray-800">
                      {selectedService.keluhan}
                    </p>
                  </div>

                  {/* Service Details */}
                  <div>
                    <h4 className="font-bold text-gray-700 mb-3">
                      Rincian Perbaikan
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="text-left p-3 border">Item</th>
                            <th className="text-center p-3 border">Jumlah</th>
                            <th className="text-right p-3 border">
                              Harga Satuan
                            </th>
                            <th className="text-right p-3 border">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedService.detail.map((d, idx) => (
                            <tr key={idx}>
                              <td className="p-3 border">{d.deskripsi}</td>
                              <td className="text-center p-3 border">
                                {d.jumlah}
                              </td>
                              <td className="text-right p-3 border">
                                Rp {d.harga_satuan.toLocaleString("id-ID")}
                              </td>
                              <td className="text-right p-3 border font-medium">
                                Rp {d.biaya.toLocaleString("id-ID")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-purple-50 font-bold">
                            <td colSpan={3} className="text-right p-3 border">
                              Total Pembayaran:
                            </td>
                            <td className="text-right p-3 border text-purple-600 text-lg">
                              Rp{" "}
                              {selectedService.biaya_total.toLocaleString(
                                "id-ID"
                              )}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  {selectedService.status_servis === "siap_diambil" && (
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded flex items-start gap-3">
                      <img
                        src="/images/icons/ready.png"
                        alt="Ready"
                        className="w-6 h-6 mt-1"
                      />
                      <div>
                        <p className="font-semibold text-blue-800">
                          HP Anda sudah siap diambil!
                        </p>
                        <p className="text-sm text-blue-700 mt-1">
                          Silakan datang ke toko untuk mengambil HP Anda
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
            Mengapa Pilih Kami?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <img
                  src="/images/icons/rush.png"
                  alt="Cepat"
                  className="w-12 h-12"
                />
              </div>
              <h3 className="font-bold text-lg mb-2">Cepat</h3>
              <p className="text-gray-600 text-sm">
                Pengerjaan cepat dan tepat waktu
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <img
                  src="/images/icons/quality.png"
                  alt="Berkualitas"
                  className="w-12 h-12"
                />
              </div>
              <h3 className="font-bold text-lg mb-2">Berkualitas</h3>
              <p className="text-gray-600 text-sm">
                Spare part original dan bergaransi
              </p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <img
                  src="/images/icons/shield.png"
                  alt="Terpercaya"
                  className="w-12 h-12"
                />
              </div>
              <h3 className="font-bold text-lg mb-2">Terpercaya</h3>
              <p className="text-gray-600 text-sm">
                Teknisi berpengalaman dan profesional
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="gradient-bg text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Siap Memperbaiki HP Anda?</h2>
          <p className="text-xl mb-8 text-purple-100">
            Hubungi kami sekarang dan dapatkan konsultasi gratis!
          </p>
          <button
            onClick={() => window.open("https://wa.me/6281234567890", "_blank")}
            className="bg-white text-purple-600 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transform hover:scale-105 transition-all flex items-center justify-center gap-2 mx-auto"
          >
            <img
              src="/images/icons/whatsapp.png"
              alt="WhatsApp"
              className="w-6 h-6"
            />
            Hubungi Kami via WhatsApp
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="mb-2">
            © 2025 Toko Service Handphone. All rights reserved.
          </p>
          <p className="text-sm text-gray-500">Melayani dengan sepenuh hati</p>
        </div>
      </footer>
    </div>
  )
}
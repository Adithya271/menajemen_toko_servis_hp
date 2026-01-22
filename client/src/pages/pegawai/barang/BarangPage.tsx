import { useEffect, useState } from "react"
import PegawaiLayout from "../../../components/pegawai/PegawaiLayouts"

type Barang = {
  id_barang: number
  nama_barang: string
  stok: number
  harga: number
  harga_modal: number
}

export default function PegawaiBarangPage() {
  const [list, setList] = useState<Barang[]>([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [current, setCurrent] = useState<Partial<Barang>>({
    nama_barang: "",
    stok: 0,
    harga: 0,
    harga_modal: 0,
  })

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const token = localStorage.getItem("token") || ""

  async function fetchBarang() {
    setLoading(true)
    try {
      const res = await fetch("http://localhost:8080/api/pegawai/barang", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) throw new Error("Gagal mengambil data")

      const data = await res.json()
      setList(data)
      setCurrentPage(1) // Reset ke halaman 1 saat fetch
    } catch (err) {
      alert(
        "Gagal mengambil data barang: " +
          (err instanceof Error ? err.message : String(err)),
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBarang()
  }, [])

  function openAdd() {
    setIsEdit(false)
    setCurrent({
      nama_barang: "",
      stok: 0,
      harga: 0,
      harga_modal: 0,
    })
    setShowModal(true)
  }

  function openEdit(b: Barang) {
    setIsEdit(true)
    setCurrent({ ...b })
    setShowModal(true)
  }

  //  AUTO Ketika harga jual berubah, otomatis hitung modal
  function handleHargaChange(hargaJual: number) {
    const hargaModal = Math.round(hargaJual * 0.6) // 60% dari harga jual
    setCurrent({
      ...current,
      harga: hargaJual,
      harga_modal: hargaModal,
    })
  }

  async function handleSave() {
    if (!current.nama_barang?.trim()) {
      alert("Nama barang wajib diisi!")
      return
    }

    if ((current.stok ?? 0) < 0) {
      alert("Stok tidak boleh negatif!")
      return
    }

    if ((current.harga ?? 0) <= 0) {
      alert("Harga jual harus lebih dari 0!")
      return
    }

    try {
      let url = "http://localhost:8080/api/pegawai/barang"
      let method = "POST"

      const body = {
        nama_barang: current.nama_barang.trim(),
        stok: current.stok || 0,
        harga: current.harga || 0,
        harga_modal: current.harga_modal || 0,
      }

      if (isEdit) {
        url = `http://localhost:8080/api/pegawai/barang/${current.id_barang}`
        method = "PUT"
      }

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
        throw new Error(errorData.error || "Request failed")
      }

      alert(
        isEdit
          ? " Barang berhasil diperbarui!"
          : " Barang berhasil ditambahkan!",
      )
      setShowModal(false)
      fetchBarang()
    } catch (err) {
      alert(
        "Gagal menyimpan: " +
          (err instanceof Error ? err.message : String(err)),
      )
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Yakin ingin menghapus barang ini?")) return

    try {
      const res = await fetch(
        `http://localhost:8080/api/pegawai/barang/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      if (!res.ok) throw new Error("Delete failed")

      alert(" Barang berhasil dihapus!")
      fetchBarang()
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      alert("Gagal menghapus barang")
    }
  }

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num)
  }

  // Hitung persentase margin keuntungan
  const hitungMargin = (harga: number, modal: number) => {
    if (harga === 0) return 0
    return (((harga - modal) / harga) * 100).toFixed(1)
  }

  // Pagination logic
  const totalPages = Math.ceil(list.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = list.slice(startIndex, endIndex)

  return (
    <PegawaiLayout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Kelola Barang dan Stok</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manajemen inventori barang dan sparepart
            </p>
          </div>
          <button
            onClick={openAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            + Tambah Barang
          </button>
        </div>

        <div className="bg-white shadow rounded-lg overflow-auto">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-center w-12">No</th>
                <th className="p-3 text-left">Nama Barang</th>
                <th className="p-3 text-center">Stok</th>
                <th className="p-3 text-right">Harga Modal</th>
                <th className="p-3 text-right">Harga Jual</th>
                <th className="p-3 text-center">Margin</th>
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
                    Belum ada data barang
                  </td>
                </tr>
              ) : (
                currentData.map((b, index) => (
                  <tr key={b.id_barang} className="border-t hover:bg-gray-50">
                    <td className="p-3 text-center text-sm text-gray-600">
                      {startIndex + index + 1}
                    </td>
                    <td className="p-3 font-medium">{b.nama_barang}</td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-3 py-1 rounded font-medium ${
                          b.stok === 0
                            ? "bg-red-100 text-red-700"
                            : b.stok < 4
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                        }`}
                      >
                        {b.stok}
                      </span>
                    </td>
                    <td className="p-3 text-right text-gray-600">
                      {formatRupiah(b.harga_modal)}
                    </td>
                    <td className="p-3 text-right font-semibold text-blue-600">
                      {formatRupiah(b.harga)}
                    </td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm font-medium">
                        {hitungMargin(b.harga, b.harga_modal)}%
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => openEdit(b)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded mr-2 hover:bg-yellow-600 transition text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(b.id_barang)}
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

        {/* ===== PAGINATION ===== */}
        {list.length > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Menampilkan {startIndex + 1} - {Math.min(endIndex, list.length)}{" "}
              dari {list.length} data
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                ← Sebelumnya
              </button>

              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 rounded-lg transition ${
                        currentPage === page
                          ? "bg-blue-600 text-white"
                          : "border border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Selanjutnya →
              </button>
            </div>
          </div>
        )}

        {showModal && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowModal(false)}
            ></div>

            <div className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] bg-white rounded-lg shadow-xl">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-t-lg">
                <h3 className="text-xl font-semibold">
                  {isEdit ? " Edit Barang" : " Tambah Barang"}
                </h3>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSave()
                }}
                className="p-6"
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Nama Barang <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={current.nama_barang || ""}
                      onChange={(e) =>
                        setCurrent({ ...current, nama_barang: e.target.value })
                      }
                      placeholder="Contoh: LCD iPhone 12"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Stok <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={current.stok || 0}
                      onChange={(e) =>
                        setCurrent({
                          ...current,
                          stok: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>

                  {/* INFO BOX */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800 font-medium mb-1">
                      💡 <strong>Harga Modal</strong> otomatis dihitung 60% dari
                      Harga Jual
                    </p>
                    <p className="text-xs text-blue-600">
                      Contoh: Jika Harga Jual Rp 100.000 → Modal otomatis Rp
                      60.000
                    </p>
                  </div>

                  {/* INPUT HARGA JUAL */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Harga Jual <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      className="w-full border-2 border-blue-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={current.harga || 0}
                      onChange={(e) =>
                        handleHargaChange(parseFloat(e.target.value) || 0)
                      }
                      placeholder="Masukkan harga jual"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formatRupiah(current.harga || 0)}
                    </p>
                  </div>

                  {/* DISPLAY HARGA MODAL (READ ONLY) */}
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-600">
                      Harga Modal (Auto)
                    </label>
                    <div className="w-full bg-gray-100 px-3 py-2 rounded-lg border-2 border-gray-300">
                      <p className="text-gray-700 font-semibold">
                        {formatRupiah(current.harga_modal || 0)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        = {current.harga || 0} × 60%
                      </p>
                    </div>
                  </div>

                  {/* MARGIN INDICATOR */}
                  {(current.harga || 0) > 0 && (
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-green-800 font-medium">
                          Margin Keuntungan:
                        </span>
                        <span className="text-xl font-bold text-green-600">
                          {hitungMargin(
                            current.harga || 0,
                            current.harga_modal || 0,
                          )}
                          %
                        </span>
                      </div>
                      <p className="text-xs text-green-700 mt-1">
                        Keuntungan per unit:{" "}
                        {formatRupiah(
                          (current.harga || 0) - (current.harga_modal || 0),
                        )}
                      </p>
                    </div>
                  )}
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
                    className="px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition"
                  >
                    {isEdit ? " Simpan Perubahan" : " Tambah Barang"}
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </PegawaiLayout>
  )
}

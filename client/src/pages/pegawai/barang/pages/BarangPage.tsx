// pages/pegawai/barang/PegawaiBarangPage.tsx
import { useEffect, useState } from "react"
import PegawaiLayout from "../../../../components/pegawai/PegawaiLayouts"
import BarangTable from "./../components/barang/BarangTable"
import BarangModal from "./../components/barang/BarangModal"
import Pagination from "./../components/common/Pagination"
import type { Barang, BarangFormData } from "./../types/barang"
import { barangApi } from "./../services/barangApi"

export default function PegawaiBarangPage() {
  const [list, setList] = useState<Barang[]>([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [current, setCurrent] = useState<BarangFormData>({
    nama_barang: "",
    stok: 0,
    harga: 0,
    harga_modal: 0,
  })

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const token = localStorage.getItem("token") || ""

  // Fetch data
  async function fetchBarang() {
    setLoading(true)
    try {
      const data = await barangApi.getAll(token)
      setList(data)
      setCurrentPage(1)
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

  // Modal handlers
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

  // Validation & Save
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

    if ((current.harga_modal ?? 0) < 0) {
      alert("Harga modal tidak boleh negatif!")
      return
    }

    if ((current.harga_modal ?? 0) >= (current.harga ?? 0)) {
      alert("Harga modal harus lebih kecil dari harga jual!")
      return
    }

    try {
      if (isEdit && current.id_barang) {
        await barangApi.update(current.id_barang, current, token)
        alert(" Barang berhasil diperbarui!")
      } else {
        await barangApi.create(current, token)
        alert(" Barang berhasil ditambahkan!")
      }
      setShowModal(false)
      fetchBarang()
    } catch (err) {
      alert(
        "Gagal menyimpan: " +
          (err instanceof Error ? err.message : String(err)),
      )
    }
  }

  // Delete
  async function handleDelete(id: number) {
    if (!confirm("Yakin ingin menghapus barang ini?")) return

    try {
      await barangApi.delete(id, token)
      alert(" Barang berhasil dihapus!")
      fetchBarang()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      alert("Gagal menghapus barang")
    }
  }

  // Pagination logic
  const totalPages = Math.ceil(list.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = list.slice(startIndex, endIndex)

  return (
    <PegawaiLayout>
      <div>
        {/* Header */}
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

        {/* Table */}
        <BarangTable
          data={currentData}
          loading={loading}
          startIndex={startIndex}
          onEdit={openEdit}
          onDelete={handleDelete}
        />

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={list.length}
          startIndex={startIndex}
          endIndex={endIndex}
          onPageChange={setCurrentPage}
        />

        {/* Modal */}
        <BarangModal
          show={showModal}
          isEdit={isEdit}
          data={current}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          onChange={setCurrent}
        />
      </div>
    </PegawaiLayout>
  )
}


import type { Barang } from "../../types/barang"
import {
  formatRupiah,
  hitungMargin,
  getStokColorClass,
} from "../../utils/barangUtils"

type BarangTableProps = {
  data: Barang[]
  loading: boolean
  startIndex: number
  onEdit: (barang: Barang) => void
  onDelete: (id: number) => void
}

export default function BarangTable({
  data,
  loading,
  startIndex,
  onEdit,
  onDelete,
}: BarangTableProps) {
  if (loading) {
    return (
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
            <tr>
              <td colSpan={7} className="p-4 text-center">
                Loading...
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }

  if (data.length === 0) {
    return (
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
            <tr>
              <td colSpan={7} className="p-4 text-center text-gray-500">
                Belum ada data barang
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }

  return (
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
          {data.map((b, index) => (
            <tr key={b.id_barang} className="border-t hover:bg-gray-50">
              <td className="p-3 text-center text-sm text-gray-600">
                {startIndex + index + 1}
              </td>
              <td className="p-3 font-medium">{b.nama_barang}</td>
              <td className="p-3 text-center">
                <span
                  className={`px-3 py-1 rounded font-medium ${getStokColorClass(b.stok)}`}
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
                  onClick={() => onEdit(b)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded mr-2 hover:bg-yellow-600 transition text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(b.id_barang)}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition text-sm"
                >
                  Hapus
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

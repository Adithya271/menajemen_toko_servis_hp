
import type { BarangFormData } from "../../types/barang"
import {
  formatRupiah,
  hitungMargin,
  hitungPersenModal,
} from "../../utils/barangUtils"

type BarangModalProps = {
  show: boolean
  isEdit: boolean
  data: BarangFormData
  onClose: () => void
  onSave: () => void
  onChange: (data: BarangFormData) => void
}

export default function BarangModal({
  show,
  isEdit,
  data,
  onClose,
  onSave,
  onChange,
}: BarangModalProps) {
  if (!show) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose}></div>

      <div className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] bg-white rounded-lg shadow-xl">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-t-lg">
          <h3 className="text-xl font-semibold">
            {isEdit ? " Edit Barang" : " Tambah Barang"}
          </h3>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            onSave()
          }}
          className="p-6"
        >
          <div className="space-y-4">
            {/* Nama Barang */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Nama Barang <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={data.nama_barang || ""}
                onChange={(e) =>
                  onChange({ ...data, nama_barang: e.target.value })
                }
                placeholder="Contoh: LCD iPhone 12"
              />
            </div>

            {/* Stok */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Stok <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={data.stok || 0}
                onChange={(e) =>
                  onChange({
                    ...data,
                    stok: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 font-medium mb-1">
                 <strong>Input Manual</strong>
              </p>
              <p className="text-xs text-blue-600">
                Masukkan harga jual dan harga modal sesuai kebutuhan. Persentase
                margin akan dihitung otomatis.
              </p>
            </div>

            {/* Harga Jual */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Harga Jual <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                className="w-full border-2 border-blue-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={data.harga || 0}
                onChange={(e) =>
                  onChange({
                    ...data,
                    harga: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="Masukkan harga jual"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formatRupiah(data.harga || 0)}
              </p>
            </div>

            {/* Harga Modal */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Harga Modal <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                className="w-full border-2 border-purple-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={data.harga_modal || 0}
                onChange={(e) =>
                  onChange({
                    ...data,
                    harga_modal: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="Masukkan harga modal"
              />
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-gray-500">
                  {formatRupiah(data.harga_modal || 0)}
                </p>
                {(data.harga || 0) > 0 && (
                  <p className="text-xs text-purple-600 font-medium">
                    ≈{" "}
                    {hitungPersenModal(data.harga || 0, data.harga_modal || 0)}%
                    dari harga jual
                  </p>
                )}
              </div>
            </div>

            {/* Margin Indicator */}
            {(data.harga || 0) > 0 && (data.harga_modal || 0) > 0 && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-800 font-medium">
                     Margin Keuntungan:
                  </span>
                  <span className="text-xl font-bold text-green-600">
                    {hitungMargin(data.harga || 0, data.harga_modal || 0)}%
                  </span>
                </div>
                <p className="text-xs text-green-700 mt-1">
                  Keuntungan per unit:{" "}
                  {formatRupiah((data.harga || 0) - (data.harga_modal || 0))}
                </p>
              </div>
            )}

            {/* Warning */}
            {(data.harga_modal || 0) >= (data.harga || 0) &&
              (data.harga || 0) > 0 && (
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm text-red-800 font-medium">
                     Harga modal harus lebih kecil dari harga jual!
                  </p>
                </div>
              )}
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <button
              type="button"
              className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              onClick={onClose}
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
  )
}

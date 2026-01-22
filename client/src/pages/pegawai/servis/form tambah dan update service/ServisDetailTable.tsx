import type { Barang, DetailServisItem } from "../../types/servis"
import { useEffect, useState } from "react"

type Props = {
  items: DetailServisItem[]
  barangList: Barang[]
  onChange: (items: DetailServisItem[]) => void
  isEditMode?: boolean
}

export default function ServisDetailTable({
  items,
  barangList,
  onChange,
  isEditMode = false,
}: Props) {
  const [hasResetQty, setHasResetQty] = useState(false)

  // Reset quantity saat pertama kali masuk mode edit
  useEffect(() => {
    if (isEditMode && !hasResetQty && items.length > 0) {
      const resetItems = items.map((item) => ({
        ...item,
        jumlah: 0, // Reset qty ke 0
        biaya: 0, // Reset biaya
      }))
      onChange(resetItems)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHasResetQty(true)
    }
  }, [isEditMode, items, hasResetQty, onChange])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const update = (idx: number, key: keyof DetailServisItem, value: any) => {
    const copy = [...items]
    copy[idx] = { ...copy[idx], [key]: value }

    // hitung ulang biaya
    copy[idx].biaya = copy[idx].jumlah * copy[idx].harga_satuan

    onChange(copy)
  }

  const updateMultiple = (idx: number, updates: Partial<DetailServisItem>) => {
    const copy = [...items]
    copy[idx] = { ...copy[idx], ...updates }

    // hitung ulang biaya
    copy[idx].biaya = copy[idx].jumlah * copy[idx].harga_satuan

    onChange(copy)
  }

  const addItem = () => {
    onChange([
      ...items,
      {
        id_barang: null,
        deskripsi: "",
        jumlah: 1,
        harga_satuan: 0,
        biaya: 0,
      },
    ])
  }

  const removeItem = (idx: number) => {
    onChange(items.filter((_, i) => i !== idx))
  }

  return (
    <div>
      <div className="flex justify-between mb-3">
        <h2 className="font-bold">Detail Perbaikan</h2>
        <button
          type="button"
          onClick={addItem}
          className="bg-blue-600 text-white px-3 py-1 rounded"
        >
          + Tambah Item
        </button>
      </div>

      {isEditMode && !hasResetQty && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded mb-3">
          Silakan input ulang jumlah barang yang digunakan
        </div>
      )}

      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Barang</th>
            <th className="border p-2">Deskripsi</th>
            <th className="border p-2">Qty</th>
            <th className="border p-2">Harga</th>
            <th className="border p-2">Subtotal</th>
            <th className="border p-2"></th>
          </tr>
        </thead>

        <tbody>
          {items.map((d, i) => (
            <tr key={i} className={d.jumlah === 0 ? "bg-red-50" : ""}>
              {/* ===== BARANG ===== */}
              <td className="border p-2">
                <select
                  className="border rounded px-2 py-1"
                  value={d.id_barang !== null ? String(d.id_barang) : ""}
                  onChange={(e) => {
                    const selectedId =
                      e.target.value === "" ? null : Number(e.target.value)

                    if (selectedId !== null) {
                      const barang = barangList.find(
                        (b) => b.id_barang === selectedId
                      )

                      if (barang) {
                        updateMultiple(i, {
                          id_barang: selectedId,
                          deskripsi: barang.nama_barang,
                          harga_satuan: barang.harga,
                        })
                      }
                    } else {
                      updateMultiple(i, {
                        id_barang: null,
                        deskripsi: "",
                        harga_satuan: 0,
                      })
                    }
                  }}
                >
                  <option value="">-- Pilih Barang --</option>
                  {barangList.map((b) => (
                    <option key={b.id_barang} value={String(b.id_barang)}>
                      {b.nama_barang}
                    </option>
                  ))}
                </select>
              </td>

              {/* ===== DESKRIPSI (EDIT TABLE) ===== */}
              <td className="border p-2">
                <input
                  type="text"
                  className="border rounded px-2 py-1 w-full"
                  value={d.deskripsi}
                  onChange={(e) => update(i, "deskripsi", e.target.value)}
                  placeholder="Deskripsi perbaikan"
                />
              </td>

              {/* ===== JUMLAH ===== */}
              <td className="border p-2 text-center">
                <input
                  type="number"
                  min={0}
                  className={`border rounded px-2 py-1 w-16 text-center ${
                    d.jumlah === 0 ? "border-red-500 bg-red-50" : ""
                  }`}
                  value={d.jumlah}
                  onChange={(e) => update(i, "jumlah", Number(e.target.value))}
                  placeholder="0"
                />
              </td>

              {/* ===== HARGA ===== */}
              <td className="border p-2 text-right">
                <input
                  type="number"
                  className="border rounded px-2 py-1 w-24 text-right"
                  value={d.harga_satuan}
                  onChange={(e) =>
                    update(i, "harga_satuan", Number(e.target.value))
                  }
                />
              </td>

              {/* ===== SUBTOTAL ===== */}
              <td className="border p-2 text-right font-semibold">
                Rp {d.biaya.toLocaleString("id-ID")}
              </td>

              {/* ===== HAPUS ===== */}
              <td className="border p-2 text-center">
                <button
                  type="button"
                  onClick={() => removeItem(i)}
                  className="text-red-600 font-bold"
                >
                  x
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {items.length === 0 && (
        <p className="text-sm text-gray-500 mt-3">Belum ada detail perbaikan</p>
      )}
    </div>
  )
}

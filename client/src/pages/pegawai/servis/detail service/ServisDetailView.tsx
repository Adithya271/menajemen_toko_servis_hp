import type { ServisData } from "../../types/servis"
import { cetakNotaServis } from "./CetakNotaServis"
import { useNavigate } from "react-router-dom"

type Props = {
  data: ServisData
}

export default function ServisDetailView({ data }: Props) {
  const navigate = useNavigate()
  const detailTotal = data.detail.reduce((sum, d) => sum + d.biaya, 0)

  return (
    <div className="space-y-6">
      {/* ================= TOMBOL AKSI ================= */}
      <div className="flex gap-3 justify-end">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
        >
          ← Kembali
        </button>
        <button
          onClick={() => cetakNotaServis(data)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z"
              clipRule="evenodd"
            />
          </svg>
          Cetak Nota
        </button>
      </div>

      {/* ================= DATA SERVIS ================= */}
      <div className="bg-gray-50 border rounded-lg p-4">
        <h2 className="text-lg font-bold mb-4">Informasi Servis</h2>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <Info label="Nama Pelanggan" value={data.nama_pelanggan} />
          <Info label="No WhatsApp" value={data.no_whatsapp || "-"} />
          <Info label="Tipe HP" value={data.tipe_hp} />
          <Info
            label="Status Servis"
            value={formatStatus(data.status_servis)}
          />
          <Info label="Tanggal Masuk" value={formatDate(data.tanggal_masuk)} />
          <Info
            label="Tanggal Selesai"
            value={
              data.tanggal_selesai ? formatDate(data.tanggal_selesai) : "-"
            }
          />
        </div>

        <div className="mt-4">
          <p className="text-sm font-medium text-gray-600 mb-1">Keluhan</p>
          <p className="text-gray-800 bg-white border rounded p-3">
            {data.keluhan}
          </p>
        </div>
      </div>

      {/* ================= DETAIL SERVIS ================= */}
      <div className="bg-white border rounded-lg p-4">
        <h2 className="text-lg font-bold mb-4">Detail Perbaikan</h2>

        {data.detail.length === 0 ? (
          <p className="text-sm text-gray-500">Belum ada detail perbaikan</p>
        ) : (
          <table className="w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-3 py-2 text-left">Deskripsi</th>
                <th className="border px-3 py-2 text-center">Qty</th>
                <th className="border px-3 py-2 text-right">Harga</th>
                <th className="border px-3 py-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {data.detail.map((d, i) => (
                <tr key={i}>
                  <td className="border px-3 py-2">{d.deskripsi}</td>
                  <td className="border px-3 py-2 text-center">{d.jumlah}</td>
                  <td className="border px-3 py-2 text-right">
                    Rp {d.harga_satuan.toLocaleString("id-ID")}
                  </td>
                  <td className="border px-3 py-2 text-right font-medium">
                    Rp {d.biaya.toLocaleString("id-ID")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ================= BIAYA BREAKDOWN ================= */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h2 className="text-lg font-bold mb-4">Ringkasan Biaya</h2>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Biaya Detail Perbaikan</span>
            <span className="font-semibold">
              Rp {detailTotal.toLocaleString("id-ID")}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-700">Biaya Layanan / Jasa</span>
            <span className="font-semibold">
              Rp {data.biaya_servis.toLocaleString("id-ID")}
            </span>
          </div>

          <div className="border-t border-blue-300 pt-3 flex justify-between items-center">
            <span className="text-lg font-bold text-gray-800">
              Total Pembayaran
            </span>
            <span className="text-2xl font-bold text-green-600">
              Rp {data.biaya_total.toLocaleString("id-ID")}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ================= HELPER ================= */

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-gray-500">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  )
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

function formatStatus(status: string) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

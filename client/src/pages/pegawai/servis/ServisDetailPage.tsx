import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import PegawaiLayout from "../../../components/pegawai/PegawaiLayouts"
import type { Barang, ServisData } from "./types/servis"

import ServisForm from "./form tambah dan update service/ServisForm"
import ServisSummary from "./form tambah dan update service/ServisSummary"
import ServisDetailTable from "./form tambah dan update service/ServisDetailTable"
import ServisDetailView from "./detail service/ServisDetailView"
import WhatsAppNotifier from "./detail service/WhatsAppNotifier"

export default function ServisDetailPage({
  mode,
}: {
  mode: "tambah" | "edit" | "detail"
}) {
  const { id } = useParams()
  const navigate = useNavigate()
  const token = localStorage.getItem("token") || ""

  const [barangList, setBarangList] = useState<Barang[]>([])
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState<ServisData>({
    nama_pelanggan: "",
    no_whatsapp: "",
    tipe_hp: "",
    keluhan: "",
    status_servis: "pending",
    biaya_servis: 0,
    biaya_total: 0,
    tanggal_masuk: new Date().toISOString().slice(0, 10),
    tanggal_selesai: null,
    id_user: 0,
    detail: [],
  })

  // =========================
  // FETCH BARANG
  // =========================
  useEffect(() => {
    fetch("http://localhost:8080/api/pegawai/barang", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setBarangList)
  }, [token])

  // =========================
  // FETCH SERVIS (EDIT / DETAIL)
  // =========================
  useEffect(() => {
    if (mode === "tambah") return
    if (!id) return

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    fetch(`http://localhost:8080/api/pegawai/servis/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) =>
        setForm({
          ...data,
          tanggal_masuk: data.tanggal_masuk?.split("T")[0],
          tanggal_selesai: data.tanggal_selesai
            ? data.tanggal_selesai.split("T")[0]
            : null,
        }),
      )
      .finally(() => setLoading(false))
  }, [id, mode, token])

  // =========================
  // CALCULATE DETAIL TOTAL
  // =========================
  const detailTotal = form.detail.reduce((sum, d) => sum + d.biaya, 0)

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = async () => {
    //  VALIDASI: Cek apakah ada detail dengan qty = 0 (mode edit)
    if (mode === "edit") {
      const hasZeroQty = form.detail.some((item) => item.jumlah === 0)
      if (hasZeroQty) {
        alert(
          " Ada barang dengan jumlah 0!\n\nSilakan input ulang jumlah barang yang digunakan atau hapus item tersebut.",
        )
        return
      }
    }

    //  VALIDASI: Cek apakah ada detail
    if (form.detail.length === 0) {
      alert(" Mohon tambahkan minimal 1 detail perbaikan!")
      return
    }

    console.log("=== FORM DATA ===", form)

    // Calculate final total: detail + biaya_servis
    const finalTotal = detailTotal + form.biaya_servis

    //  FORMAT PAYLOAD dengan benar
    const payload = {
      nama_pelanggan: form.nama_pelanggan,
      no_whatsapp: form.no_whatsapp,
      tipe_hp: form.tipe_hp,
      keluhan: form.keluhan,
      status_servis: form.status_servis,
      biaya_servis: Number(form.biaya_servis),
      biaya_total: finalTotal,
      tanggal_masuk: form.tanggal_masuk,
      tanggal_selesai: form.tanggal_selesai || null,
      id_user: form.id_user,

      //  FORMAT detail - pastikan semua number
      detail: form.detail.map((item) => ({
        id_barang: item.id_barang !== null ? Number(item.id_barang) : null,
        deskripsi: item.deskripsi,
        jumlah: Number(item.jumlah),
        harga_satuan: Number(item.harga_satuan),
        biaya: Number(item.biaya),
      })),
    }

    console.log("=== PAYLOAD DIKIRIM ===", JSON.stringify(payload, null, 2))

    try {
      const res = await fetch(
        mode === "edit"
          ? `http://localhost:8080/api/pegawai/servis/${id}`
          : "http://localhost:8080/api/pegawai/servis",
        {
          method: mode === "edit" ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      )

      const result = await res.json()
      console.log("=== RESPONSE ===", result)

      if (res.ok) {
        alert(
          mode === "edit"
            ? " Berhasil update data servis!"
            : " Berhasil menambah data servis!",
        )
        navigate("/pegawai/servis")
      } else {
        console.error("Error Response:", result)
        alert(" Gagal menyimpan: " + (result.error || JSON.stringify(result)))
      }
    } catch (error) {
      console.error("=== ERROR ===", error)
      alert(" Terjadi kesalahan: " + error)
    }
  }

  // =========================
  // RENDER
  // =========================
  return (
    <PegawaiLayout>
      <div className="max-w-5xl mx-auto bg-white p-6 rounded shadow">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading...</p>
          </div>
        ) : mode === "detail" ? (
          <>
            <ServisDetailView data={form} />
            <WhatsAppNotifier servis={form} />
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-6">
              {mode === "edit" ? "Edit Servis" : "Tambah Servis Baru"}
            </h1>

            <ServisForm form={form} setForm={setForm} />

            <ServisDetailTable
              items={form.detail}
              barangList={barangList}
              onChange={(items) => setForm({ ...form, detail: items })}
              isEditMode={mode === "edit"}
            />

            <ServisSummary
              detailTotal={detailTotal}
              biayadLayanan={form.biaya_servis}
            />

            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={() => navigate("/pegawai/servis")}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                {mode === "edit" ? "Update" : "Simpan"}
              </button>
            </div>
          </>
        )}
      </div>
    </PegawaiLayout>
  )
}

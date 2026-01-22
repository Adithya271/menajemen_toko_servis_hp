
import type { Barang, BarangFormData } from "./../types/barang"

const API_BASE = "http://localhost:8080/api/pegawai/barang"

export const barangApi = {
  async getAll(token: string): Promise<Barang[]> {
    const res = await fetch(API_BASE, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!res.ok) throw new Error("Gagal mengambil data")
    return await res.json()
  },

  async create(data: BarangFormData, token: string): Promise<void> {
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        nama_barang: data.nama_barang?.trim(),
        stok: data.stok || 0,
        harga: data.harga || 0,
        harga_modal: data.harga_modal || 0,
      }),
    })

    if (!res.ok) {
      const errorData = await res
        .json()
        .catch(() => ({ error: "Unknown error" }))
      throw new Error(errorData.error || "Request failed")
    }
  },

  async update(id: number, data: BarangFormData, token: string): Promise<void> {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        nama_barang: data.nama_barang?.trim(),
        stok: data.stok || 0,
        harga: data.harga || 0,
        harga_modal: data.harga_modal || 0,
      }),
    })

    if (!res.ok) {
      const errorData = await res
        .json()
        .catch(() => ({ error: "Unknown error" }))
      throw new Error(errorData.error || "Request failed")
    }
  },

  async delete(id: number, token: string): Promise<void> {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!res.ok) throw new Error("Delete failed")
  },
}

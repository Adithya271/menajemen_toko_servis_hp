export interface Barang {
  id_barang: number
  nama_barang: string
  harga: number
}

export interface DetailServisItem {
  id_detail?: number
  id_barang: number | null
  deskripsi: string
  jumlah: number
  harga_satuan: number
  biaya: number
}

export interface ServisData {
  id_servis?: number
  nama_pelanggan: string
  no_whatsapp: string
  tipe_hp: string
  keluhan: string
  status_servis: string
  tanggal_masuk: string
  tanggal_selesai: string | null
  biaya_servis: number
  biaya_total: number
  id_user: number
  detail: DetailServisItem[]
}

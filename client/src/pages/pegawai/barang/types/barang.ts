
export type Barang = {
  id_barang: number
  nama_barang: string
  stok: number
  harga: number
  harga_modal: number
}

export type BarangFormData = Partial<Barang>

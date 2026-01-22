
export const formatRupiah = (num: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(num)
}

export const hitungMargin = (harga: number, modal: number): string => {
  if (harga === 0) return "0"
  return (((harga - modal) / harga) * 100).toFixed(1)
}

export const hitungPersenModal = (harga: number, modal: number): string => {
  if (harga === 0) return "0"
  return ((modal / harga) * 100).toFixed(1)
}

export const getStokColorClass = (stok: number): string => {
  if (stok === 0) return "bg-red-100 text-red-700"
  if (stok < 4) return "bg-yellow-100 text-yellow-700"
  return "bg-green-100 text-green-700"
}

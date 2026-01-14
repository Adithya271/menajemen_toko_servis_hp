import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

interface DetailServis {
  nama_pelanggan: string
  tipe_hp: string
  biaya_total: number
  laba_servis: number
}

interface LaporanPdf {
  judul_laporan: string
  jenis_laporan: string
  tanggal_awal: string
  tanggal_akhir: string
  total_servis: number
  total_pendapatan: number
  total_modal: number
  laba_bersih: number
  keterangan?: string
  detail_servis?: DetailServis[]
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount)

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

export const generateLaporanPdf = (laporan: LaporanPdf) => {
  const doc = new jsPDF()

  // === HEADER ===
  doc.setFontSize(16)
  doc.text("LAPORAN SERVIS HP", 105, 15, { align: "center" })

  doc.setFontSize(12)
  doc.text(laporan.judul_laporan, 105, 23, { align: "center" })

  doc.setFontSize(10)
  doc.text(
    `Periode: ${formatDate(laporan.tanggal_awal)} - ${formatDate(
      laporan.tanggal_akhir
    )}`,
    105,
    30,
    { align: "center" }
  )

  let y = 40

  // === INFO RINGKAS ===
  autoTable(doc, {
    startY: y,
    theme: "grid",
    styles: { fontSize: 10 },
    body: [
      ["Jenis Laporan", laporan.jenis_laporan],
      ["Total Servis", laporan.total_servis.toString()],
      ["Total Pendapatan", formatCurrency(laporan.total_pendapatan)],
      ["Modal", formatCurrency(laporan.total_modal)],
      ["Laba Bersih", formatCurrency(laporan.laba_bersih)],
    ],
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 10

  // === KETERANGAN ===
  if (laporan.keterangan) {
    doc.setFontSize(10)
    doc.text("Keterangan:", 14, y)
    doc.text(laporan.keterangan, 14, y + 6)
    y += 15
  }

  // === DETAIL SERVIS ===
  if (laporan.detail_servis && laporan.detail_servis.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [["No", "Pelanggan", "Tipe HP", "Pendapatan", "Laba"]],
      body: laporan.detail_servis.map((d, i) => [
        i + 1,
        d.nama_pelanggan,
        d.tipe_hp,
        formatCurrency(d.biaya_total),
        formatCurrency(d.laba_servis),
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [128, 90, 213] },
    })
  }

  // === SAVE ===
  doc.save(`${laporan.judul_laporan}.pdf`)
}

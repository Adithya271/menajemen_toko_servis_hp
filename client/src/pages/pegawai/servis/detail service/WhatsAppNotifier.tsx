import type { ServisData } from "../../types/servis"

type Props = {
  servis: ServisData
}

export default function WhatsAppNotifier({ servis }: Props) {
  //  Jangan render jika belum selesai
  if (servis.status_servis !== "selesai") return null

  //  Normalisasi nomor WA 
  const phone = servis.no_whatsapp.replace(/\s+/g, "").replace(/^0/, "62")

  if (!phone) return null

  //  Template pesan
  const message = encodeURIComponent(
    `Halo ${servis.nama_pelanggan},

Servis HP Anda (${servis.tipe_hp}) telah *SELESAI* 

Total biaya: Rp ${servis.biaya_total.toLocaleString("id-ID")}

Terima kasih telah menggunakan layanan kami `
  )

  return (
    <div className="mt-6">
      <a
        href={`https://wa.me/${phone}?text=${message}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
      >
        <img
          src="/images/icons/whatsapp.png"
          alt="WhatsApp"
          className="w-5 h-5"
        />
        Kirim WhatsApp
      </a>
    </div>
  )
}

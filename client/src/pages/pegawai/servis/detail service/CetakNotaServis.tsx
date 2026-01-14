// File: utils/cetakNotaServis.ts
import type { ServisData } from "../../types/servis"

/**
 * Format tanggal ke format Indonesia
 */
function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

/**
 * Format status dari underscore ke spasi dengan kapitalisasi
 */
function formatStatus(status: string): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

/**
 * Generate HTML untuk nota servis
 */
function generateNotaHTML(data: ServisData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Nota Servis #${data.id_servis}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          font-size: 12px;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          border: 2px solid #333;
          padding: 20px;
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid #333;
        }
        .header h1 {
          font-size: 24px;
          margin-bottom: 5px;
        }
        .header p {
          font-size: 11px;
          color: #666;
        }
        .section {
          margin-bottom: 20px;
        }
        .section-title {
          font-weight: bold;
          font-size: 14px;
          margin-bottom: 10px;
          padding: 8px;
          background: #f0f0f0;
          border-left: 4px solid #333;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 15px;
        }
        .info-item {
          padding: 5px 0;
        }
        .info-label {
          font-weight: bold;
          font-size: 11px;
          color: #666;
        }
        .info-value {
          font-size: 13px;
          margin-top: 2px;
        }
        .keluhan-box {
          background: #f9f9f9;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          margin-top: 10px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        th, td {
          border: 1px solid #333;
          padding: 8px;
          text-align: left;
        }
        th {
          background: #333;
          color: white;
          font-size: 12px;
        }
        td {
          font-size: 11px;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .total-row {
          background: #f0f0f0;
          font-weight: bold;
          font-size: 13px;
        }
        .total-amount {
          color: #16a34a;
          font-size: 16px;
        }
        .footer {
          margin-top: 30px;
          padding-top: 15px;
          border-top: 1px solid #ddd;
          text-align: center;
          font-size: 11px;
          color: #666;
        }
        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: bold;
        }
        .status-pending { background: #fed7aa; color: #9a3412; }
        .status-dalam-perbaikan { background: #fef3c7; color: #92400e; }
        .status-selesai { background: #d1fae5; color: #065f46; }
        .status-siap-diambil { background: #dbeafe; color: #1e40af; }
        
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>NOTA SERVIS HP</h1>
          <p>Service ID: #${data.id_servis}</p>
        </div>

        <div class="section">
          <div class="section-title">Informasi Servis</div>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Nama Pelanggan:</div>
              <div class="info-value">${data.nama_pelanggan}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Tanggal Servis:</div>
              <div class="info-value">${formatDate(data.tanggal_masuk)}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Nomor Telepon:</div>
              <div class="info-value">${data.no_whatsapp || "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Estimasi Selesai:</div>
              <div class="info-value">${
                data.tanggal_selesai
                  ? formatDate(data.tanggal_selesai)
                  : "Belum ditentukan"
              }</div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Perangkat</div>
          <div class="info-item">
            <div class="info-label">Tipe HP:</div>
            <div class="info-value">${data.tipe_hp}</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Kerusakan Awal</div>
          <div class="keluhan-box">${data.keluhan}</div>
        </div>

        <div class="section">
          <div class="section-title">Detail Perbaikan</div>
          ${
            data.detail.length === 0
              ? '<p style="color: #666; font-style: italic;">Belum ada detail perbaikan</p>'
              : `<table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th class="text-center" style="width: 80px;">Jumlah</th>
                  <th class="text-right" style="width: 120px;">Harga Satuan</th>
                  <th class="text-right" style="width: 120px;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${data.detail
                  .map(
                    (d) => `
                  <tr>
                    <td>${d.deskripsi}</td>
                    <td class="text-center">${d.jumlah}</td>
                    <td class="text-right">Rp ${d.harga_satuan.toLocaleString(
                      "id-ID"
                    )}</td>
                    <td class="text-right">Rp ${d.biaya.toLocaleString(
                      "id-ID"
                    )}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
              <tfoot>
                <tr class="total-row">
                  <td colspan="3" class="text-right">Total Pembayaran:</td>
                  <td class="text-right total-amount">Rp ${data.biaya_total.toLocaleString(
                    "id-ID"
                  )}</td>
                </tr>
              </tfoot>
            </table>`
          }
        </div>

        <div class="section">
          <div class="info-item">
            <div class="info-label">Status Servis:</div>
            <div class="info-value">
              <span class="status-badge status-${data.status_servis
                .toLowerCase()
                .replace(/ /g, "-")
                .replace(/_/g, "-")}">
                ${formatStatus(data.status_servis)}
              </span>
            </div>
          </div>
        </div>

        <div class="footer">
          <p>Terima kasih atas kepercayaan Anda</p>
          <p style="margin-top: 5px;">Dicetak pada: ${new Date().toLocaleString(
            "id-ID"
          )}</p>
        </div>
      </div>
    </body>
    </html>
  `
}

/**
 * Fungsi utama untuk mencetak nota servis
 * @param data - Data servis yang akan dicetak
 */
export function cetakNotaServis(data: ServisData): void {
  const printWindow = window.open("", "_blank")

  if (!printWindow) {
    alert("Pop-up diblokir! Izinkan pop-up untuk mencetak.")
    return
  }

  const notaHTML = generateNotaHTML(data)

  printWindow.document.write(notaHTML)
  printWindow.document.close()

  // Tunggu sampai konten selesai dimuat lalu print
  printWindow.onload = () => {
    printWindow.print()
  }
}

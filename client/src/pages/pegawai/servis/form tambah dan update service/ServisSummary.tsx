interface Props {
  detailTotal: number
  biayadLayanan: number
}

export default function ServisSummary({ detailTotal, biayadLayanan }: Props) {
  const total = detailTotal + biayadLayanan

  return (
    <div className="mt-6 space-y-3">
      {/* Detail Breakdown */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-700">Biaya Detail Perbaikan</span>
          <span className="text-sm font-semibold">
            Rp {detailTotal.toLocaleString("id-ID")}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-700">Biaya Layanan / Jasa</span>
          <span className="text-sm font-semibold">
            Rp {biayadLayanan.toLocaleString("id-ID")}
          </span>
        </div>
      </div>

      {/* Total */}
      <div className="bg-green-50 border border-green-200 p-4 rounded flex justify-between items-center">
        <span className="font-bold text-lg">Total Biaya</span>
        <span className="font-bold text-green-600 text-2xl">
          Rp {total.toLocaleString("id-ID")}
        </span>
      </div>
    </div>
  )
}

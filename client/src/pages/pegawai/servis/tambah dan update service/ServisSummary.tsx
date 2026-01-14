export default function ServisSummary({ total }: { total: number }) {
  return (
    <div className="mt-4 bg-green-50 border p-4 rounded flex justify-between">
      <span className="font-bold">Total Biaya</span>
      <span className="font-bold text-green-600 text-xl">
        Rp {total.toLocaleString("id-ID")}
      </span>
    </div>
  )
}

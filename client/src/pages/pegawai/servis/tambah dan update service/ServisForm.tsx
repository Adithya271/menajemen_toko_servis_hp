import type { ServisData } from "../../types/servis"

type Props = {
  form: ServisData
  setForm: (data: ServisData) => void
}

export default function ServisForm({ form, setForm }: Props) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Data Servis</h2>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Nama Pelanggan"
          value={form.nama_pelanggan}
          onChange={(v) => setForm({ ...form, nama_pelanggan: v })}
        />

        <Input
          label="No WhatsApp"
          value={form.no_whatsapp}
          onChange={(v) => setForm({ ...form, no_whatsapp: v })}
        />

        <Input
          label="Tipe HP"
          value={form.tipe_hp}
          onChange={(v) => setForm({ ...form, tipe_hp: v })}
        />

        <select
          className="border rounded px-3 py-2"
          value={form.status_servis}
          onChange={(e) => setForm({ ...form, status_servis: e.target.value })}
        >
          <option value="pending">Pending</option>
          <option value="dalam_perbaikan">Dalam Perbaikan</option>
          <option value="siap_diambil">Siap Diambil</option>
          <option value="selesai">Selesai</option>
        </select>

        {/*  TANGGAL MASUK */}
        <div>
          <label className="text-sm text-gray-600">Tanggal Masuk</label>
          <input
            type="date"
            className="border rounded px-3 py-2 w-full"
            value={form.tanggal_masuk}
            onChange={(e) =>
              setForm({ ...form, tanggal_masuk: e.target.value })
            }
          />
        </div>

        {/*  TANGGAL SELESAI */}
        <div>
          <label className="text-sm text-gray-600">Tanggal Selesai</label>
          <input
            type="date"
            className="border rounded px-3 py-2 w-full"
            value={form.tanggal_selesai ?? ""}
            onChange={(e) =>
              setForm({
                ...form,
                tanggal_selesai: e.target.value || null,
              })
            }
          />
        </div>
      </div>

      <div>
        <label className="text-sm text-gray-600">Keluhan</label>
        <textarea
          className="border rounded px-3 py-2 w-full"
          rows={3}
          value={form.keluhan}
          onChange={(e) => setForm({ ...form, keluhan: e.target.value })}
        />
      </div>
    </div>
  )
}

function Input({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="text-sm text-gray-600">{label}</label>
      <input
        className="border rounded px-3 py-2 w-full"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

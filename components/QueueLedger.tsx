import React from 'react';
import { Booking } from '@/lib/types';
import { Layers } from 'lucide-react';

interface Props {
  bookings?: Booking[];
}

export default function QueueLedger({ bookings = [] }: Props) {
  return (
    <div className="bg-glass border-glass rounded-glassy shadow-glassy space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            APMC Central Procurement Queue Ledger
          </h3>
          <p className="text-xs text-slate-500">
            Live status tracking from initial slot booking to tare weighment and direct bank payout.
          </p>
        </div>
        <span className="text-xs font-mono font-medium text-slate-500">
          {bookings.length} Registered Bookings
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-secondaryClay border-y border-slate-200 text-slate-600 font-semibold">
              <th className="p-3">Booking ID</th>
              <th className="p-3">Farmer</th>
              <th className="p-3">Mandi / Slot</th>
              <th className="p-3">Vehicle / RFID</th>
              <th className="p-3">Crop / Est.</th>
              <th className="p-3">Gross / Tare / Net</th>
              <th className="p-3">Payout</th>
              <th className="p-3">Lifecycle Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-6 text-center text-slate-400">
                  No active bookings in queue. Book a delivery in the Farmer Portal!
                </td>
              </tr>
            ) : (
              bookings.map((b) => {
                const mandiName = b.mandi?.name || 'Unknown Mandi';
                const slotWindow = b.slot ? `${b.slot.windowStart} - ${b.slot.windowEnd}` : 'No slot';
                return (
                  <tr key={b.id} className="hover:bg-secondaryClay/80 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-800">{b.id}</td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-900">{b.farmerName}</div>
                      <div className="text-[11px] text-slate-500">{b.farmerVillage}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-slate-800">{mandiName.split(' ')[0]}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{slotWindow}</div>
                    </td>
                    <td className="p-3 font-mono">
                      <div className="font-bold text-slate-800">{b.vehicleNumber}</div>
                      <div className="text-[10px] text-emerald-700">{b.rfidTag}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-slate-800">{b.cropType}</div>
                      <div className="text-[11px] text-slate-500">{b.estimatedKg.toLocaleString()} kg est.</div>
                    </td>
                    <td className="p-3 font-mono text-[11px]">
                      <div>G: {b.actualGrossKg ? `${b.actualGrossKg}kg` : '—'}</div>
                      <div>T: {b.actualTareKg ? `${b.actualTareKg}kg` : '—'}</div>
                      <div className="font-bold text-emerald-700">
                        N: {b.actualNetKg ? `${b.actualNetKg}kg` : '—'}
                      </div>
                    </td>
                    <td className="p-3 font-mono">
                      {b.totalPayoutInr ? (
                        <span className="font-bold text-emerald-700">
                          ₹{b.totalPayoutInr.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Pending Tare</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide ${
                          b.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : b.status === 'WEIGHED_GROSS'
                            ? 'bg-amber-100 text-amber-800'
                            : b.status === 'GATE_VERIFIED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

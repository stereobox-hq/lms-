"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function NewPeriodPage() {
  const router = useRouter();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const title = `${MONTHS[month - 1]} ${year}`;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const res = await fetch("/api/periods", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, month, year }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to create period.");
      return;
    }
    const period = await res.json();
    router.push(`/payroll/${period.id}`);
  }

  return (
    <div className="max-w-md">
      <div className="mb-6">
        <Link href="/payroll" className="text-blue-600 hover:underline text-sm">
          ← Back to Payroll
        </Link>
        <h1 className="text-2xl font-bold mt-2">New Pay Period</h1>
      </div>
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 shadow-sm">
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {MONTHS.map((m, i) => (
                <option key={m} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <input
              type="number"
              min="2020"
              max="2100"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              required
            />
          </div>
        </div>
        <p className="text-sm text-gray-500">
          Period title: <strong>{title}</strong>
        </p>
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 bg-green-700 text-white rounded-lg text-sm hover:bg-green-800 transition disabled:opacity-60"
          >
            {saving ? "Creating…" : "Create Period"}
          </button>
          <Link href="/payroll" className="px-5 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

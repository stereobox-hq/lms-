"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const POSITIONS = ["Principal", "Teacher", "Caretaker", "Groundsman", "Administrator", "Other"];

export default function NewEmployeePage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", position: "Teacher", baseSalary: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const res = await fetch("/api/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, baseSalary: Number(form.baseSalary) }),
    });
    setSaving(false);
    if (!res.ok) {
      setError("Failed to save employee.");
      return;
    }
    router.push("/employees");
    router.refresh();
  }

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <Link href="/employees" className="text-blue-600 hover:underline text-sm">
          ← Back to Employees
        </Link>
        <h1 className="text-2xl font-bold mt-2">Add Employee</h1>
      </div>
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 shadow-sm">
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            placeholder="e.g. Mrs Jane Doe"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
          <select
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.position}
            onChange={(e) => setForm({ ...form, position: e.target.value })}
          >
            {POSITIONS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Base Salary ($)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.baseSalary}
            onChange={(e) => setForm({ ...form, baseSalary: e.target.value })}
            required
            placeholder="0.00"
          />
        </div>
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 bg-blue-700 text-white rounded-lg text-sm hover:bg-blue-800 transition disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save Employee"}
          </button>
          <Link href="/employees" className="px-5 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

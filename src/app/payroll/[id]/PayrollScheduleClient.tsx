"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Employee {
  id: number;
  name: string;
  position: string;
  baseSalary: number;
}

interface Entry {
  id: number;
  employeeId: number;
  salary: number;
  adjustedSalary: number | null;
  actualPaid: number | null;
  notes: string | null;
  employee: Employee;
}

interface Period {
  id: number;
  title: string;
  month: number;
  year: number;
  entries: Entry[];
}

function fmt(n: number | null | undefined) {
  if (n == null || n === 0) return "-";
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtTotal(n: number) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function PayrollScheduleClient({
  period,
  allEmployees,
}: {
  period: Period;
  allEmployees: Employee[];
}) {
  const router = useRouter();
  const [entries, setEntries] = useState<Entry[]>(period.entries);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{
    salary: string;
    adjustedSalary: string;
    actualPaid: string;
    notes: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({
    employeeId: "",
    salary: "",
    adjustedSalary: "",
    actualPaid: "",
    notes: "",
  });

  const existingEmployeeIds = new Set(entries.map((e) => e.employeeId));
  const availableEmployees = allEmployees.filter((e) => !existingEmployeeIds.has(e.id));

  function startEdit(entry: Entry) {
    setEditingId(entry.id);
    setEditForm({
      salary: String(entry.salary),
      adjustedSalary: entry.adjustedSalary != null ? String(entry.adjustedSalary) : "",
      actualPaid: entry.actualPaid != null ? String(entry.actualPaid) : "",
      notes: entry.notes ?? "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm(null);
  }

  async function saveEdit(entryId: number) {
    if (!editForm) return;
    setSaving(true);
    const res = await fetch(`/api/entries/${entryId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        salary: Number(editForm.salary),
        adjustedSalary: editForm.adjustedSalary !== "" ? Number(editForm.adjustedSalary) : null,
        actualPaid: editForm.actualPaid !== "" ? Number(editForm.actualPaid) : null,
        notes: editForm.notes || null,
      }),
    });
    setSaving(false);
    if (res.ok) {
      const updated: Entry = await res.json();
      setEntries((prev) => prev.map((e) => (e.id === entryId ? updated : e)));
      setEditingId(null);
      setEditForm(null);
    }
  }

  async function deleteEntry(entryId: number) {
    if (!confirm("Remove this entry from the payroll?")) return;
    const res = await fetch(`/api/entries/${entryId}`, { method: "DELETE" });
    if (res.ok) {
      setEntries((prev) => prev.filter((e) => e.id !== entryId));
    }
  }

  async function addEntry() {
    setSaving(true);
    const emp = allEmployees.find((e) => e.id === Number(addForm.employeeId));
    const res = await fetch(`/api/periods/${period.id}/entries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employeeId: Number(addForm.employeeId),
        salary: addForm.salary !== "" ? Number(addForm.salary) : emp?.baseSalary ?? 0,
        adjustedSalary: addForm.adjustedSalary !== "" ? Number(addForm.adjustedSalary) : null,
        actualPaid: addForm.actualPaid !== "" ? Number(addForm.actualPaid) : null,
        notes: addForm.notes || null,
      }),
    });
    setSaving(false);
    if (res.ok) {
      const newEntry: Entry = await res.json();
      setEntries((prev) =>
        [...prev, newEntry].sort((a, b) => a.employee.name.localeCompare(b.employee.name))
      );
      setShowAddForm(false);
      setAddForm({ employeeId: "", salary: "", adjustedSalary: "", actualPaid: "", notes: "" });
    }
  }

  const totalSalary = entries.reduce((s, e) => s + e.salary, 0);
  const totalAdjusted = entries.reduce((s, e) => s + (e.adjustedSalary ?? 0), 0);
  const totalPaid = entries.reduce((s, e) => s + (e.actualPaid ?? 0), 0);
  const totalBalance = totalAdjusted - totalPaid;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/payroll" className="text-blue-600 hover:underline text-sm">
            ← Back to Payroll
          </Link>
          <h1 className="text-2xl font-bold mt-1">
            Adjusted Salaries Schedule – {period.title}
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">{entries.length} employees</p>
        </div>
        <button
          onClick={() => {
            if (availableEmployees.length === 0) return;
            setShowAddForm(true);
            setAddForm({
              employeeId: String(availableEmployees[0].id),
              salary: String(availableEmployees[0].baseSalary),
              adjustedSalary: "",
              actualPaid: "",
              notes: "",
            });
          }}
          className="px-4 py-2 bg-blue-700 text-white rounded-lg text-sm hover:bg-blue-800 transition shrink-0"
          disabled={availableEmployees.length === 0}
        >
          + Add Employee
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SummaryCard label="Total Salary" value={fmtTotal(totalSalary)} />
        <SummaryCard label="Adjusted" value={fmtTotal(totalAdjusted)} />
        <SummaryCard label="Actual Paid" value={fmtTotal(totalPaid)} accent="green" />
        <SummaryCard
          label="Outstanding"
          value={fmtTotal(totalBalance)}
          accent={totalBalance > 0 ? "red" : "gray"}
        />
      </div>

      {/* Spreadsheet-style table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-blue-800 text-white text-xs uppercase">
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Position</th>
              <th className="px-4 py-3 text-right">Salary</th>
              <th className="px-4 py-3 text-right">Adjusted Salaries</th>
              <th className="px-4 py-3 text-right">Actual Paid</th>
              <th className="px-4 py-3 text-right">Balance</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {entries.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center text-gray-400 py-8">
                  No entries yet. Add employees to this pay period.
                </td>
              </tr>
            )}
            {entries.map((entry, idx) => {
              const balance = (entry.adjustedSalary ?? 0) - (entry.actualPaid ?? 0);
              const isEditing = editingId === entry.id;

              if (isEditing && editForm) {
                return (
                  <tr key={entry.id} className="bg-yellow-50">
                    <td className="px-4 py-2 text-gray-400">{idx + 1}</td>
                    <td className="px-4 py-2 font-medium">{entry.employee.name}</td>
                    <td className="px-4 py-2 text-gray-500">{entry.employee.position}</td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="w-24 border border-gray-300 rounded px-2 py-1 text-right text-xs"
                        value={editForm.salary}
                        onChange={(e) => setEditForm({ ...editForm, salary: e.target.value })}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="w-24 border border-gray-300 rounded px-2 py-1 text-right text-xs"
                        value={editForm.adjustedSalary}
                        onChange={(e) => setEditForm({ ...editForm, adjustedSalary: e.target.value })}
                        placeholder="—"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="w-24 border border-gray-300 rounded px-2 py-1 text-right text-xs"
                        value={editForm.actualPaid}
                        onChange={(e) => setEditForm({ ...editForm, actualPaid: e.target.value })}
                        placeholder="—"
                      />
                    </td>
                    <td className="px-4 py-2 text-right text-gray-400 text-xs">—</td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => saveEdit(entry.id)}
                        disabled={saving}
                        className="text-green-700 hover:underline text-xs mr-2"
                      >
                        Save
                      </button>
                      <button onClick={cancelEdit} className="text-gray-500 hover:underline text-xs">
                        Cancel
                      </button>
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={entry.id} className="hover:bg-blue-50 transition">
                  <td className="px-4 py-3 text-gray-400">{idx + 1}</td>
                  <td className="px-4 py-3 font-medium">{entry.employee.name}</td>
                  <td className="px-4 py-3 text-gray-500">{entry.employee.position}</td>
                  <td className="px-4 py-3 text-right font-mono">{fmt(entry.salary)}</td>
                  <td className="px-4 py-3 text-right font-mono">{fmt(entry.adjustedSalary)}</td>
                  <td className="px-4 py-3 text-right font-mono text-green-700">
                    {fmt(entry.actualPaid)}
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-mono ${
                      balance > 0 ? "text-red-600" : balance < 0 ? "text-orange-500" : "text-gray-400"
                    }`}
                  >
                    {entry.adjustedSalary != null ? fmt(balance) : "-"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => startEdit(entry)}
                      className="text-blue-600 hover:underline text-xs mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteEntry(entry.id)}
                      className="text-red-500 hover:underline text-xs"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 font-semibold text-sm border-t-2 border-gray-300">
              <td colSpan={3} className="px-4 py-3 text-right uppercase tracking-wide text-gray-600">
                TOTAL
              </td>
              <td className="px-4 py-3 text-right font-mono">{fmtTotal(totalSalary)}</td>
              <td className="px-4 py-3 text-right font-mono">{fmtTotal(totalAdjusted)}</td>
              <td className="px-4 py-3 text-right font-mono text-green-700">{fmtTotal(totalPaid)}</td>
              <td
                className={`px-4 py-3 text-right font-mono ${
                  totalBalance > 0 ? "text-red-600" : "text-gray-500"
                }`}
              >
                {fmtTotal(totalBalance)}
              </td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Add Employee Form */}
      {showAddForm && (
        <div className="bg-white border border-blue-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold mb-4 text-sm">Add Employee to This Period</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Employee</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                value={addForm.employeeId}
                onChange={(e) => {
                  const emp = allEmployees.find((a) => a.id === Number(e.target.value));
                  setAddForm({ ...addForm, employeeId: e.target.value, salary: String(emp?.baseSalary ?? "") });
                }}
              >
                {availableEmployees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({e.position})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Salary ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                value={addForm.salary}
                onChange={(e) => setAddForm({ ...addForm, salary: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Adjusted Salary ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                value={addForm.adjustedSalary}
                onChange={(e) => setAddForm({ ...addForm, adjustedSalary: e.target.value })}
                placeholder="optional"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Actual Paid ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                value={addForm.actualPaid}
                onChange={(e) => setAddForm({ ...addForm, actualPaid: e.target.value })}
                placeholder="optional"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                value={addForm.notes}
                onChange={(e) => setAddForm({ ...addForm, notes: e.target.value })}
                placeholder="optional"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={addEntry}
              disabled={saving || !addForm.employeeId}
              className="px-4 py-2 bg-blue-700 text-white rounded-lg text-sm hover:bg-blue-800 disabled:opacity-60"
            >
              {saving ? "Adding…" : "Add to Payroll"}
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Notes legend */}
      {entries.some((e) => e.notes) && (
        <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3 border border-gray-200">
          <strong>Notes:</strong>
          <ul className="mt-1 space-y-0.5">
            {entries
              .filter((e) => e.notes)
              .map((e) => (
                <li key={e.id}>
                  <span className="font-medium">{e.employee.name}:</span> {e.notes}
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  accent = "default",
}: {
  label: string;
  value: string;
  accent?: "green" | "red" | "gray" | "default";
}) {
  const textColor =
    accent === "green"
      ? "text-green-700"
      : accent === "red"
      ? "text-red-600"
      : accent === "gray"
      ? "text-gray-500"
      : "text-gray-900";
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
      <p className={`text-xl font-bold mt-1 font-mono ${textColor}`}>{value}</p>
    </div>
  );
}

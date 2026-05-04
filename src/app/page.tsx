import Link from "next/link";
import { prisma } from "@/lib/prisma";

async function getDashboardData() {
  const [employeeCount, periods] = await Promise.all([
    prisma.employee.count(),
    prisma.payrollPeriod.findMany({
      orderBy: [{ year: "desc" }, { month: "desc" }],
      take: 5,
      include: {
        entries: {
          select: { salary: true, adjustedSalary: true, actualPaid: true },
        },
      },
    }),
  ]);
  return { employeeCount, periods };
}

function fmt(n: number | null | undefined) {
  if (n == null) return "-";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

export default async function DashboardPage() {
  const { employeeCount, periods } = await getDashboardData();
  const latestPeriod = periods[0];

  const latestTotals = latestPeriod
    ? {
        salary: latestPeriod.entries.reduce((s: number, e: { salary: number }) => s + e.salary, 0),
        adjusted: latestPeriod.entries.reduce((s: number, e: { adjustedSalary: number | null }) => s + (e.adjustedSalary ?? 0), 0),
        paid: latestPeriod.entries.reduce((s: number, e: { actualPaid: number | null }) => s + (e.actualPaid ?? 0), 0),
      }
    : null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">School payroll overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Employees" value={String(employeeCount)} />
        <StatCard label="Pay Periods" value={String(periods.length)} />
        {latestTotals && (
          <>
            <StatCard
              label={`${latestPeriod!.title} – Salary`}
              value={fmt(latestTotals.salary)}
              sub="Total scheduled"
            />
            <StatCard
              label={`${latestPeriod!.title} – Paid`}
              value={fmt(latestTotals.paid)}
              sub={`of ${fmt(latestTotals.adjusted)} adjusted`}
            />
          </>
        )}
      </div>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Recent Payroll Periods</h2>
          <Link href="/payroll" className="text-sm text-blue-700 hover:underline">
            View all →
          </Link>
        </div>
        {periods.length === 0 ? (
          <p className="text-gray-400 text-sm">No payroll periods yet.</p>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">Period</th>
                  <th className="px-4 py-3 text-right">Entries</th>
                  <th className="px-4 py-3 text-right">Total Salary</th>
                  <th className="px-4 py-3 text-right">Adjusted</th>
                  <th className="px-4 py-3 text-right">Actual Paid</th>
                  <th className="px-4 py-3 text-right">Balance</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {periods.map((p) => {
                  const salary = p.entries.reduce((s: number, e: { salary: number }) => s + e.salary, 0);
                  const adjusted = p.entries.reduce((s: number, e: { adjustedSalary: number | null }) => s + (e.adjustedSalary ?? 0), 0);
                  const paid = p.entries.reduce((s: number, e: { actualPaid: number | null }) => s + (e.actualPaid ?? 0), 0);
                  const balance = adjusted - paid;
                  return (
                    <tr key={p.id} className="hover:bg-blue-50 transition">
                      <td className="px-4 py-3 font-medium">{p.title}</td>
                      <td className="px-4 py-3 text-right text-gray-500">{p.entries.length}</td>
                      <td className="px-4 py-3 text-right">{fmt(salary)}</td>
                      <td className="px-4 py-3 text-right">{fmt(adjusted)}</td>
                      <td className="px-4 py-3 text-right text-green-700 font-medium">{fmt(paid)}</td>
                      <td
                        className={`px-4 py-3 text-right font-medium ${
                          balance > 0 ? "text-red-600" : "text-gray-500"
                        }`}
                      >
                        {fmt(balance)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/payroll/${p.id}`} className="text-blue-600 hover:underline text-xs">
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/employees/new"
            className="px-4 py-2 bg-blue-700 text-white rounded-lg text-sm hover:bg-blue-800 transition"
          >
            + Add Employee
          </Link>
          <Link
            href="/payroll/new"
            className="px-4 py-2 bg-green-700 text-white rounded-lg text-sm hover:bg-green-800 transition"
          >
            + New Pay Period
          </Link>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

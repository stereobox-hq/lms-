import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function PayrollPeriodsPage() {
  const periods = await prisma.payrollPeriod.findMany({
    orderBy: [{ year: "desc" }, { month: "desc" }],
    include: {
      entries: { select: { salary: true, adjustedSalary: true, actualPaid: true } },
    },
  });

  function fmt(n: number | null) {
    if (n == null) return "-";
    return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2 });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Payroll Periods</h1>
          <p className="text-gray-500 text-sm mt-1">{periods.length} period(s)</p>
        </div>
        <Link
          href="/payroll/new"
          className="px-4 py-2 bg-green-700 text-white rounded-lg text-sm hover:bg-green-800 transition"
        >
          + New Period
        </Link>
      </div>

      {periods.length === 0 ? (
        <p className="text-gray-400">No payroll periods found.</p>
      ) : (
        <div className="grid gap-4">
          {periods.map((p) => {
            const salary = p.entries.reduce((s: number, e: { salary: number }) => s + e.salary, 0);
            const adjusted = p.entries.reduce((s: number, e: { adjustedSalary: number | null }) => s + (e.adjustedSalary ?? 0), 0);
            const paid = p.entries.reduce((s: number, e: { actualPaid: number | null }) => s + (e.actualPaid ?? 0), 0);
            const outstanding = adjusted - paid;
            const pct = adjusted > 0 ? Math.round((paid / adjusted) * 100) : 0;
            return (
              <Link
                key={p.id}
                href={`/payroll/${p.id}`}
                className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 hover:shadow-md hover:border-blue-300 transition block"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-base font-semibold">{p.title}</h2>
                    <p className="text-xs text-gray-400 mt-0.5">{p.entries.length} employees</p>
                  </div>
                  <div className="flex gap-6 text-sm text-right">
                    <div>
                      <p className="text-xs text-gray-400">Total Salary</p>
                      <p className="font-medium">{fmt(salary)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Adjusted</p>
                      <p className="font-medium">{fmt(adjusted)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Paid</p>
                      <p className="font-medium text-green-700">{fmt(paid)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Outstanding</p>
                      <p className={`font-medium ${outstanding > 0 ? "text-red-600" : "text-gray-500"}`}>
                        {fmt(outstanding)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{pct}% paid</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

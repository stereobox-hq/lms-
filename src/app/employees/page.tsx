import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function EmployeesPage() {
  const employees = await prisma.employee.findMany({ orderBy: { name: "asc" } });

  const positionColors: Record<string, string> = {
    Principal: "bg-purple-100 text-purple-800",
    Teacher: "bg-blue-100 text-blue-800",
    Caretaker: "bg-yellow-100 text-yellow-800",
    Groundsman: "bg-green-100 text-green-800",
    Administrator: "bg-orange-100 text-orange-800",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Employees</h1>
          <p className="text-gray-500 text-sm mt-1">{employees.length} staff members</p>
        </div>
        <Link
          href="/employees/new"
          className="px-4 py-2 bg-blue-700 text-white rounded-lg text-sm hover:bg-blue-800 transition"
        >
          + Add Employee
        </Link>
      </div>

      {employees.length === 0 ? (
        <p className="text-gray-400">No employees found.</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Position</th>
                <th className="px-4 py-3 text-right">Base Salary</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {employees.map((emp, idx) => (
                <tr key={emp.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 text-gray-400">{idx + 1}</td>
                  <td className="px-4 py-3 font-medium">{emp.name}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        positionColors[emp.position] ?? "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {emp.position}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    ${emp.baseSalary.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/employees/${emp.id}/edit`}
                      className="text-blue-600 hover:underline text-xs mr-3"
                    >
                      Edit
                    </Link>
                    <DeleteButton id={emp.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function DeleteButton({ id }: { id: number }) {
  return (
    <form
      action={async () => {
        "use server";
        const { prisma: db } = await import("@/lib/prisma");
        await db.employee.delete({ where: { id } });
        const { revalidatePath } = await import("next/cache");
        revalidatePath("/employees");
      }}
      className="inline"
    >
      <button type="submit" className="text-red-500 hover:underline text-xs">
        Delete
      </button>
    </form>
  );
}

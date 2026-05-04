import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import EditEmployeeForm from "./EditEmployeeForm";

export default async function EditEmployeePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const employee = await prisma.employee.findUnique({ where: { id: Number(id) } });
  if (!employee) notFound();
  return <EditEmployeeForm employee={employee} />;
}

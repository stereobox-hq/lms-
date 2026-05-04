import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import PayrollScheduleClient from "./PayrollScheduleClient";

export default async function PayrollSchedulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const period = await prisma.payrollPeriod.findUnique({
    where: { id: Number(id) },
    include: {
      entries: {
        include: { employee: true },
        orderBy: { employee: { name: "asc" } },
      },
    },
  });
  if (!period) notFound();

  const allEmployees = await prisma.employee.findMany({ orderBy: { name: "asc" } });

  return <PayrollScheduleClient period={period} allEmployees={allEmployees} />;
}

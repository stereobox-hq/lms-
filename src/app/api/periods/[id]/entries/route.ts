import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const periodId = Number(id);
  const body = await req.json();
  const { employeeId, salary, adjustedSalary, actualPaid, notes } = body;

  if (!employeeId || salary == null) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const entry = await prisma.payrollEntry.upsert({
    where: { employeeId_periodId: { employeeId: Number(employeeId), periodId } },
    update: { salary, adjustedSalary, actualPaid, notes },
    create: { employeeId: Number(employeeId), periodId, salary, adjustedSalary, actualPaid, notes },
    include: { employee: true },
  });
  return NextResponse.json(entry, { status: 201 });
}

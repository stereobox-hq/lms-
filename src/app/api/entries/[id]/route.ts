import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { salary, adjustedSalary, actualPaid, notes } = body;
  const entry = await prisma.payrollEntry.update({
    where: { id: Number(id) },
    data: { salary, adjustedSalary, actualPaid, notes },
    include: { employee: true },
  });
  return NextResponse.json(entry);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.payrollEntry.delete({ where: { id: Number(id) } });
  return new NextResponse(null, { status: 204 });
}

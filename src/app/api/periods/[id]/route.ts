import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const period = await prisma.payrollPeriod.findUnique({
    where: { id: Number(id) },
    include: { entries: { include: { employee: true }, orderBy: { employee: { name: "asc" } } } },
  });
  if (!period) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(period);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const period = await prisma.payrollPeriod.update({
    where: { id: Number(id) },
    data: { title: body.title, month: body.month, year: body.year },
  });
  return NextResponse.json(period);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.payrollPeriod.delete({ where: { id: Number(id) } });
  return new NextResponse(null, { status: 204 });
}

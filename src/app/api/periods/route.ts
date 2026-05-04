import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const periods = await prisma.payrollPeriod.findMany({
    orderBy: [{ year: "desc" }, { month: "desc" }],
    include: { _count: { select: { entries: true } } },
  });
  return NextResponse.json(periods);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, month, year } = body;
  if (!title || !month || !year) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const period = await prisma.payrollPeriod.create({ data: { title, month, year } });
  return NextResponse.json(period, { status: 201 });
}

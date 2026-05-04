import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const employees = await prisma.employee.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(employees);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, position, baseSalary } = body;
  if (!name || !position || baseSalary == null) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const employee = await prisma.employee.create({ data: { name, position, baseSalary } });
  return NextResponse.json(employee, { status: 201 });
}

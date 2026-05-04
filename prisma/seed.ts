import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";
import path from "path";

const dbPath = path.resolve(__dirname, "../dev.db");
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  const period = await prisma.payrollPeriod.upsert({
    where: { month_year: { month: 4, year: 2026 } },
    update: {},
    create: { title: "April 2026", month: 4, year: 2026 },
  });

  const employees = [
    { name: "Mrs Annah Majazi", position: "Principal", baseSalary: 1000 },
    { name: "Mr John Mushore", position: "Teacher", baseSalary: 400 },
    { name: "Ms Veronica Mufudza", position: "Teacher", baseSalary: 400 },
    { name: "Miss Mahachi", position: "Teacher", baseSalary: 150 },
    { name: "Mrs Constance Murandu", position: "Teacher", baseSalary: 400 },
    { name: "Mr Phillip Munguma", position: "Teacher", baseSalary: 400 },
    { name: "Tafadzwa Dube", position: "Teacher", baseSalary: 300 },
    { name: "Miss Nomathamsanga Maja", position: "Teacher", baseSalary: 350 },
    { name: "Mr Givemore Marekwa", position: "Caretaker", baseSalary: 260 },
    { name: "Mr Joel Chisero", position: "Groundsman", baseSalary: 260 },
    { name: "Mr Glory Sanyika", position: "Administrator", baseSalary: 400 },
  ];

  // Payroll entry data matching the spreadsheet
  const entryData: {
    name: string;
    salary: number;
    adjustedSalary: number | null;
    actualPaid: number | null;
    notes: string | null;
  }[] = [
    { name: "Mrs Annah Majazi", salary: 1000, adjustedSalary: 500, actualPaid: 1000, notes: null },
    { name: "Mr John Mushore", salary: 400, adjustedSalary: 400, actualPaid: 400, notes: null },
    { name: "Ms Veronica Mufudza", salary: 400, adjustedSalary: 400, actualPaid: 400, notes: null },
    { name: "Miss Mahachi", salary: 150, adjustedSalary: 150, actualPaid: 100, notes: null },
    { name: "Mrs Constance Murandu", salary: 400, adjustedSalary: 400, actualPaid: 400, notes: null },
    { name: "Mr Phillip Munguma", salary: 400, adjustedSalary: null, actualPaid: null, notes: "Paid via column F: 400" },
    { name: "Tafadzwa Dube", salary: 300, adjustedSalary: 300, actualPaid: 300, notes: null },
    { name: "Miss Nomathamsanga Maja", salary: 350, adjustedSalary: 350, actualPaid: 350, notes: null },
    { name: "Mr Givemore Marekwa", salary: 260, adjustedSalary: 260, actualPaid: null, notes: null },
    { name: "Mr Joel Chisero", salary: 260, adjustedSalary: 260, actualPaid: 260, notes: null },
    { name: "Mr Glory Sanyika", salary: 400, adjustedSalary: null, actualPaid: null, notes: "Paid via column F: 400" },
  ];

  for (const emp of employees) {
    const employee = await prisma.employee.upsert({
      where: { id: employees.indexOf(emp) + 1 },
      update: { name: emp.name, position: emp.position, baseSalary: emp.baseSalary },
      create: { name: emp.name, position: emp.position, baseSalary: emp.baseSalary },
    });

    const data = entryData.find((e) => e.name === emp.name)!;
    await prisma.payrollEntry.upsert({
      where: { employeeId_periodId: { employeeId: employee.id, periodId: period.id } },
      update: {
        salary: data.salary,
        adjustedSalary: data.adjustedSalary,
        actualPaid: data.actualPaid,
        notes: data.notes,
      },
      create: {
        employeeId: employee.id,
        periodId: period.id,
        salary: data.salary,
        adjustedSalary: data.adjustedSalary,
        actualPaid: data.actualPaid,
        notes: data.notes,
      },
    });
  }

  console.log("Seed complete. Period:", period.title);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

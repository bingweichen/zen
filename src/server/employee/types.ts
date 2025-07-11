import type { Employee } from "@/generated/prisma";

export type EmployeeWithUserAndRole = Employee & {
  user: { id: number; username: string; email?: string };
  role: { id: number; name: string; description?: string };
}; 


// defalut role: admin, staff
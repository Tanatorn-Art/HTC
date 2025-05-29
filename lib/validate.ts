import { z } from 'zod';

export const reportDetailQuerySchema = z.object({
  deptcode: z
    .string()
    .regex(/^\d+$/, { message: 'รหัสแผนกต้องเป็นตัวเลข' }),

  date: z
    .string()
    .optional()
    .refine(
      (val) =>
        !val || /^\d{4}-\d{2}-\d{2}$/.test(val),
      { message: 'รูปแบบวันที่ไม่ถูกต้อง (YYYY-MM-DD)' }
    ),
});

export const employeeDetailSchema = z.object({
  employeeId: z
    .string()
    .regex(/^\d+$/, { message: 'employeeId ต้องเป็นตัวเลข' }),
});

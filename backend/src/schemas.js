import * as z from "zod";

export const createTaskSchema = z.strictObject({
  text: z.string().trim().min(1).max(500),
});

export const completionSchema = z.strictObject({
  completed: z.boolean(),
});

export const taskIdSchema = z
  .string()
  .regex(/^[1-9]\d*$/)
  .refine((value) => Number.isSafeInteger(Number(value)))
  .transform(Number);

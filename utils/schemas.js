import { z } from "zod";

export const userSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(13, "Username must be no more than 13 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
export const edituserSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(13, "Username must be no more than 13 characters")
    .optional(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional(),
});

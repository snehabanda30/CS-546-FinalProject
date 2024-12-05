import { z } from "zod";

export const userSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(13, "Username must be no more than 13 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z
    .string()
    .min(6, "Confirmed password must be at least 6 characters"),
  email: z.string().email("Invalid email address"),
  firstName: z.string().min(1, "First name must be at least 1 character"),
  lastName: z.string().min(1, "Last name must be at least 1 character"),
});

export const refinedUserSchema = userSchema.refine(
  (data) => data.password === data.confirmPassword,
  { message: "Passwords do not match", path: ["confirmPassword"] }
);

export const userLoginSchema = userSchema.pick({
  username: true,
  password: true,
});

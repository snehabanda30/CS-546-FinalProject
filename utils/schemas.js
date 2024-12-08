import { z } from "zod";

export const userSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(13, "Username must be no more than 13 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const userEditSchema = z.object({
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().min(10).max(10).optional().or(z.literal("")),
  firstName: z.string().min(1).max(50).optional().or(z.literal("")),
  lastName: z.string().min(1).max(50).optional().or(z.literal("")),
  address: z.string().min(1).max(100).optional().or(z.literal("")),
  suite: z.string().min(1).max(50).optional().or(z.literal("")),
  city: z.string().min(1).max(50).optional().or(z.literal("")),
  state: z.string().min(1).max(50).optional().or(z.literal("")),
  zipcode: z.string().min(5).max(5).optional().or(z.literal("")),
  country: z.string().min(1).max(50).optional().or(z.literal("")),
});

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
  { message: "Passwords do not match", path: ["confirmPassword"] },
);

export const userLoginSchema = userSchema.pick({
  username: true,
  password: true,
});

export const postSchema = z.object({
  category: z.string().min(1, "Category is required"),
  location: z.object({
    address: z.string().min(1, "Address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    zipCode: z.string().min(1, "Zip Code is required"),
    country: z.string().min(1, "Country is required"),
  }),
  skillsRequired: z
    .string()
    .min(1, "Skills required field cannot be empty")
    .regex(/^[a-zA-Z, ]*$/, "Skills must be a comma-separated list of words"),
  priority: z.enum(
    ["Low", "Medium", "High"],
    "Priority must be Low, Medium, or High",
  ),
  description: z.string().min(1, "Description is required"),
  completeBy: z.string()
    .min(1, "Complete by date is required")
    .refine((date) => {
      const currentDate = new Date();
      const currentDateNewYork = new Date(
        currentDate.toLocaleString("en-US", { timeZone: "America/New_York" })
      );
      const completeByDate = new Date(date);
      return completeByDate > currentDateNewYork; // adjust time zone
    }, "Complete by date must be in the future."),
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

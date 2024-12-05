import { z } from "zod";

export const userSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(13, "Username must be no more than 13 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
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

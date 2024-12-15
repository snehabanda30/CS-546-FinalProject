import { z } from "zod";

const skillsRegex =
  /^\s*([a-zA-Z]+(?:\s+[a-zA-Z]+)*)\s*(?:,\s*([a-zA-Z]+(?:\s+[a-zA-Z]+)*)\s*)*$/;

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
  completeBy: z
    .string()
    .min(1, "Complete by date is required")
    .refine((date) => {
      const currentDate = new Date();
      const currentDateNewYork = new Date(
        currentDate.toLocaleString("en-US", { timeZone: "America/New_York" }),
      );
      const completeByDate = new Date(date);
      return completeByDate > currentDateNewYork; // adjust time zone
    }, "Complete by date must be in the future."),
});

export const userEditSchema = z.object({
  email: z.string().email("Invalid email format."),
  phone: z
    .string()
    .min(10, "Phone number must be exactly 10 characters.")
    .max(10, "Phone number must be exactly 10 characters."),
  firstName: z
    .string()
    .min(1, "First name cannot be empty.")
    .max(50, "First name cannot exceed 50 characters."),
  lastName: z
    .string()
    .min(1, "Last name cannot be empty.")
    .max(50, "Last name cannot exceed 50 characters."),
  address: z
    .string()
    .min(1, "Address cannot be empty.")
    .max(100, "Address cannot exceed 100 characters."),
  suite: z
    .string()
    .min(1, "Suite cannot be empty.")
    .max(50, "Suite cannot exceed 50 characters.")
    .optional()
    .or(z.literal("")),
  city: z
    .string()
    .min(1, "City cannot be empty.")
    .max(50, "City cannot exceed 50 characters."),
  state: z
    .string()
    .min(1, "State cannot be empty.")
    .max(50, "State cannot exceed 50 characters."),
  zipcode: z
    .string()
    .min(5, "Zipcode must be exactly 5 characters.")
    .max(5, "Zipcode must be exactly 5 characters."),
  country: z
    .string()
    .min(1, "Country cannot be empty.")
    .max(50, "Country cannot exceed 50 characters."),
  skills: z
    .string()
    .regex(
      skillsRegex,
      "Invalid skills format. Must be a comma-separated list of skills.",
    ),
});

export const reviewSchema = z
  .object({
    rating: z.string(),
    reviewBody: z.string().optional(),
  })
  .refine((data) => parseInt(data.rating) >= 1 && parseInt(data.rating) <= 5, {
    message: "Rating must be an integer between 1 and 5",
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
const allowedStatuses = ["Not Started", "In Progress", "Completed", "On Hold"];

export const taskStatusSchema = z.object({
  status: z 
  .string()
  .refine((value) => allowedStatuses.includes(value), {
    message: "Invalid status selected.",
  }),
});

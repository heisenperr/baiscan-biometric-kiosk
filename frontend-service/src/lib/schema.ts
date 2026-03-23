import { z } from "zod";

export const UserSchema = z.object({
    id: z.number(),
    name: z.string().min(1, "First name is required"),
    mname: z.string().optional().nullable(),
    lname: z.string().min(1, "Last name is required"),
    suffix: z.string().optional().nullable(),
    email: z.string().email("Invalid email address"),
    role: z.enum(["admin", "user"]),
    phone_number: z.string().optional().nullable(),
    sex: z.enum(["male", "female", "other"]).optional().nullable(),
    age: z.number().int().positive().optional().nullable(),
    country_code: z.string().length(2).optional().nullable(),
});

export type UserProfile = z.infer<typeof UserSchema>;

export const LoginSchema = z.object({
    email: z.string()
        .min(1, "Email is required")
        .email("Please enter a valid email address"),
    password: z.string()
        .min(1, "Password is required")
        .min(6, "Password must be at least 6 characters long"),
});

export type LoginData = z.infer<typeof LoginSchema>;

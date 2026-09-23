import { z } from "zod";

export const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  college: z.string().optional(),
  location: z.string().optional(),
  skills: z.array(z.string()).min(1, "Please provide at least 1 skill"),
  interests: z.array(z.string()).optional().default([]),
  bio: z.string().max(500, "Bio max 500 characters").optional(),
});

export const LoginSchema = z.object({
  login: z.string().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
});

export const CreateTeamSchema = z.object({
  name: z.string().min(2, "Team name must be at least 2 characters"),
  eventId: z.string().min(1, "Event is required"),
  maxMembers: z.coerce.number().min(2, "Team must have at least 2 total members").max(12, "Max 12 members"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  requiredSkills: z.array(z.string()).min(1, "Specify at least 1 required skill"),
  preferredSkills: z.array(z.string()).optional().default([]),
  contactInfo: z.string().optional(),
});

export const CreateEventSchema = z.object({
  name: z.string().min(3, "Event name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  startDate: z.string().min(1, "Start date is required"),
  location: z.string().min(1, "Location is required"),
  mode: z.enum(["ONLINE", "OFFLINE", "HYBRID"]).default("HYBRID"),
});

export const CreateOrphanListingSchema = z.object({
  targetEventId: z.string().optional().nullable(),
  targetCategory: z.string().optional(),
  skills: z.array(z.string()).min(1, "Specify at least 1 skill"),
  experience: z.string().optional(),
  availability: z.string().min(1, "Availability status is required"),
  location: z.string().optional(),
  mode: z.enum(["ONLINE", "OFFLINE", "ANY"]).default("ANY"),
  bio: z.string().min(10, "Provide a short intro (at least 10 chars)"),
});

export const JoinRequestSchema = z.object({
  teamId: z.string().min(1, "Team ID is required"),
  message: z.string().max(500, "Message cannot exceed 500 characters").optional(),
});

export const MessageSchema = z.object({
  receiverId: z.string().min(1, "Recipient is required"),
  content: z.string().min(1, "Message cannot be empty").max(2000, "Message max 2000 characters"),
});

export const ReportSchema = z.object({
  reportedUserId: z.string().optional(),
  teamId: z.string().optional(),
  reason: z.string().min(5, "Please provide a reason for the report (min 5 characters)"),
});

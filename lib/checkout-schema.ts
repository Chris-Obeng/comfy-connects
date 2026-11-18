import { z } from "zod";
import { findBranch, isLocalRegion, localAreas } from "@/lib/config";

/** Accepts 024 123 4567, 0241234567, +233 24 123 4567 or 233241234567; returns 0XXXXXXXXX. */
export function normalizeGhanaPhone(value: string) {
  const digits = value.replace(/[^\d+]/g, "");
  if (digits.startsWith("+233")) return `0${digits.slice(4)}`;
  if (digits.startsWith("233") && digits.length === 12) return `0${digits.slice(3)}`;
  return digits;
}

const phonePattern = /^0(?:2|5)\d{8}$/;
const gpsPattern = /^[A-Z]{2}-?\d{3,4}-?\d{4}$/i;

export const checkoutSchema = z
  .object({
    fullName: z.string().trim().min(2, "Please tell us your name.").max(80, "That name is a little too long."),
    phone: z.string().trim().refine(v => phonePattern.test(normalizeGhanaPhone(v)), "Use a Ghana mobile number, e.g. 024 123 4567."),
    email: z.string().trim().email("That email doesn’t look right.").optional().or(z.literal("")),
    method: z.enum(["delivery", "pickup"]),
    /** Which shop the order is collected from, when method is pickup. */
    branch: z.string().optional(),
    region: z.string().optional(),
    area: z.string().optional(),
    city: z.string().trim().max(60, "Please shorten the town name.").optional(),
    address: z.string().trim().max(160, "Please keep the address a little shorter.").optional(),
    gps: z.string().trim().optional().refine(v => !v || gpsPattern.test(v), "GPS addresses look like GA-123-4567."),
    notes: z.string().trim().max(250, "Please keep notes under 250 characters.").optional(),
    payment: z.enum(["momo", "card"]),
  })
  .superRefine((data, ctx) => {
    if (data.method === "pickup") {
      if (!findBranch(data.branch))
        ctx.addIssue({ code: "custom", path: ["branch"], message: "Choose the shop you’ll collect from." });
      return;
    }
    if (!data.region) ctx.addIssue({ code: "custom", path: ["region"], message: "Choose your region." });
    if (isLocalRegion(data.region) && !localAreas[data.region!]?.some(a => a.name === data.area))
      ctx.addIssue({ code: "custom", path: ["area"], message: "Choose your town." });
    if (data.region && !isLocalRegion(data.region) && (!data.city || data.city.length < 2))
      ctx.addIssue({ code: "custom", path: ["city"], message: "Add your town or city." });
    if (!data.address || data.address.length < 5)
      ctx.addIssue({ code: "custom", path: ["address"], message: "Add a street, house number or landmark." });
  });

export type CheckoutValues = z.infer<typeof checkoutSchema>;

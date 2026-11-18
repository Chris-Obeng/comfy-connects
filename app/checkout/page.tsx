import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/checkout-form";
export const metadata: Metadata = { title: "Checkout", description: "Complete your Comfy Connects order with delivery across Ghana or free pickup in Koforidua and Kasoa.", robots: { index: false, follow: false } };
export default function CheckoutPage() {
  return <CheckoutForm />;
}

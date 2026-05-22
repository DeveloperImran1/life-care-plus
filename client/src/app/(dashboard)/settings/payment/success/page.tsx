import PaymentSuccessContent from "@/app/(dashboard)/settings/payment/_components/PaymentSuccessContent";

// Force dynamic rendering to ensure fresh data after payment
export const dynamic = "force-dynamic";

export default async function PaymentSuccessPage() {
  return <PaymentSuccessContent />;
}

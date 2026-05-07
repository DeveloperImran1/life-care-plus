import PaymentSuccessContent from "@/features/payment/components/PaymentSuccessContent";

// Force dynamic rendering to ensure fresh data after payment
export const dynamic = "force-dynamic";

export default async function PaymentSuccessPage() {
  return <PaymentSuccessContent />;
}

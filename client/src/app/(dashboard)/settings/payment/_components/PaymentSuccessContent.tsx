"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { revalidate } from "@/lib/helpers/revalidate";
import { getPaymentStatus } from "@/app/(dashboard)/settings/payment/_services";
import { CheckCircle2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const POLL_INTERVAL = 2000;
const MAX_POLL_ATTEMPTS = 15;

const PaymentSuccessContent = () => {
  const [countdown, setCountdown] = useState(5);
  const [pollStatus, setPollStatus] = useState<"polling" | "paid" | "timeout">("polling");
  const redirectedRef = useRef(false);

  const redirectToAppointments = useCallback(async () => {
    if (redirectedRef.current) return;
    redirectedRef.current = true;

    const storedUrl =
      sessionStorage.getItem("paymentReturnUrl") ||
      "/patient/dashboard/my-appointments";
    sessionStorage.removeItem("paymentReturnUrl");
    sessionStorage.removeItem("paymentAppointmentId");

    // Invalidate cache before navigating
    await revalidate("my-appointments");
    await revalidate("appointments-list");

    window.location.href = storedUrl;
  }, []);

  useEffect(() => {
    const appointmentId = sessionStorage.getItem("paymentAppointmentId");

    let pollCount = 0;
    let isMounted = true;

    const pollPaymentStatus = async () => {
      if (!appointmentId || pollCount >= MAX_POLL_ATTEMPTS) {
        if (isMounted) setPollStatus("timeout");
        return;
      }

      try {
        const result = await getPaymentStatus(appointmentId);
        if (isMounted && result.success && result.data?.paymentStatus === "PAID") {
          setPollStatus("paid");
          sessionStorage.removeItem("paymentAppointmentId");
          return;
        }
      } catch {
        // Silently retry
      }

      pollCount++;
      if (isMounted && pollCount < MAX_POLL_ATTEMPTS) {
        setTimeout(pollPaymentStatus, POLL_INTERVAL);
      } else if (isMounted) {
        setPollStatus("timeout");
      }
    };

    if (appointmentId) {
      setTimeout(pollPaymentStatus, 1000);
    } else {
      setPollStatus("timeout");
    }

    // Start countdown for redirect
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const redirectTimer = setTimeout(() => {
      isMounted = false;
      redirectToAppointments();
    }, 5000);

    return () => {
      isMounted = false;
      clearInterval(timer);
      clearTimeout(redirectTimer);
    };
  }, [redirectToAppointments]);

  const handleManualRedirect = () => {
    redirectToAppointments();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-green-50 to-emerald-50">
      <Card className="max-w-md w-full border-green-200 shadow-lg">
        <CardContent className="pt-8 pb-6">
          <div className="text-center space-y-6">
            {/* Success Icon */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-green-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
                <div className="relative bg-green-100 rounded-full p-4">
                  <CheckCircle2 className="h-20 w-20 text-green-600" />
                </div>
              </div>
            </div>

            {/* Success Message */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-green-900">
                Payment Successful!
              </h1>
              <p className="text-green-700">
                Your appointment has been confirmed and payment received.
              </p>
            </div>

            {/* Details */}
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-sm text-green-800">
                A confirmation email has been sent to your registered email
                address with appointment details.
              </p>
              {pollStatus === "polling" && (
                <p className="text-xs text-green-600 mt-2 animate-pulse">
                  Confirming payment with server...
                </p>
              )}
              {pollStatus === "paid" && (
                <p className="text-xs text-green-700 mt-2 font-medium">
                  ✓ Payment confirmed
                </p>
              )}
              {pollStatus === "timeout" && (
                <p className="text-xs text-amber-600 mt-2">
                  Payment status will update shortly
                </p>
              )}
            </div>

            {/* Countdown */}
            <div className="text-sm text-green-600">
              Redirecting to your appointments in {countdown} seconds...
            </div>

            {/* Action Button */}
            <Button
              onClick={handleManualRedirect}
              className="w-full bg-green-600 hover:bg-green-700"
              size="lg"
            >
              View My Appointments
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccessContent;

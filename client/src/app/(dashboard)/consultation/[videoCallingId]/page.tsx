// client/src/app/(dashboard)/consultation/[videoCallingId]/page.tsx
"use client";

import { use } from "react";
import { useCallObject, DailyProvider } from "@daily-co/daily-react";
import VideoCallRoom from "./_components/VideoCallRoom";

export default function ConsultationPage({
  params,
}: {
  params: Promise<{ videoCallingId: string }>;
}) {
  // Next.js 15 এর নিয়মে params থেকে ডাটা বের করা
  const { videoCallingId } = use(params);

  // Daily.co এর নিজস্ব হুক দিয়ে কল অবজেক্ট তৈরি করছি
  const callObject = useCallObject({
    options: {
      videoSource: true,
      audioSource: true,
    },
  });

  if (!callObject) {
    return <div className="p-10 text-center">Loading camera...</div>;
  }

  // Daily.co এর URL স্ট্রাকচার
  const DAILY_DOMAIN = "life-care-plus.daily.co"; // তোমার ডোমেইন
  const roomUrl = `https://${DAILY_DOMAIN}/${videoCallingId}`;

  return (
    <div className="h-[80vh] w-full bg-slate-900 rounded-xl overflow-hidden shadow-2xl relative">
      <DailyProvider callObject={callObject}>
        <VideoCallRoom roomUrl={roomUrl} />
      </DailyProvider>
    </div>
  );
}

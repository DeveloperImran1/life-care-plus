import type { ReactNode } from "react";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Headphones,
  HeartPulse,
  ShieldCheck,
  Star,
  Stethoscope,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

import heroImage from "../../../assets/images/hero_section.png";

const carePoints = [
  "Expert Doctors",
  "Secure & Private",
  "Quick Appointments",
  "24/7 Support",
];

const floatingCards = [
  {
    title: "Trusted Care",
    className: "left-3 top-20 lg:left-8 lg:top-24",
    icon: <HeartPulse className="size-8 fill-primary text-white" />,
  },
  {
    title: "Secure & Safe",
    className: "right-5 top-24 lg:right-8 lg:top-28",
    icon: <ShieldCheck className="size-8 fill-primary text-white" />,
  },
  {
    title: "24/7 Support",
    className: "bottom-32 left-0 lg:bottom-36 lg:left-0",
    icon: <Headphones className="size-8" />,
  },
  {
    title: "1000+ Doctors",
    className: "bottom-20 right-8 lg:bottom-24 lg:right-12",
    icon: <Users className="size-8 fill-primary text-primary" />,
  },
];

const stats = [
  {
    label: "Happy Patients",
    value: "50K+",
    icon: Users,
    className: "bg-emerald-100 text-emerald-600",
  },
  {
    label: "Expert Doctors",
    value: "1000+",
    icon: Stethoscope,
    className: "bg-blue-100 text-blue-600",
  },
  {
    label: "Patient Rating",
    value: "4.9/5",
    icon: Star,
    className: "bg-amber-100 text-amber-500",
  },
];

const FloatingCard = ({
  className,
  icon,
  title,
}: {
  className: string;
  icon: ReactNode;
  title: string;
}) => {
  return (
    <div
      className={`absolute z-30 hidden min-w-[136px] flex-col items-center gap-3 rounded-2xl bg-white/95 px-5 py-5 text-center shadow-[0_20px_50px_rgba(15,23,42,0.12)] ring-1 ring-black/5 backdrop-blur md:flex ${className}`}
    >
      <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        {icon}
      </div>
      <p className="text-sm font-extrabold text-foreground">{title}</p>
    </div>
  );
};

const DotCluster = ({ className }: { className: string }) => {
  return (
    <span
      aria-hidden="true"
      className={`absolute hidden h-24 w-24 bg-[radial-gradient(circle,rgba(15,150,130,0.26)_2px,transparent_2px)] bg-size-[18px_18px] md:block ${className}`}
    />
  );
};

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden border-b bg-[radial-gradient(circle_at_88%_8%,rgba(20,184,166,0.14),transparent_32%),linear-gradient(180deg,#fbfffe_0%,#effbf8_100%)]">
      <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute right-[-140px] top-[-130px] h-[620px] w-[620px] rounded-full bg-primary/10 blur-3xl" />

      <div className="container relative z-10 mx-auto grid min-h-[calc(100vh-4rem)] grid-cols-1 items-center gap-8 px-4 pb-10 pt-14 sm:px-6 lg:grid-cols-[0.86fr_1.14fr] lg:px-8 lg:pb-36 xl:gap-14">
        <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-left">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-bold text-foreground shadow-sm ring-1 ring-primary/15">
            <BadgeCheck className="size-5 text-primary" />
            Trusted by 50K+ Patients
          </div>

          <h1 className="text-4xl font-black leading-[1.06] tracking-normal text-foreground sm:text-6xl xl:text-7xl">
            Your Health,
            <span className="block text-primary">Our Priority</span>
          </h1>

          <p className="mx-auto mt-7 max-w-[620px] text-base leading-8 text-muted-foreground sm:text-lg lg:mx-0">
            LifeCare+ connects you with trusted doctors, advanced diagnostics,
            medicines and complete healthcare solutions, all in one place.
          </p>

          <div className="mx-auto mt-9 grid max-w-lg grid-cols-1 gap-x-12 gap-y-4 text-sm font-extrabold text-foreground sm:grid-cols-2 lg:mx-0">
            {carePoints.map((point) => (
              <div
                key={point}
                className="flex items-center justify-center gap-3 lg:justify-start"
              >
                <CheckCircle2 className="size-5 fill-primary text-white" />
                <span>{point}</span>
              </div>
            ))}
          </div>

          <Button
            asChild
            size="lg"
            className="mt-10 h-14 rounded-xl bg-primary px-8 text-base font-extrabold shadow-xl shadow-primary/25 hover:bg-primary/90"
          >
            <Link href="/doctors">
              Explore Services
              <ArrowRight className="size-6" />
            </Link>
          </Button>
        </div>

        <div className="relative mx-auto flex h-[520px] w-full max-w-[760px] items-center justify-center lg:h-[720px] xl:max-w-[860px]">
          <div className="absolute size-[430px] rounded-full bg-[#dff2ed] sm:size-[520px] lg:size-[675px]" />
          <div className="absolute size-[330px] rounded-full border-24 border-primary/20 sm:size-[430px] sm:border-32 lg:size-[555px] lg:border-42" />
          <div className="absolute size-[255px] rounded-full bg-white/45 blur-2xl sm:size-[360px] lg:size-[460px]" />

          <DotCluster className="left-6 top-28 lg:-left-8 lg:top-40" />
          <DotCluster className="right-0 top-[52%] lg:-right-6" />

          <span
            aria-hidden="true"
            className="absolute right-24 top-14 hidden text-7xl font-black leading-none text-primary/60 md:block"
          >
            +
          </span>
          <span
            aria-hidden="true"
            className="absolute bottom-24 left-24 hidden text-7xl font-black leading-none text-primary/45 md:block"
          >
            +
          </span>
          <span
            aria-hidden="true"
            className="absolute left-5 top-[45%] hidden size-8 rounded-full border-4 border-primary/25 md:block"
          />
          <span
            aria-hidden="true"
            className="absolute right-1 top-[40%] hidden size-8 rounded-full border-4 border-primary/25 md:block"
          />

          {floatingCards.map((card) => (
            <FloatingCard
              key={card.title}
              className={card.className}
              icon={card.icon}
              title={card.title}
            />
          ))}

          <Image
            src={heroImage}
            alt="Smiling doctor"
            priority
            className="relative z-20 mt-10 w-[760px] max-w-none select-none object-contain drop-shadow-[0_36px_70px_rgba(15,118,110,0.18)] sm:w-[900px] lg:mt-16 lg:w-[1040px] xl:w-[1120px]"
            sizes="(min-width: 1280px) 58vw, (min-width: 1024px) 54vw, 100vw"
          />
        </div>
      </div>

      <div className="container relative z-20 mx-auto px-4 pb-8 sm:px-6 lg:absolute lg:bottom-6 lg:left-1/2 lg:-translate-x-1/2 lg:px-8 lg:pb-0">
        <div className="grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3 lg:gap-5">
          {stats.map((item) => (
            <div
              key={item.label}
              className="flex min-h-32 items-center gap-5 rounded-2xl bg-white/95 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.10)] ring-1 ring-primary/10 backdrop-blur"
            >
              <div
                className={`flex size-[72px] shrink-0 items-center justify-center rounded-full ${item.className}`}
              >
                <item.icon
                  className={
                    item.icon === Star ? "size-9 fill-current" : "size-9"
                  }
                />
              </div>
              <div>
                <p className="text-3xl font-black leading-none text-foreground">
                  {item.value}
                </p>
                <p className="mt-3 text-sm font-medium text-muted-foreground">
                  {item.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

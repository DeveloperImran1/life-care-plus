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

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-[radial-gradient(circle_at_88%_8%,rgba(20,184,166,0.14),transparent_32%),linear-gradient(180deg,#fbfffe_0%,#effbf8_100%)]">
      <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute right-[-140px] top-[-130px] h-[620px] w-[620px] rounded-full bg-primary/10 blur-3xl" />

      <div className="container relative z-10 mx-auto grid grid-cols-1 items-center gap-7 px-4 pb-0 pt-10 sm:pt-16 sm:px-6 sm:pr-0 lg:min-h-[calc(100vh-4rem)] lg:grid-cols-[0.82fr_1.18fr] lg:gap-4 lg:pl-8 lg:pb-36 xl:gap-8 2xl:gap-14">
        <div className="mx-auto max-w-[370px] text-center sm:max-w-2xl lg:mx-0 lg:max-w-[520px] lg:text-left">
          <div className="mb-6 inline-flex max-w-full items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-xs font-bold text-foreground shadow-sm ring-1 ring-primary/15 sm:text-sm">
            <BadgeCheck className="size-4 shrink-0 text-primary sm:size-5" />
            Trusted by 50K+ Patients
          </div>

          <h1 className="text-[38px] font-black leading-[1.04] tracking-normal text-foreground sm:text-6xl lg:text-[56px] xl:text-[64px] 2xl:text-7xl">
            <span className="block whitespace-nowrap">Your Health,</span>
            <span className="block whitespace-nowrap text-primary">
              Our Priority
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-[620px] text-[15px] leading-7 text-muted-foreground sm:mt-7 sm:text-lg sm:leading-8 lg:mx-0 lg:max-w-[460px] xl:max-w-[540px]">
            LifeCare+ connects you with trusted doctors, advanced diagnostics,
            medicines and complete healthcare solutions, all in one place.
          </p>

          <div className="mx-auto mt-7 grid max-w-[360px] grid-cols-2 gap-3 text-[13px] font-extrabold text-foreground sm:mt-9 sm:max-w-lg sm:gap-x-12 sm:gap-y-4 sm:text-sm lg:mx-0 lg:max-w-[460px] lg:gap-x-8 xl:gap-x-12">
            {carePoints.map((point) => (
              <div
                key={point}
                className="flex min-h-11 items-center justify-start gap-2 rounded-full bg-white/75 px-3 py-2 text-left shadow-sm ring-1 ring-primary/10 sm:min-h-0 sm:gap-3 sm:bg-transparent sm:p-0 sm:shadow-none sm:ring-0"
              >
                <CheckCircle2 className="size-4 shrink-0 fill-primary text-white sm:size-5" />
                <span className="whitespace-nowrap">{point}</span>
              </div>
            ))}
          </div>

          <Button
            asChild
            size="lg"
            className="mt-8 h-12 rounded-xl bg-primary px-6 text-sm font-extrabold shadow-xl shadow-primary/25 hover:bg-primary/90 sm:mt-10 sm:h-14 sm:px-8 sm:text-base"
          >
            <Link href="/doctors">
              Explore Services
              <ArrowRight className="size-5 sm:size-6" />
            </Link>
          </Button>
        </div>

        <div className="relative mx-auto mt-1 flex h-[390px] w-full max-w-[390px] items-center justify-center sm:h-[520px] sm:max-w-[760px] lg:mt-0 lg:h-[660px] lg:max-w-[700px] ">
          <div className="absolute size-80 rounded-full bg-[#dff2ed] sm:size-[520px] lg:size-[610px] xl:size-[650px] 2xl:size-[675px]" />
          <div className="absolute size-[250px] rounded-full border-20 border-primary/20 sm:size-[430px] sm:border-32 lg:size-[500px] lg:border-36 xl:size-[535px] xl:border-40 2xl:size-[555px] 2xl:border-42" />
          <div className="absolute size-[210px] rounded-full bg-white/45 blur-2xl sm:size-[360px] lg:size-[410px] xl:size-[440px] 2xl:size-[460px]" />

          <DotCluster className="left-6 top-28 lg:-left-8 lg:top-40" />
          <DotCluster className="right-0 top-[52%] lg:-right-6" />

          <span
            aria-hidden="true"
            className="absolute right-12 top-3 text-5xl font-black leading-none text-primary/35 md:right-24 md:top-14 md:text-7xl md:text-primary/60"
          >
            +
          </span>
          <span
            aria-hidden="true"
            className="absolute bottom-20 left-12 text-5xl font-black leading-none text-primary/30 md:bottom-24 md:left-24 md:text-7xl md:text-primary/45"
          >
            +
          </span>
          <span
            aria-hidden="true"
            className="absolute left-8 top-[42%] text-4xl font-black leading-none text-primary/25 md:hidden"
          >
            +
          </span>
          <span
            aria-hidden="true"
            className="absolute bottom-10 right-16 text-4xl font-black leading-none text-primary/25 md:hidden"
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

          <MobileFeature
            className="left-0 top-8"
            icon={<HeartPulse className="size-5 fill-primary text-white" />}
            title="Trusted"
          />
          <MobileFeature
            className="right-0 top-12"
            icon={<ShieldCheck className="size-5 fill-primary text-white" />}
            title="Secure & Safe"
          />
          <MobileFeature
            className="bottom-16 left-0"
            icon={<Users className="size-5 fill-primary text-primary" />}
            title="1000+ Doctors"
          />
          <MobileFeature
            className="right-0 bottom-12"
            icon={<Headphones className="size-5" />}
            title="24/7 Care"
          />

          <Image
            src={heroImage}
            alt="Smiling doctor"
            priority
            className="relative z-20 mt-5 w-[620px] max-w-none select-none object-contain drop-shadow-[0_30px_60px_rgba(15,118,110,0.16)] sm:mt-10 sm:w-[900px] lg:mt-14 lg:translate-y-20 lg:w-[940px] xl:translate-y-24 xl:w-[1020px] 2xl:mt-16 2xl:translate-y-28 2xl:w-[1120px]"
            sizes="(min-width: 1280px) 58vw, (min-width: 1024px) 54vw, 100vw"
          />
        </div>
      </div>

      {/* Stats section  */}
      <div className="container relative z-20 mx-auto -mt-4 px-4 pb-6 sm:mt-0 sm:px-6 lg:absolute lg:bottom-6 lg:left-1/2 lg:-translate-x-1/2 lg:px-8 lg:pb-0">
        <div className="mx-auto grid max-w-md grid-cols-1 gap-3 sm:max-w-4xl sm:grid-cols-3 sm:gap-4 lg:max-w-3xl lg:gap-4 xl:max-w-4xl xl:gap-5">
          {stats.map((item) => (
            <div
              key={item.label}
              className="flex min-h-[104px] items-center gap-4 rounded-2xl bg-white/95 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.09)] ring-1 ring-primary/10 backdrop-blur sm:min-h-32 sm:gap-5 sm:p-6 lg:min-h-28 lg:p-5 xl:min-h-32 xl:p-6"
            >
              <div
                className={`flex size-12 shrink-0 items-center justify-center rounded-full sm:size-16 lg:size-[60px] xl:size-16 ${item.className}`}
              >
                <item.icon
                  className={
                    item.icon === Star
                      ? "size-6 fill-current sm:size-8 lg:size-[30px] xl:size-8"
                      : "size-6 sm:size-8 lg:size-[30px] xl:size-8"
                  }
                />
              </div>
              <div>
                <p className="text-2xl font-black leading-none text-foreground sm:text-3xl lg:text-2xl xl:text-3xl">
                  {item.value}
                </p>
                <p className="mt-2 text-sm font-medium text-muted-foreground sm:mt-3">
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

const carePoints = [
  "Expert Doctors",
  "Secure & Private",
  "Appointments",
  "24/7 Support",
];

const floatingCards = [
  {
    title: "Trusted Care",
    className:
      "left-3 top-20 lg:left-3 lg:top-20 xl:left-6 xl:top-24 2xl:left-8",
    icon: <HeartPulse className="size-6 fill-primary text-white" />,
  },
  {
    title: "Secure & Safe",
    className:
      "right-5 top-24 lg:right-3 lg:top-24 xl:right-6 xl:top-28 2xl:right-8",
    icon: <ShieldCheck className="size-6 fill-primary text-white" />,
  },
  {
    title: "24/7 Support",
    className: "bottom-32 left-0 lg:bottom-32 lg:left-2 xl:bottom-36",
    icon: <Headphones className="size-6" />,
  },
  {
    title: "1000+ Doctors",
    className:
      "bottom-20 right-8 lg:bottom-24 lg:right-4 xl:right-10 2xl:right-12",
    icon: <Users className="size-6 fill-primary text-primary" />,
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
      className={`absolute z-30 hidden min-w-[116px] flex-col items-center gap-2 rounded-2xl bg-white/95 px-3 py-3 text-center shadow-[0_20px_50px_rgba(15,23,42,0.12)] ring-1 ring-black/5 backdrop-blur md:flex xl:min-w-[124px] xl:px-4 xl:py-4 ${className}`}
    >
      <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary xl:size-12">
        {icon}
      </div>
      <p className="whitespace-nowrap text-[13px] font-extrabold text-foreground xl:text-sm">
        {title}
      </p>
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

const MobileFeature = ({
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
      className={`absolute z-30 flex items-center gap-2 rounded-2xl bg-white/95 px-3 py-2 text-xs font-extrabold text-foreground shadow-[0_14px_34px_rgba(15,23,42,0.12)] ring-1 ring-primary/10 backdrop-blur md:hidden ${className}`}
    >
      <span className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </span>
      {title}
    </div>
  );
};

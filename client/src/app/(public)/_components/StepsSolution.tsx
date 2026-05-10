import {
  Search,
  FileText,
  Calendar,
  Shield,
  Video,
  CreditCard,
  HeartPulse,
} from "lucide-react";

const steps = [
  {
    num: "01",
    title: "Search Doctor",
    description: "Find your doctor easily with a minimum of effort.",
    icon: Search,
    iconColor: "text-emerald-500",
    bgColor: "bg-emerald-50",
  },
  {
    num: "02",
    title: "Check Doctor Profile",
    description: "Get to know your doctor better.",
    icon: FileText,
    iconColor: "text-rose-500",
    bgColor: "bg-rose-50",
  },
  {
    num: "03",
    title: "Schedule Appointment",
    description: "Choose the time and date that suits you.",
    icon: Calendar,
    iconColor: "text-emerald-500",
    bgColor: "bg-emerald-50",
  },
  {
    num: "04",
    title: "Get Your Solution",
    description: "Our doctors are here to help you.",
    icon: Shield,
    iconColor: "text-amber-500",
    bgColor: "bg-amber-50",
  },
  {
    num: "05",
    title: "Electronic Prescription",
    description: "Get your prescription instantly.",
    icon: FileText,
    iconColor: "text-rose-500",
    bgColor: "bg-rose-50",
  },
  {
    num: "06",
    title: "Instant Video Consultation",
    description: "Consult with your doctor from anywhere.",
    icon: Video,
    iconColor: "text-emerald-500",
    bgColor: "bg-emerald-50",
  },
  {
    num: "07",
    title: "Easy Payment Options",
    description: "Pay with ease using various methods.",
    icon: CreditCard,
    iconColor: "text-amber-500",
    bgColor: "bg-amber-50",
  },
  {
    num: "08",
    title: "Health Recovery",
    description: "Start your journey to better health.",
    icon: HeartPulse,
    iconColor: "text-emerald-500",
    bgColor: "bg-emerald-50",
  },
];

const StepsSolution = () => {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center items-center mb-4">
            <svg
              width="48"
              height="24"
              viewBox="0 0 48 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0 12H18L21 6L27 18L30 12H48"
                stroke="#10B981"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Easy Steps to Get Your Solution
          </h2>
          <p className="text-gray-500 text-lg max-w-3xl mx-auto">
            We provide advanced technologies and high-quality healthcare
            services right here.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative group z-10">
              {/* Horizontal Dotted Line Connector */}
              {/* Visible only on large screens, and not on the last item of a row */}
              {(index + 1) % 4 !== 0 && (
                <div className="hidden lg:block absolute top-[84px] left-[50%] w-[calc(100%+1.5rem)] xl:w-[calc(100%+2rem)] h-0 border-t-2 border-dashed border-emerald-400/60 z-[-1]"></div>
              )}

              {/* Card Content */}
              <div className="bg-white rounded-2xl p-8 pt-10 flex flex-col items-center text-center shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] border border-gray-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 ease-in-out h-full w-full">
                {/* Step Number Badge */}
                <div className="absolute top-6 left-6 w-7 h-7 bg-[#0f766e] rounded-full flex items-center justify-center text-white text-[11px] font-bold shadow-sm">
                  {step.num}
                </div>

                {/* Icon Circle */}
                <div
                  className={`w-[88px] h-[88px] rounded-full flex items-center justify-center mb-6 ${step.bgColor} ring-12 ring-white transition-transform duration-300 group-hover:scale-105`}
                >
                  <step.icon
                    className={`w-9 h-9 ${step.iconColor}`}
                    strokeWidth={1.75}
                  />
                </div>

                {/* Text Content */}
                <h3 className="text-[17px] font-bold text-gray-900 mb-3 leading-snug">
                  {step.title}
                </h3>
                <p className="text-gray-500 text-[14px] leading-relaxed px-1">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StepsSolution;

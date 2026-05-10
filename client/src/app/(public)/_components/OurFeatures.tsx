import React from "react";
import Image from "next/image";

import ambulance from "../../../assets/icons/ambulance.png";
import nurse from "../../../assets/icons/nurse.png";
import doctor from "../../../assets/icons/medical-team.png";
import blood from "../../../assets/icons/blood-bag.png";
import tipsIcon from "../../../assets/icons/helpful-tips.png";
import doctorIcon from "../../../assets/icons/video-call.png";
import haltCarePackage from "../../../assets/icons/health-insurance.png";
import lotion from "../../../assets/icons/lotion.png";

const features = [
  {
    title: "Doctor Appointment",
    description: "Book appointments with trusted doctors",
    icon: doctor,
  },
  {
    title: "Life Style",
    description: "Tips and guidance for a healthy lifestyle",
    icon: tipsIcon,
  },
  {
    title: "Diagnostics & Hospitals",
    description: "Advanced diagnostics and hospital support",
    icon: blood,
  },
  {
    title: "Medicine",
    description: "Genuine medicines delivered to your door",
    icon: lotion, // Using lotion as a placeholder for medicine
  },
  {
    title: "Ambulance",
    description: "Emergency ambulance at your service",
    icon: ambulance,
  },
  {
    title: "Home Nursing Care",
    description: "Professional care at your home",
    icon: nurse,
  },
  {
    title: "Healthcare Packages",
    description: "Affordable packages for your health needs",
    icon: haltCarePackage,
  },
  {
    title: "Video Consultation",
    description: "Consult doctors from the comfort of home",
    icon: doctorIcon,
  },
];

const OurFeatures = () => {
  return (
    <section className="py-24 bg-[#FAFAFA]">
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
            Our Features
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Everything you need for a better healthcare experience
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 flex flex-col items-center text-center shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] border border-gray-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 ease-in-out cursor-pointer"
            >
              <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6 bg-slate-50/80">
                <Image
                  src={feature.icon}
                  alt={feature.title}
                  width={64}
                  height={64}
                  className="object-contain drop-shadow-sm transition-transform duration-300 hover:scale-110"
                />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OurFeatures;

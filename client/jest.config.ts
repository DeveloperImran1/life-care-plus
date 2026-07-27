import nextJest from "next/jest.js";

// Next.js-কে বলে দেওয়া হচ্ছে প্রজেক্টের রুট কোথায়
const createJestConfig = nextJest({
  dir: "./",
});

// কাস্টম Jest কনফিগারেশন
const config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom", // যেহেতু এটি ফ্রন্টএন্ড, তাই এনভায়রনমেন্ট jsdom হবে
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1", // যদি আপনার ইমপোর্টে @ ব্যবহার করা হয়, তবে এটি তা চিনতে সাহায্য করবে
  },
};

export default createJestConfig(config);

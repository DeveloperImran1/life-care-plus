import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true, // টেস্ট রান করার সময় বিস্তারিত আউটপুট দেখাবে
  testMatch: ['**/__tests__/**/*.test.ts'], // শুধুমাত্র .test.ts দিয়ে শেষ হওয়া ফাইলগুলো রান হবে
  clearMocks: true,
  transform: {
    '^.+\\.ts?$': ['ts-jest', { isolatedModules: true }],
  },
  moduleNameMapper: {
    // যখনই কেউ isomorphic-dompurify ইমপোর্ট করতে যাবে, Jest তাকে আমাদের ফেক ফাইলটি দিয়ে দিবে
    '^isomorphic-dompurify$': '<rootDir>/src/__tests__/mockDompurify.ts',
  },
};

export default config;

// server/src/__tests__/prismaMock.ts

import { PrismaClient } from '@prisma/client';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

// আমরা একটি ফেক (Fake) প্রিজমা ক্লায়েন্ট তৈরি করছি
export const prismaMock = mockDeep<PrismaClient>();

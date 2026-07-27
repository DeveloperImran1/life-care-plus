import request from 'supertest';
import app from '../app';
import bcryptjs from 'bcryptjs';
import { prismaMock } from './prismaMock';

// Jest-কে বলে দিচ্ছি আসল Prisma-এর বদলে আমাদের ফেক Prisma ব্যবহার করতে
jest.mock('../shared/prisma', () => ({
  __esModule: true,
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  default: require('./prismaMock').prismaMock,
}));

describe('Auth API Testing', () => {
  it('should login a user successfully with valid credentials', async () => {
    // ১. টেস্টের জন্য একটি ফেক পাসওয়ার্ড হ্যাশ করে নিচ্ছি
    const plainPassword = 'password123';
    const hashedPassword = await bcryptjs.hash(plainPassword, 10); // 👈 এখানে bcryptjs ব্যবহার করা হয়েছে

    // ২. ফেক ডাটাবেস সেটআপ
    const fakeUser = {
      id: 'test-user-id',
      email: 'test@example.com',
      password: hashedPassword,
      role: 'PATIENT',
      status: 'ACTIVE',
      needPasswordChange: false,
    };

    prismaMock.loginAttempt.findMany.mockResolvedValue([]);
    prismaMock.loginAttempt.create.mockResolvedValue({} as any);

    prismaMock.user.findUnique.mockResolvedValue(fakeUser as any);
    prismaMock.user.findUniqueOrThrow.mockResolvedValue(fakeUser as any);

    // ৩. Supertest দিয়ে লগইন API-তে POST রিকোয়েস্ট পাঠানো
    const response = await request(app).post('/api/v1/auth/login').send({
      email: 'test@example.com',
      password: plainPassword,
    });

    // ৪. যাচাই করা (Assertions)
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    // বডিতে যে ডাটা এসেছে তা চেক করা
    expect(response.body.data).toHaveProperty('needPasswordChange');

    // সিকিউর কুকিজে টোকেন সেট হয়েছে কিনা তা চেক করা
    expect(response.header['set-cookie']).toBeDefined();
  });
});

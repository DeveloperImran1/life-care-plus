// server/src/__tests__/app.test.ts

import request from 'supertest';
import app from '../app'; // আপনার মেইন Express অ্যাপ ইমপোর্ট করা হলো

describe('App Root API Testing', () => {
  it('should return a success message from the root endpoint', async () => {
    // Supertest ব্যবহার করে সার্ভারে একটি ফেইক GET রিকোয়েস্ট পাঠানো হচ্ছে
    const response = await request(app).get('/');

    // আমরা আশা (expect) করছি স্ট্যাটাস কোড ২০০ (OK) হবে
    expect(response.status).toBe(200);

    // আমরা আশা করছি রেসপন্স বডিতে ঠিক এই মেসেজটি থাকবে
    expect(response.body).toEqual({
      Message: 'Life Care Plus Server is running..',
    });
  });
});

const request = require('supertest');
const User = require('../models/userModel.js');
const app = require('../app.js');

describe('Auth API', function () {
  let testUser = {};

  beforeAll(async () => {
    testUser = await User.create({
      email: 'test@test.com',
      password: 'test123',
    });
  });
  // Test case for successfull login
  test('Properly log in user an return user data and token', async () => {
    const response = await request(app)
      .post('/login')
      .send({ email: testUser.email, password: testUser.password });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body.user.email).toBe(testUser.email);
    expect(response.body.subscription).toBe(testUser.subscription);
  });

  // Test case for unsuccessfull login
  // test('Not logging in user and return error message');
});

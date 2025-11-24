const request = require('supertest');
const app = require('../../src/app');

describe('Integration Tests - User Management Flow', () => {
  let createdUserId;

  it('should complete a full user lifecycle', async () => {
    // 1. Get initial user count
    const initialResponse = await request(app).get('/api/users');
    expect(initialResponse.status).toBe(200);
    const initialCount = initialResponse.body.count;

    // 2. Create a new user
    const newUser = {
      name: 'Integration Test User',
      email: 'integration@test.com'
    };

    const createResponse = await request(app)
      .post('/api/users')
      .send(newUser);

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.success).toBe(true);
    createdUserId = createResponse.body.data.id;

    // 3. Verify user was created
    const getUserResponse = await request(app).get(`/api/users/${createdUserId}`);
    expect(getUserResponse.status).toBe(200);
    expect(getUserResponse.body.data.name).toBe(newUser.name);
    expect(getUserResponse.body.data.email).toBe(newUser.email);

    // 4. Update the user
    const updateData = {
      name: 'Updated Integration User'
    };

    const updateResponse = await request(app)
      .put(`/api/users/${createdUserId}`)
      .send(updateData);

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.data.name).toBe(updateData.name);

    // 5. Verify update persisted
    const verifyUpdateResponse = await request(app).get(`/api/users/${createdUserId}`);
    expect(verifyUpdateResponse.body.data.name).toBe(updateData.name);

    // 6. Delete the user
    const deleteResponse = await request(app).delete(`/api/users/${createdUserId}`);
    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.success).toBe(true);

    // 7. Verify user was deleted
    const verifyDeleteResponse = await request(app).get(`/api/users/${createdUserId}`);
    expect(verifyDeleteResponse.status).toBe(404);

    // 8. Verify final count
    const finalResponse = await request(app).get('/api/users');
    expect(finalResponse.body.count).toBe(initialCount);
  });

  it('should handle multiple user creation', async () => {
    const users = [
      { name: 'User One', email: 'user1@test.com' },
      { name: 'User Two', email: 'user2@test.com' },
      { name: 'User Three', email: 'user3@test.com' }
    ];

    const createdIds = [];

    // Create multiple users
    for (const user of users) {
      const response = await request(app)
        .post('/api/users')
        .send(user);

      expect(response.status).toBe(201);
      createdIds.push(response.body.data.id);
    }

    // Verify all users exist
    for (const id of createdIds) {
      const response = await request(app).get(`/api/users/${id}`);
      expect(response.status).toBe(200);
    }

    // Clean up
    for (const id of createdIds) {
      await request(app).delete(`/api/users/${id}`);
    }
  });

  it('should maintain data consistency across operations', async () => {
    // Get all users
    const response = await request(app).get('/api/users');
    const users = response.body.data;

    // Verify each user has required fields
    users.forEach(user => {
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('name');
      expect(user).toHaveProperty('email');
      expect(typeof user.id).toBe('number');
      expect(typeof user.name).toBe('string');
      expect(typeof user.email).toBe('string');
    });
  });
});

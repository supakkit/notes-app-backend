import app from '../app.js';
import User from '../models/user.model.js';
import { describe, expect, it } from 'vitest';
import { api } from './setup/request.js';

describe('User Routes: POST /signup', () => {
  it('should create a new user successfully', async () => {
    const response = await api(app)
      .post('/signup')
      .send({ fullName: 'Alice', email: 'alice@email.com', password: 'password' });
    
    expect(response.status).toBe(201);
    expect(response.body.user).toHaveProperty("fullName", "Alice")
    expect(response.body.user).toHaveProperty("email", "alice@email.com")

    // Check that the user exists in the database
    const user = await User.findOne({ email: "alice@email.com" });
    expect(user).not.toBeNull();
    expect(user?.fullName).toBe("Alice");
  });



});
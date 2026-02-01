const request = require('supertest');

// Mock Prisma before importing app
jest.mock('../../src/config/prisma', () => ({
    user: {
        findUnique: jest.fn(),
        create: jest.fn(),
    },
    wallet: {
        create: jest.fn(),
    },
}));

const app = require('../../src/app');
const prisma = require('../../src/config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // You might want to mock this if token generation is complex

// We can mock bcrypt/jwt here if we want to ensure deterministic outputs, 
// but for integration it's often better to let them run if they are stateless.
// however, for speed and simplicity in "controller testing", mocking is fine.

describe('Auth API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/auth/signup', () => {
        it('should create a new user and return 201/200', async () => {
            const newUser = {
                email: 'new@example.com',
                phone: '+1234567890',
                password: 'password123',
                confirm_password: 'password123'
            };

            prisma.user.findUnique.mockResolvedValue(null); // No existing
            prisma.user.create.mockResolvedValue({
                id: 'user-id',
                email: newUser.email,
                phone: newUser.phone,
                role: 'USER',
                wallet: { id: 'wallet-id', balance: 0 }
            });

            const res = await request(app)
                .post('/api/auth/signup')
                .send(newUser);

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('success', true);
            expect(res.body.data).toHaveProperty('token');
            expect(res.body.data.user).toHaveProperty('email', newUser.email);
        });

        it('should return 400 if user already exists', async () => {
            prisma.user.findUnique.mockResolvedValue({ id: 'existing' });

            const res = await request(app)
                .post('/api/auth/signup')
                .send({
                    email: 'existing@example.com',
                    phone: '+1234567890',
                    password: 'password123',
                    confirm_password: 'password123'
                });

            expect(res.statusCode).toEqual(400);
            expect(res.body.success).toBe(false);
        });
    });

    describe('POST /api/auth/login', () => {
        it('should login successfully with correct credentials', async () => {
            // Note: Since we are not mocking bcrypt in this file (it's mocked in service unit tests, 
            // but here we are loading the real service but mocked prisma), 
            // the real service calls bcrypt.compare.
            // So we need to ensure the mocked user has a hash that matches 'password123'.

            // To simplify integration tests without real DB, we can mock the entire service
            // OR we mock bcrypt here too. Let's mock prisma return value to simulate DB state.

            // Actually, generating a real hash is fast enough.
            const hash = await require('bcryptjs').hash('password123', 10);

            prisma.user.findUnique.mockResolvedValue({
                id: 'user-id',
                email: 'test@example.com',
                passwordHash: hash,
                role: 'USER'
            });

            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'password123'
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('success', true);
            expect(res.body.data).toHaveProperty('token');
        });

        it('should return 401 for invalid credentials', async () => {
            prisma.user.findUnique.mockResolvedValue(null); // User not found

            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'wrong@example.com',
                    password: 'password123'
                });

            expect(res.statusCode).toEqual(401);
        });
    });
});

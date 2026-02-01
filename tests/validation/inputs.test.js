const request = require('supertest');

// Mock Prisma
jest.mock('../../src/config/prisma', () => ({
    user: { findUnique: jest.fn() },
    wallet: { findUnique: jest.fn() },
}));

// Mock Auth Middleware 
jest.mock('../../src/middleware/auth', () => ({
    requireAuth: (req, res, next) => {
        req.user = { id: 'user-123', role: 'USER' }; // Fake authenticated user
        next();
    },
    requireAdmin: (req, res, next) => next(), // Allow admin access
}));

const app = require('../../src/app');

describe('Input Validation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Auth Validation', () => {
        it('should reject invalid email on signup', async () => {
            const res = await request(app)
                .post('/api/auth/signup')
                .send({
                    email: 'not-an-email',
                    phone: '+1234567890',
                    password: 'password123',
                    confirm_password: 'password123'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toContain('Validation error');
        });

        it('should reject short password on signup', async () => {
            const res = await request(app)
                .post('/api/auth/signup')
                .send({
                    email: 'test@example.com',
                    phone: '+1234567890',
                    password: '123',
                    confirm_password: '123'
                });

            expect(res.statusCode).toBe(400);
        });

        it('should reject when passwords do not match', async () => {
            const res = await request(app)
                .post('/api/auth/signup')
                .send({
                    email: 'test@example.com',
                    phone: '+1234567890',
                    password: 'password123',
                    confirm_password: 'different'
                });

            expect(res.statusCode).toBe(400);
        });
    });

    describe('Wallet Validation', () => {
        it('should reject invalid PIN format (too short)', async () => {
            const res = await request(app)
                .post('/api/wallet/set-pin')
                .send({ pin: '123' }); // Min 4

            expect(res.statusCode).toBe(400);
        });

        it('should reject invalid PIN format (non-numeric)', async () => {
            const res = await request(app)
                .post('/api/wallet/set-pin')
                .send({ pin: 'abcd' });

            expect(res.statusCode).toBe(400);
        });

        it('should reject negative topup amount', async () => {
            const res = await request(app)
                .post('/api/wallet/topup')
                .send({ amount: -500 });

            expect(res.statusCode).toBe(400);
        });
    });

    describe('Mall Validation', () => {
        it('should reject scan-pay without palm data', async () => {
            const res = await request(app)
                .post('/api/mall/scan-pay')
                .send({
                    phone: '+1234567890',
                    amount: 100
                });

            // Missing both embedding and bitmap
            expect(res.statusCode).toBe(400);
            expect(res.body.message).toContain('Validation error');
        });

        it('should reject scan-pay with BOTH palm data types (XOR check)', async () => {
            const res = await request(app)
                .post('/api/mall/scan-pay')
                .send({
                    phone: '+1234567890',
                    amount: 100,
                    palm_embedding: [0.1, 0.2],
                    palm_bitmap: 'base64string'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.details).toBeDefined(); // Should contain message about XOR
        });
    });
});

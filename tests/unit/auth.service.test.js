/**
 * Unit Tests for Auth Service
 * Tests signup, login, and token generation functionality
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authService = require('../../src/services/auth.service');
const prisma = require('../../src/config/prisma');

// Mock Prisma
jest.mock('../../src/config/prisma', () => ({
    user: {
        findUnique: jest.fn(),
        create: jest.fn(),
    },
}));

// Mock bcrypt
jest.mock('bcryptjs');

// Mock jwt
jest.mock('jsonwebtoken');

describe('Auth Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('signup', () => {
        it('should successfully create a new user', async () => {
            const mockUser = {
                id: 'user-123',
                email: 'test@example.com',
                phone: '+1234567890',
                role: 'USER',
                kycStatus: 'PENDING',
                palmRegistered: false,
                wallet: { id: 'wallet-123', balance: 0 },
            };

            prisma.user.findUnique.mockResolvedValue(null); // No existing user
            bcrypt.hash.mockResolvedValue('hashed-password');
            prisma.user.create.mockResolvedValue(mockUser);
            jwt.sign.mockReturnValue('mock-jwt-token');

            const result = await authService.signup({
                email: 'test@example.com',
                phone: '+1234567890',
                password: 'password123',
            });

            expect(result).toHaveProperty('user');
            expect(result).toHaveProperty('token');
            expect(result.user.email).toBe('test@example.com');
            expect(result.token).toBe('mock-jwt-token');
            expect(prisma.user.create).toHaveBeenCalledTimes(1);
        });

        it('should throw error if email already exists', async () => {
            prisma.user.findUnique.mockResolvedValueOnce({ id: '1', email: 'test@example.com' });

            await expect(
                authService.signup({
                    email: 'test@example.com',
                    phone: '+1234567890',
                    password: 'password123',
                })
            ).rejects.toThrow('Email already registered');
        });

        it('should throw error if phone already exists', async () => {
            prisma.user.findUnique
                .mockResolvedValueOnce(null) // Email check
                .mockResolvedValueOnce({ id: '1', phone: '+1234567890' }); // Phone check

            await expect(
                authService.signup({
                    email: 'test@example.com',
                    phone: '+1234567890',
                    password: 'password123',
                })
            ).rejects.toThrow('Phone already registered');
        });
    });

    describe('login', () => {
        it('should successfully login with email', async () => {
            const mockUser = {
                id: 'user-123',
                email: 'test@example.com',
                phone: '+1234567890',
                passwordHash: 'hashed-password',
                role: 'USER',
                kycStatus: 'PENDING',
                palmRegistered: false,
            };

            prisma.user.findUnique.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(true);
            jwt.sign.mockReturnValue('mock-jwt-token');

            const result = await authService.login({
                email: 'test@example.com',
                password: 'password123',
            });

            expect(result).toHaveProperty('user');
            expect(result).toHaveProperty('token');
            expect(result.user.email).toBe('test@example.com');
            expect(result.token).toBe('mock-jwt-token');
        });

        it('should successfully login with phone', async () => {
            const mockUser = {
                id: 'user-123',
                email: 'test@example.com',
                phone: '+1234567890',
                passwordHash: 'hashed-password',
                role: 'USER',
                kycStatus: 'PENDING',
                palmRegistered: false,
            };

            prisma.user.findUnique.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(true);
            jwt.sign.mockReturnValue('mock-jwt-token');

            const result = await authService.login({
                phone: '+1234567890',
                password: 'password123',
            });

            expect(result).toHaveProperty('user');
            expect(result).toHaveProperty('token');
            expect(result.user.phone).toBe('+1234567890');
        });

        it('should throw error if user not found', async () => {
            prisma.user.findUnique.mockResolvedValue(null);

            await expect(
                authService.login({
                    email: 'nonexistent@example.com',
                    password: 'password123',
                })
            ).rejects.toThrow('Invalid credentials');
        });

        it('should throw error if password is incorrect', async () => {
            const mockUser = {
                id: 'user-123',
                email: 'test@example.com',
                passwordHash: 'hashed-password',
            };

            prisma.user.findUnique.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(false);

            await expect(
                authService.login({
                    email: 'test@example.com',
                    password: 'wrongpassword',
                })
            ).rejects.toThrow('Invalid credentials');
        });
    });
});

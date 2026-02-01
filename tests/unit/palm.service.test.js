/**
 * Unit Tests for Palm Service
 * Tests palm enrollment and matching functionality
 */

const palmService = require('../../src/services/palm.service');
const prisma = require('../../src/config/prisma');

// Mock Prisma
jest.mock('../../src/config/prisma', () => ({
    palmData: {
        upsert: jest.fn(),
        findMany: jest.fn(),
    },
    user: {
        update: jest.fn(),
    },
}));

// Mock utils
jest.mock('../../src/utils/crypto', () => ({
    encryptEmbedding: jest.fn(val => 'encrypted-' + JSON.stringify(val)),
    decryptEmbedding: jest.fn(val => JSON.parse(val.replace('encrypted-', ''))),
    cosineSimilarity: jest.fn((a, b) => {
        // Simple mock similarity for testing
        if (JSON.stringify(a) === JSON.stringify(b)) return 1.0;
        return 0.1;
    }),
}));

jest.mock('../../src/utils/palm', () => ({
    validateEmbeddingArray: jest.fn(arr => {
        if (!Array.isArray(arr) || arr.length === 0) throw new Error('Invalid embedding');
        return true;
    }),
}));

describe('Palm Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('enrollPalm', () => {
        it('should successfully enroll palm', async () => {
            const embedding = [0.1, 0.2, 0.3];
            const mockPalmData = {
                userId: 'user-123',
                encryptedEmbedding: 'encrypted-[0.1,0.2,0.3]'
            };

            prisma.palmData.upsert.mockResolvedValue(mockPalmData);
            prisma.user.update.mockResolvedValue({});

            const result = await palmService.enrollPalm('user-123', embedding);

            expect(result).toEqual(mockPalmData);
            expect(prisma.palmData.upsert).toHaveBeenCalled();
            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: 'user-123' },
                data: { palmRegistered: true, kycStatus: 'APPROVED' },
            });
        });

        it('should throw error for invalid embedding', async () => {
            // We're relying on the mock validating this, but let's test the call mostly.
            // If validateEmbeddingArray throws, execution stops.
            const { validateEmbeddingArray } = require('../../src/utils/palm');
            validateEmbeddingArray.mockImplementationOnce(() => {
                throw new Error('Invalid embedding');
            });

            await expect(palmService.enrollPalm('user-123', [])).rejects.toThrow('Invalid embedding');
        });
    });

    describe('findUserByPalmEmbedding', () => {
        it('should find matching user above threshold', async () => {
            const targetEmbedding = [0.1, 0.2, 0.3];
            const mockUser = { id: 'user-123', email: 'test@example.com' };

            const mockAllPalmData = [
                {
                    userId: 'user-123',
                    encryptedEmbedding: 'encrypted-[0.1,0.2,0.3]',
                    user: mockUser
                },
                {
                    userId: 'user-456',
                    encryptedEmbedding: 'encrypted-[0.9,0.9,0.9]',
                    user: { id: 'user-456' }
                }
            ];

            prisma.palmData.findMany.mockResolvedValue(mockAllPalmData);

            const result = await palmService.findUserByPalmEmbedding(targetEmbedding);

            expect(result).not.toBeNull();
            expect(result.user).toEqual(mockUser);
            expect(result.similarity).toBe(1.0);
        });

        it('should return null if no match found above threshold', async () => {
            const targetEmbedding = [0.1, 0.2, 0.3];

            const mockAllPalmData = [
                {
                    userId: 'user-456',
                    encryptedEmbedding: 'encrypted-[0.9,0.9,0.9]', // Different
                    user: { id: 'user-456' }
                }
            ];

            prisma.palmData.findMany.mockResolvedValue(mockAllPalmData);

            const result = await palmService.findUserByPalmEmbedding(targetEmbedding);

            expect(result).toBeNull();
        });
    });
});

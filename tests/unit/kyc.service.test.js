/**
 * Unit Tests for KYC Service
 * Tests KYC upload and verification functionality
 */

const kycService = require('../../src/services/kyc.service');
const prisma = require('../../src/config/prisma');

// Mock Prisma
jest.mock('../../src/config/prisma', () => ({
    kyc: {
        upsert: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
    },
    user: {
        update: jest.fn(),
    },
}));

describe('KYC Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('uploadKyc', () => {
        it('should successfully upload KYC documents', async () => {
            const mockKyc = {
                id: 'kyc-123',
                userId: 'user-123',
                aadhaarImageUrl: 'http://example.com/aadhaar.jpg',
                panImageUrl: 'http://example.com/pan.jpg',
                status: 'PENDING',
            };

            prisma.kyc.upsert.mockResolvedValue(mockKyc);
            prisma.user.update.mockResolvedValue({});

            const result = await kycService.uploadKyc('user-123', {
                aadhaarImageUrl: 'http://example.com/aadhaar.jpg',
                panImageUrl: 'http://example.com/pan.jpg',
            });

            expect(result).toEqual(mockKyc);
            expect(prisma.kyc.upsert).toHaveBeenCalledWith(expect.objectContaining({
                where: { userId: 'user-123' },
                create: expect.objectContaining({
                    userId: 'user-123',
                    status: 'PENDING',
                }),
                update: expect.objectContaining({
                    status: 'PENDING',
                }),
            }));
            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: 'user-123' },
                data: { kycStatus: 'PENDING' },
            });
        });
    });

    describe('verifyKyc', () => {
        it('should approve KYC when decision is approve', async () => {
            const mockExistingKyc = { userId: 'user-123', status: 'PENDING' };
            const mockUpdatedKyc = { ...mockExistingKyc, status: 'APPROVED' };

            prisma.kyc.findUnique.mockResolvedValue(mockExistingKyc);
            prisma.kyc.update.mockResolvedValue(mockUpdatedKyc);
            prisma.user.update.mockResolvedValue({});

            const result = await kycService.verifyKyc({ userId: 'user-123', decision: 'approve' });

            expect(result.status).toBe('APPROVED');
            expect(prisma.kyc.update).toHaveBeenCalledWith({
                where: { userId: 'user-123' },
                data: { status: 'APPROVED' },
            });
            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: 'user-123' },
                data: { kycStatus: 'APPROVED' },
            });
        });

        it('should reject KYC when decision is reject', async () => {
            const mockExistingKyc = { userId: 'user-123', status: 'PENDING' };
            const mockUpdatedKyc = { ...mockExistingKyc, status: 'REJECTED' };

            prisma.kyc.findUnique.mockResolvedValue(mockExistingKyc);
            prisma.kyc.update.mockResolvedValue(mockUpdatedKyc);
            prisma.user.update.mockResolvedValue({});

            const result = await kycService.verifyKyc({ userId: 'user-123', decision: 'reject' });

            expect(result.status).toBe('REJECTED');
            expect(prisma.kyc.update).toHaveBeenCalledWith({
                where: { userId: 'user-123' },
                data: { status: 'REJECTED' },
            });
            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: 'user-123' },
                data: { kycStatus: 'REJECTED' },
            });
        });

        it('should throw error if KYC record not found', async () => {
            prisma.kyc.findUnique.mockResolvedValue(null);

            await expect(kycService.verifyKyc({ userId: 'user-123', decision: 'approve' }))
                .rejects.toThrow('KYC record not found for user');
        });
    });
});

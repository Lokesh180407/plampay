/**
 * Unit Tests for Mall Service
 * Tests mall scan-and-pay processing logic
 */

const mallService = require('../../src/services/mall.service');
const walletService = require('../../src/services/wallet.service');
const prisma = require('../../src/config/prisma');

// Mock dependencies
jest.mock('../../src/services/wallet.service');
jest.mock('../../src/services/palm.service');
jest.mock('../../src/config/prisma', () => ({
    user: {
        findUnique: jest.fn(),
    },
}));

jest.mock('../../src/utils/crypto', () => ({
    decryptEmbedding: jest.fn(val => val === 'enc-match' ? [0.1, 0.2] : [0.9, 0.9]),
    cosineSimilarity: jest.fn((a, b) => {
        // If first element matches, return 1.0, else 0.0
        return a[0] === b[0] ? 1.0 : 0.0;
    }),
}));

jest.mock('../../src/utils/palm', () => ({
    validateEmbeddingArray: jest.fn(),
    extractEmbeddingFromBitmap: jest.fn(),
}));

describe('Mall Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('processMallScanPay', () => {
        it('should process payment successfully when palm matches', async () => {
            const mockUser = {
                id: 'user-123',
                phone: '+1234567890',
                kycStatus: 'APPROVED',
                palmData: { encryptedEmbedding: 'enc-match' },
                wallet: { id: 'wallet-123', balance: 1000 },
            };

            const mockTxnResult = {
                transaction: { id: 'txn-123' },
                wallet: { balance: 900 },
            };

            prisma.user.findUnique.mockResolvedValue(mockUser);
            walletService.deductBalance.mockResolvedValue(mockTxnResult);

            const result = await mallService.processMallScanPay({
                phone: '+1234567890',
                palmEmbedding: [0.1, 0.2], // Matches 'enc-match' via mock logic
                amount: 100,
            });

            expect(result.userId).toBe('user-123');
            expect(result.newBalance).toBe(900);
            expect(walletService.deductBalance).toHaveBeenCalledWith(
                'wallet-123',
                100,
                null,
                'Mall scan-pay'
            );
        });

        it('should throw error if user not found', async () => {
            prisma.user.findUnique.mockResolvedValue(null);

            await expect(mallService.processMallScanPay({
                phone: '+1234567890',
                palmEmbedding: [0.1, 0.2],
                amount: 100,
            })).rejects.toThrow('User not found');
        });

        it('should throw error if palm does not match', async () => {
            const mockUser = {
                id: 'user-123',
                phone: '+1234567890',
                kycStatus: 'APPROVED',
                palmData: { encryptedEmbedding: 'enc-mismatch' }, // Will decrypt to [0.9, 0.9]
                wallet: { id: 'wallet-123' },
            };

            prisma.user.findUnique.mockResolvedValue(mockUser);

            await expect(mallService.processMallScanPay({
                phone: '+1234567890',
                palmEmbedding: [0.1, 0.2], // Mismatch
                amount: 100,
            })).rejects.toThrow('Palm not matched');
        });

        it('should throw error if KYC not completed', async () => {
            const mockUser = {
                id: 'user-123',
                phone: '+1234567890',
                kycStatus: 'PENDING',
                palmData: { encryptedEmbedding: 'enc-match' },
                wallet: { id: 'wallet-123' },
            };

            prisma.user.findUnique.mockResolvedValue(mockUser);

            await expect(mallService.processMallScanPay({
                phone: '+1234567890',
                palmEmbedding: [0.1, 0.2],
                amount: 100,
            })).rejects.toThrow('KYC not completed');
        });
    });
});

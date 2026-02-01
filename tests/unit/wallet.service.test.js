/**
 * Unit Tests for Wallet Service
 * Tests wallet operations including PIN, balance, and transactions
 */

const bcrypt = require('bcryptjs');
const walletService = require('../../src/services/wallet.service');
const prisma = require('../../src/config/prisma');

// Mock Prisma
jest.mock('../../src/config/prisma', () => ({
    wallet: {
        findUnique: jest.fn(),
        update: jest.fn(),
    },
    transaction: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
    },
    $transaction: jest.fn(),
}));

// Mock bcrypt
jest.mock('bcryptjs');

describe('Wallet Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getWalletByUserId', () => {
        it('should return wallet for valid user', async () => {
            const mockWallet = {
                id: 'wallet-123',
                userId: 'user-123',
                balance: 1000,
                currency: 'INR',
                user: { id: 'user-123', email: 'test@example.com' },
            };

            prisma.wallet.findUnique.mockResolvedValue(mockWallet);

            const result = await walletService.getWalletByUserId('user-123');

            expect(result).toEqual(mockWallet);
            expect(prisma.wallet.findUnique).toHaveBeenCalledWith({
                where: { userId: 'user-123' },
                include: { user: true },
            });
        });

        it('should throw error if wallet not found', async () => {
            prisma.wallet.findUnique.mockResolvedValue(null);

            await expect(walletService.getWalletByUserId('nonexistent')).rejects.toThrow(
                'Wallet not found'
            );
        });
    });

    describe('setPin', () => {
        it('should successfully set wallet PIN', async () => {
            const mockWallet = { id: 'wallet-123', pinHash: 'hashed-pin' };

            bcrypt.hash.mockResolvedValue('hashed-pin');
            prisma.wallet.update.mockResolvedValue(mockWallet);

            const result = await walletService.setPin('user-123', '1234');

            expect(result).toEqual(mockWallet);
            expect(bcrypt.hash).toHaveBeenCalledWith('1234', expect.any(Number));
            expect(prisma.wallet.update).toHaveBeenCalled();
        });

        it('should throw error if PIN is too short', async () => {
            await expect(walletService.setPin('user-123', '123')).rejects.toThrow(
                'PIN must be 4-6 digits'
            );
        });

        it('should throw error if PIN is too long', async () => {
            await expect(walletService.setPin('user-123', '1234567')).rejects.toThrow(
                'PIN must be 4-6 digits'
            );
        });

        it('should throw error if PIN is empty', async () => {
            await expect(walletService.setPin('user-123', '')).rejects.toThrow(
                'PIN must be 4-6 digits'
            );
        });
    });

    describe('verifyPin', () => {
        it('should successfully verify correct PIN', async () => {
            const mockWallet = {
                id: 'wallet-123',
                userId: 'user-123',
                pinHash: 'hashed-pin',
                user: { id: 'user-123' },
            };

            prisma.wallet.findUnique.mockResolvedValue(mockWallet);
            bcrypt.compare.mockResolvedValue(true);

            const result = await walletService.verifyPin('user-123', '1234');

            expect(result).toBe(true);
            expect(bcrypt.compare).toHaveBeenCalledWith('1234', 'hashed-pin');
        });

        it('should throw error if PIN not set', async () => {
            const mockWallet = {
                id: 'wallet-123',
                userId: 'user-123',
                pinHash: null,
                user: { id: 'user-123' },
            };

            prisma.wallet.findUnique.mockResolvedValue(mockWallet);

            await expect(walletService.verifyPin('user-123', '1234')).rejects.toThrow('PIN not set');
        });

        it('should throw error if PIN is incorrect', async () => {
            const mockWallet = {
                id: 'wallet-123',
                userId: 'user-123',
                pinHash: 'hashed-pin',
                user: { id: 'user-123' },
            };

            prisma.wallet.findUnique.mockResolvedValue(mockWallet);
            bcrypt.compare.mockResolvedValue(false);

            await expect(walletService.verifyPin('user-123', 'wrong')).rejects.toThrow('Invalid PIN');
        });
    });

    describe('getBalance', () => {
        it('should return wallet balance', async () => {
            const mockWallet = {
                id: 'wallet-123',
                userId: 'user-123',
                balance: 1500.5,
                currency: 'INR',
                user: { id: 'user-123' },
            };

            prisma.wallet.findUnique.mockResolvedValue(mockWallet);

            const result = await walletService.getBalance('user-123');

            expect(result).toEqual({
                balance: 1500.5,
                currency: 'INR',
            });
        });
    });

    describe('creditBalanceTest', () => {
        it('should successfully credit test balance', async () => {
            const mockWallet = {
                id: 'wallet-123',
                userId: 'user-123',
                balance: 1000,
                user: { id: 'user-123' },
            };

            const mockTransaction = {
                id: 'txn-123',
                amount: 500,
                type: 'TOPUP',
                status: 'SUCCESS',
            };

            const mockUpdatedWallet = {
                ...mockWallet,
                balance: 1500,
            };

            prisma.wallet.findUnique.mockResolvedValue(mockWallet);
            prisma.$transaction.mockImplementation(async (callback) => {
                return callback({
                    transaction: { create: jest.fn().mockResolvedValue(mockTransaction) },
                    wallet: { update: jest.fn().mockResolvedValue(mockUpdatedWallet) },
                });
            });

            const result = await walletService.creditBalanceTest('user-123', 500);

            expect(result).toHaveProperty('transactionId');
            expect(result).toHaveProperty('newBalance');
            expect(result.newBalance).toBe(1500);
        });

        it('should throw error if amount is zero or negative', async () => {
            const mockWallet = {
                id: 'wallet-123',
                userId: 'user-123',
                balance: 1000,
                user: { id: 'user-123' },
            };

            prisma.wallet.findUnique.mockResolvedValue(mockWallet);

            await expect(walletService.creditBalanceTest('user-123', 0)).rejects.toThrow(
                'Amount must be greater than 0'
            );
            await expect(walletService.creditBalanceTest('user-123', -100)).rejects.toThrow(
                'Amount must be greater than 0'
            );
        });
    });

    describe('deductBalance', () => {
        it('should successfully deduct balance', async () => {
            const mockWallet = {
                id: 'wallet-123',
                userId: 'user-123',
                balance: 1000,
                user: {
                    id: 'user-123',
                    kycStatus: 'APPROVED',
                },
            };

            prisma.wallet.findUnique.mockResolvedValue(mockWallet);
            prisma.$transaction.mockImplementation(async (callback) => {
                const mockUpdatedWallet = { ...mockWallet, balance: 900 };
                const mockTransaction = {
                    id: 'txn-123',
                    amount: 100,
                    type: 'PAYMENT',
                    status: 'SUCCESS',
                };
                return callback({
                    wallet: { update: jest.fn().mockResolvedValue(mockUpdatedWallet) },
                    transaction: { create: jest.fn().mockResolvedValue(mockTransaction) },
                });
            });

            const result = await walletService.deductBalance('wallet-123', 100, 'terminal-1', 'Payment');

            expect(result).toBeDefined();
        });

        it('should throw error if wallet not found', async () => {
            prisma.wallet.findUnique.mockResolvedValue(null);

            await expect(
                walletService.deductBalance('nonexistent', 100, 'terminal-1', 'Payment')
            ).rejects.toThrow('Wallet not found');
        });

        it('should throw error if KYC not approved', async () => {
            const mockWallet = {
                id: 'wallet-123',
                balance: 1000,
                user: {
                    id: 'user-123',
                    kycStatus: 'PENDING',
                },
            };

            prisma.wallet.findUnique.mockResolvedValue(mockWallet);

            await expect(
                walletService.deductBalance('wallet-123', 100, 'terminal-1', 'Payment')
            ).rejects.toThrow('KYC not approved');
        });

        it('should throw error if insufficient balance', async () => {
            const mockWallet = {
                id: 'wallet-123',
                balance: 50,
                user: {
                    id: 'user-123',
                    kycStatus: 'APPROVED',
                },
            };

            prisma.wallet.findUnique.mockResolvedValue(mockWallet);

            await expect(
                walletService.deductBalance('wallet-123', 100, 'terminal-1', 'Payment')
            ).rejects.toThrow('Insufficient balance');
        });
    });
});

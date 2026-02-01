/**
 * Unit Tests for Terminal Service
 * Tests terminal creation and API key hashing
 */

const bcrypt = require('bcryptjs');
const terminalService = require('../../src/services/terminal.service');
const prisma = require('../../src/config/prisma');

// Mock Prisma
jest.mock('../../src/config/prisma', () => ({
    terminal: {
        findUnique: jest.fn(),
        create: jest.fn(),
    },
}));

// Mock bcrypt
jest.mock('bcryptjs');

describe('Terminal Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createTerminal', () => {
        it('should successfully create a terminal', async () => {
            const mockTerminal = {
                id: 'uuid',
                terminalId: 'TERM-001',
                merchant: 'Coffee Shop',
            };

            prisma.terminal.findUnique.mockResolvedValue(null); // No existing
            bcrypt.hash.mockResolvedValue('hashed-api-key');
            prisma.terminal.create.mockResolvedValue(mockTerminal);

            const result = await terminalService.createTerminal({
                terminalId: 'TERM-001',
                apiKey: 'secure-key',
                merchant: 'Coffee Shop',
                location: 'NYC',
            });

            expect(result).toEqual(mockTerminal);
            expect(bcrypt.hash).toHaveBeenCalledWith('secure-key', expect.any(Number));
            expect(prisma.terminal.create).toHaveBeenCalledWith({
                data: {
                    terminalId: 'TERM-001',
                    apiKeyHash: 'hashed-api-key',
                    merchant: 'Coffee Shop',
                    location: 'NYC',
                },
            });
        });

        it('should throw error if terminal ID already exists', async () => {
            prisma.terminal.findUnique.mockResolvedValue({ id: 'existing' });

            await expect(terminalService.createTerminal({
                terminalId: 'TERM-001',
                apiKey: 'key',
            })).rejects.toThrow('Terminal ID already exists');
        });
    });
});

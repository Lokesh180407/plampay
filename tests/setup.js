// Test setup file - runs before all tests
require('dotenv').config();

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key';
process.env.BCRYPT_SALT_ROUNDS = '4'; // Faster for tests
process.env.PALM_EMBEDDING_KEY = process.env.PALM_EMBEDDING_KEY || 'test-palm-key-32-bytes-long-test-key';

// Global test timeout
jest.setTimeout(10000);

// Mock console.log in tests to reduce noise (optional)
// global.console = {
//   ...console,
//   log: jest.fn(),
// };

const request = require('supertest');
const app = require('../../src/app');

describe('Health Check API', () => {
    it('GET /api/health should return 200 and healthy status', async () => {
        const res = await request(app).get('/api/health');

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body).toHaveProperty('status', 'healthy');
        expect(res.body).toHaveProperty('database');
    });

    it('GET / should return 200 and welcome message', async () => {
        const res = await request(app).get('/');

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body).toHaveProperty('message');
    });
});

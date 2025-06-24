import request from 'supertest';
import { writeFileSync } from 'fs';
import path from 'path';

process.env.ALLOWED_USERS = 'user1@example.com';
const dummyKey = path.join(__dirname, 'dummy.json');
writeFileSync(dummyKey, '{}');
process.env.SERVICE_ACCOUNT_JSON = dummyKey;

import express from 'express';
import logger from '../src/logger';
import errorHandler from '../src/middleware/errorHandler';

const app = express();
app.get('/throw', () => {
  throw new Error('boom');
});
app.use(errorHandler);

describe('error handler', () => {
  it('returns 500 json and logs once', async () => {
    const spy = jest.spyOn(logger, 'error').mockImplementation(() => {});
    const res = await request(app).get('/throw').expect(500);
    expect(res.body).toEqual({ error: 'boom' });
    expect(spy).toHaveBeenCalledTimes(1);
  });
});

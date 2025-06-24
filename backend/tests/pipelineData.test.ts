import request from 'supertest';
import { writeFileSync } from 'fs';
import path from 'path';
process.env.ALLOWED_USERS = 'user1@example.com';
const dummyKey = path.join(__dirname, 'dummy.json');
writeFileSync(dummyKey, '{}');
process.env.SERVICE_ACCOUNT_JSON = dummyKey;
import app from '../src/app';
import * as cache from '../src/lib/cache';

var mockedVerify: jest.Mock; // eslint-disable-line no-var

jest.mock('google-auth-library', () => {
  mockedVerify = jest.fn();
  return {
    OAuth2Client: function () {
      return { verifyIdToken: mockedVerify };
    },
  };
});
jest.mock('../src/lib/googleClient', () => ({
  getAuth: jest.fn(),
  sheets: {},
  drive: {},
}));
jest.mock('googleapis', () => ({
  google: {
    oauth2: () => ({
      userinfo: {
        get: jest
          .fn()
          .mockResolvedValue({ data: { email: 'test@example.com' } }),
      },
    }),
  },
}));

describe('GET /pipeline/data', () => {
  beforeEach(() => {
    mockedVerify.mockReset();
    cache.clear('data:last');
  });

  it('returns cached rows', async () => {
    mockedVerify.mockResolvedValue({
      getPayload: () => ({ email: 'user1@example.com' }),
    });
    cache.set('data:last', [{ name: 'Alice' }], 1000);
    const res = await request(app)
      .get('/pipeline/data')
      .set('Authorization', 'Bearer token')
      .expect(200);
    expect(res.body).toEqual([{ name: 'Alice' }]);
  });

  it('returns 404 when missing', async () => {
    mockedVerify.mockResolvedValue({
      getPayload: () => ({ email: 'user1@example.com' }),
    });
    const res = await request(app)
      .get('/pipeline/data')
      .set('Authorization', 'Bearer token')
      .expect(404);
    expect(res.body).toEqual({ error: 'no data' });
  });
});

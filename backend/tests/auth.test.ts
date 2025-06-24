import request from 'supertest';
import { writeFileSync } from 'fs';
import path from 'path';
process.env.ALLOWED_USERS = 'user1@example.com';
const dummyKey = path.join(__dirname, 'dummy.json');
writeFileSync(dummyKey, '{}');
process.env.SERVICE_ACCOUNT_JSON = dummyKey;
import app from '../src/app';
import { OAuth2Client } from 'google-auth-library';
var mockedVerify: jest.Mock;
jest.mock('google-auth-library', () => {
  mockedVerify = jest.fn();
  return {
    OAuth2Client: function () {
      return { verifyIdToken: mockedVerify };
    },
  };
});
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
jest.mock('../src/lib/googleClient', () => ({
  getAuth: jest.fn(),
  sheets: {},
  drive: {},
}));

describe('POST /auth/validate', () => {
  beforeEach(() => {
    mockedVerify.mockReset();
  });

  it('returns 200 for allowed user', async () => {
    mockedVerify.mockResolvedValue({
      getPayload: () => ({ email: 'user1@example.com' }),
    });
    const res = await request(app)
      .post('/auth/validate')
      .send({ idToken: 'token' })
      .expect(200);
    expect(res.body).toEqual({ email: 'user1@example.com' });
  });

  it('returns 403 for forbidden user', async () => {
    mockedVerify.mockResolvedValue({
      getPayload: () => ({ email: 'bad@example.com' }),
    });
    await request(app)
      .post('/auth/validate')
      .send({ idToken: 'token' })
      .expect(403);
  });
});

describe('requireAuth middleware', () => {
  it('blocks access to protected route', async () => {
    mockedVerify.mockResolvedValue({
      getPayload: () => ({ email: 'bad@example.com' }),
    });
    await request(app)
      .get('/health-protected')
      .set('Authorization', 'Bearer token')
      .expect(403);
  });
  it('allows whitelisted user', async () => {
    mockedVerify.mockResolvedValue({
      getPayload: () => ({ email: 'user1@example.com' }),
    });
    await request(app)
      .get('/health-protected')
      .set('Authorization', 'Bearer token')
      .expect(200);
  });
});

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
var mockGet: jest.Mock; // eslint-disable-line no-var

jest.mock('google-auth-library', () => {
  mockedVerify = jest.fn();
  return {
    OAuth2Client: function () {
      return { verifyIdToken: mockedVerify };
    },
  };
});

jest.mock('../src/lib/googleClient', () => {
  mockGet = jest.fn();
  return {
    getAuth: jest.fn(),
    sheets: { spreadsheets: { get: mockGet } },
    drive: {},
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

describe('GET /sheets/:id/tabs', () => {
  beforeEach(() => {
    mockedVerify.mockReset();
    mockGet.mockReset();
    cache.clear('tabs:12345678901234567890123456789012345678901234');
  });

  it('returns tabs', async () => {
    mockedVerify.mockResolvedValue({
      getPayload: () => ({ email: 'user1@example.com' }),
    });
    mockGet.mockResolvedValueOnce({
      data: {
        sheets: [
          { properties: { sheetId: 0, title: 'Candidates' } },
          { properties: { sheetId: 123456789, title: 'Archive 2024' } },
        ],
      },
    });
    const res = await request(app)
      .get('/sheets/12345678901234567890123456789012345678901234/tabs')
      .set('Authorization', 'Bearer token')
      .expect(200);
    expect(res.body).toEqual([
      { gid: '0', title: 'Candidates' },
      { gid: '123456789', title: 'Archive 2024' },
    ]);
  });

  it('returns 404 when not found', async () => {
    mockedVerify.mockResolvedValue({
      getPayload: () => ({ email: 'user1@example.com' }),
    });
    const err: any = new Error('not found');
    err.code = 404;
    mockGet.mockRejectedValueOnce(err);
    const res = await request(app)
      .get('/sheets/unknown/tabs')
      .set('Authorization', 'Bearer token')
      .expect(404);
    expect(res.body).toEqual({ error: 'spreadsheet not found' });
  });

  it('requires auth', async () => {
    await request(app)
      .get('/sheets/12345678901234567890123456789012345678901234/tabs')
      .expect(401);
  });
});

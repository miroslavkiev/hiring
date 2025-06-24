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
var mockList: jest.Mock; // eslint-disable-line no-var

jest.mock('google-auth-library', () => {
  mockedVerify = jest.fn();
  return {
    OAuth2Client: function () {
      return { verifyIdToken: mockedVerify };
    },
  };
});

jest.mock('../src/lib/googleClient', () => {
  mockList = jest.fn();
  return {
    getAuth: jest.fn(),
    sheets: {},
    drive: { files: { list: mockList } },
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

describe('GET /sheets', () => {
  beforeEach(() => {
    mockedVerify.mockReset();
    mockList.mockReset();
    cache.clear('allSheets');
  });

  it('returns spreadsheets', async () => {
    mockedVerify.mockResolvedValue({
      getPayload: () => ({ email: 'user1@example.com' }),
    });
    mockList.mockResolvedValueOnce({
      data: {
        files: [
          { id: '1', name: 'Sheet A' },
          { id: '2', name: 'Sheet B' },
        ],
      },
    });
    const res = await request(app)
      .get('/sheets')
      .set('Authorization', 'Bearer token')
      .expect(200);
    expect(res.body).toEqual([
      { id: '1', name: 'Sheet A' },
      { id: '2', name: 'Sheet B' },
    ]);
  });

  it('filters by query', async () => {
    mockedVerify.mockResolvedValue({
      getPayload: () => ({ email: 'user1@example.com' }),
    });
    mockList.mockResolvedValueOnce({
      data: {
        files: [
          { id: '1', name: 'Alpha' },
          { id: '2', name: 'Beta' },
        ],
      },
    });
    const res = await request(app)
      .get('/sheets?q=alp')
      .set('Authorization', 'Bearer token')
      .expect(200);
    expect(res.body).toEqual([{ id: '1', name: 'Alpha' }]);
  });

  it('returns empty array when none', async () => {
    mockedVerify.mockResolvedValue({
      getPayload: () => ({ email: 'user1@example.com' }),
    });
    mockList.mockResolvedValueOnce({ data: { files: [] } });
    const res = await request(app)
      .get('/sheets')
      .set('Authorization', 'Bearer token')
      .expect(200);
    expect(res.body).toEqual([]);
  });
});

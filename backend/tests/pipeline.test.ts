import request from 'supertest';
import { writeFileSync, readFileSync } from 'fs';
import path from 'path';
process.env.ALLOWED_USERS = 'user1@example.com';
const dummyKey = path.join(__dirname, 'dummy.json');
writeFileSync(dummyKey, '{}');
process.env.SERVICE_ACCOUNT_JSON = dummyKey;
import app from '../src/app';
import * as cache from '../src/lib/cache';
import { loadSettings } from '../src/lib/settingsStore';

var mockedVerify: jest.Mock; // eslint-disable-line no-var
var mockMetaGet: jest.Mock; // eslint-disable-line no-var
var mockValuesGet: jest.Mock; // eslint-disable-line no-var

jest.mock('google-auth-library', () => {
  mockedVerify = jest.fn();
  return {
    OAuth2Client: function () {
      return { verifyIdToken: mockedVerify };
    },
  };
});

jest.mock('../src/lib/googleClient', () => {
  mockMetaGet = jest.fn();
  mockValuesGet = jest.fn();
  return {
    getAuth: jest.fn(),
    sheets: {
      spreadsheets: {
        get: mockMetaGet,
        values: { get: mockValuesGet },
      },
    },
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

describe('POST /pipeline/sync', () => {
  beforeEach(() => {
    mockedVerify.mockReset();
    mockMetaGet.mockReset();
    mockValuesGet.mockReset();
    cache.clear('sheet|0');
  });

  it('syncs rows', async () => {
    mockedVerify.mockResolvedValue({
      getPayload: () => ({ email: 'user1@example.com' }),
    });
    mockMetaGet.mockResolvedValueOnce({
      data: { sheets: [{ properties: { sheetId: 0, title: 'Data' } }] },
    });
    mockValuesGet.mockResolvedValueOnce({
      data: {
        values: [
          ['Name', 'Email'],
          ['Alice', 'a@example.com'],
        ],
      },
    });
    const res = await request(app)
      .post('/pipeline/sync')
      .set('Authorization', 'Bearer token')
      .send({ sheetId: 'sheet', tabGid: '0' })
      .expect(200);
    expect(res.body).toEqual([{ name: 'Alice', email: 'a@example.com' }]);
    const settings = await loadSettings();
    expect(settings).toEqual({ sheetId: 'sheet', tabGid: '0' });
  });

  it('returns cached rows', async () => {
    mockedVerify.mockResolvedValue({
      getPayload: () => ({ email: 'user1@example.com' }),
    });
    mockMetaGet.mockResolvedValue({
      data: { sheets: [{ properties: { sheetId: 0, title: 'Data' } }] },
    });
    mockValuesGet.mockResolvedValue({ data: { values: [['Name'], ['Bob']] } });
    await request(app)
      .post('/pipeline/sync')
      .set('Authorization', 'Bearer token')
      .send({ sheetId: 'sheet', tabGid: '0' })
      .expect(200);
    expect(mockMetaGet).toHaveBeenCalledTimes(1);
    await request(app)
      .post('/pipeline/sync')
      .set('Authorization', 'Bearer token')
      .send({ sheetId: 'sheet', tabGid: '0' })
      .expect(200);
    expect(mockMetaGet).toHaveBeenCalledTimes(1);
  });

  it('force refresh bypasses cache', async () => {
    mockedVerify.mockResolvedValue({
      getPayload: () => ({ email: 'user1@example.com' }),
    });
    mockMetaGet.mockResolvedValue({
      data: { sheets: [{ properties: { sheetId: 0, title: 'Data' } }] },
    });
    mockValuesGet.mockResolvedValue({ data: { values: [['H'], ['v1']] } });
    await request(app)
      .post('/pipeline/sync')
      .set('Authorization', 'Bearer token')
      .send({ sheetId: 'sheet', tabGid: '0' })
      .expect(200);
    mockValuesGet.mockResolvedValue({ data: { values: [['H'], ['v2']] } });
    await request(app)
      .post('/pipeline/sync')
      .set('Authorization', 'Bearer token')
      .send({ sheetId: 'sheet', tabGid: '0', force: true })
      .expect(200);
    expect(mockValuesGet).toHaveBeenCalledTimes(2);
  });

  it('returns 404 for bad sheet', async () => {
    mockedVerify.mockResolvedValue({
      getPayload: () => ({ email: 'user1@example.com' }),
    });
    const err: any = new Error('not found');
    err.code = 404;
    mockMetaGet.mockRejectedValueOnce(err);
    const res = await request(app)
      .post('/pipeline/sync')
      .set('Authorization', 'Bearer token')
      .send({ sheetId: 'bad', tabGid: '0' })
      .expect(404);
    expect(res.body).toEqual({ error: 'sheet or tab not found' });
  });
});

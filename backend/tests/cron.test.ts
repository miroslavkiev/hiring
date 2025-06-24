import { writeFileSync } from 'fs';
import path from 'path';
process.env.ALLOWED_USERS = 'user1@example.com';
const dummyKey = path.join(__dirname, 'dummy.json');
writeFileSync(dummyKey, '{}');
process.env.SERVICE_ACCOUNT_JSON = dummyKey;

jest.mock('node-cron', () => ({ schedule: jest.fn() }));

let cron: any = require('node-cron');

describe('refresh cron job', () => {
  beforeEach(() => {
    jest.resetModules();
    cron = require('node-cron');
    (cron.schedule as jest.Mock).mockReset();
  });

  it('calls sync when settings present', async () => {
    jest.doMock('../src/lib/settingsStore', () => ({
      loadSettings: jest.fn().mockResolvedValue({ sheetId: 's', tabGid: '1' }),
    }));
    jest.doMock('../src/services/pipelineService', () => ({
      __esModule: true,
      default: jest.fn().mockResolvedValue([]),
    }));
    const startRefreshJob = require('../src/cron/refreshJob').default;
    const sync = require('../src/services/pipelineService').default;
    startRefreshJob();
    const fn = (cron.schedule as jest.Mock).mock.calls[0][1];
    await fn();
    expect(sync).toHaveBeenCalledWith('s', '1', true);
  });

  it('skips when settings missing', async () => {
    jest.doMock('../src/lib/settingsStore', () => ({
      loadSettings: jest.fn().mockResolvedValue(null),
    }));
    jest.doMock('../src/services/pipelineService', () => ({
      __esModule: true,
      default: jest.fn(),
    }));
    const startRefreshJob = require('../src/cron/refreshJob').default;
    const sync = require('../src/services/pipelineService').default;
    startRefreshJob();
    const fn = (cron.schedule as jest.Mock).mock.calls[0][1];
    await fn();
    expect(sync).not.toHaveBeenCalled();
  });
});

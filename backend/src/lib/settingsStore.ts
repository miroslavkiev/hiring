import { promises as fs } from 'fs';
import path from 'path';

export interface PipelineSettings {
  sheetId: string;
  tabGid: string;
}

const SETTINGS_PATH = path.resolve(__dirname, '../../config/settings.json');

export async function loadSettings(): Promise<PipelineSettings | null> {
  try {
    const data = await fs.readFile(SETTINGS_PATH, 'utf8');
    return JSON.parse(data) as PipelineSettings;
  } catch {
    return null;
  }
}

export async function saveSettings(settings: PipelineSettings): Promise<void> {
  await fs.mkdir(path.dirname(SETTINGS_PATH), { recursive: true });
  const tmp = `${SETTINGS_PATH}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(settings, null, 2));
  await fs.rename(tmp, SETTINGS_PATH);
}

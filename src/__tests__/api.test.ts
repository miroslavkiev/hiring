import { describe, it, expect, vi } from 'vitest';
import toast from 'react-hot-toast';
import { apiFetch } from '../lib/api';

describe('apiFetch', () => {
  it('shows toast on error', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      json: vi.fn().mockResolvedValue({ error: 'fail' }),
    } as any);
    const toastSpy = vi.spyOn(toast, 'error').mockImplementation(() => '');
    await expect(apiFetch('/x')).rejects.toThrow('fail');
    expect(toastSpy).toHaveBeenCalled();
  });
});

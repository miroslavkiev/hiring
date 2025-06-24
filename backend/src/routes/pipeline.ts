import { Router } from 'express';
import requireAuth from '../middleware/requireAuth';
import syncPipeline from '../services/pipelineService';

const router = Router();

router.post('/sync', requireAuth, async (req, res) => {
  const { sheetId, tabGid, force } = req.body || {};
  if (!sheetId || !tabGid) {
    return res.status(400).json({ error: 'sheetId and tabGid required' });
  }
  try {
    const rows = await syncPipeline(
      String(sheetId),
      String(tabGid),
      Boolean(force),
    );
    if (!rows) return res.status(404).json({ error: 'sheet or tab not found' });
    return res.json(rows);
  } catch (err) {
    const e = err as { code?: number; message?: string };
    if (e.code === 400) return res.status(400).json({ error: e.message });
    if (e.code === 404)
      return res.status(404).json({ error: 'sheet or tab not found' });
    return res.status(502).json({ error: 'google api failure' });
  }
});

export default router;

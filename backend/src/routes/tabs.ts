import { Router } from 'express';
import requireAuth from '../middleware/requireAuth';
import sheetsService from '../services/sheetsService';

const router = Router();

router.get('/:id/tabs', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const tabs = await sheetsService.listTabs(id);
    if (!tabs) return res.status(404).json({ error: 'spreadsheet not found' });
    return res.json(tabs);
  } catch (err) {
    return next(err);
  }
});

export default router;

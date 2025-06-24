import { Router } from 'express';
import listSpreadsheets from '../services/driveService';

const router = Router();

router.get('/', async (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q : undefined;
  const sheets = await listSpreadsheets(q);
  res.json(sheets);
});

export default router;

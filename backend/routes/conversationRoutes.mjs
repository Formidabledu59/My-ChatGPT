// backend/routes/conversationRoutes.mjs
import express from 'express';
import { addMessage } from '../controllers/conversationController.mjs';

const router = express.Router();

router.post('/message', addMessage);

export default router;
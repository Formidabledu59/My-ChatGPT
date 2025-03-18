import express from 'express';
import { getConversations, createConversation, getMessages } from '../controllers/conversationController.mjs';

const router = express.Router();

router.get('/', getConversations);
router.post('/', createConversation);
router.get('/:conversationId/messages', getMessages);

export default router;
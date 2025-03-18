import express from 'express';
import { getConversations, createConversation, getMessages, addMessage } from '../controllers/conversationController.mjs';

const router = express.Router();

router.get('/', getConversations);
router.post('/', createConversation);
router.get('/:conversationId/messages', getMessages);
router.post('/:conversationId/messages', addMessage);

export default router;
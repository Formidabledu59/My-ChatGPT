import express from 'express';
import { getConversations, createConversation, getMessages, addMessage, getAIResponse } from '../controllers/conversationController.mjs';

const router = express.Router();

router.get('/', getConversations);
router.post('/', createConversation);
router.get('/:conversationId/messages', getMessages);
router.post('/:conversationId/messages', addMessage);

// Ajoutez cette ligne pour la route AI response
router.get('/:conversationId/ai-response', getAIResponse);

export default router;
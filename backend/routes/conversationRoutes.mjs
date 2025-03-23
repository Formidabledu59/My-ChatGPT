import express from 'express';
import { getConversations, createConversation, getMessages, addMessage, getAIResponse, updateConversationName, deleteConversation } from '../controllers/conversationController.mjs';

const router = express.Router();

router.get('/', getConversations);
router.post('/', createConversation);
router.get('/:conversationId/messages', getMessages);
router.post('/:conversationId/messages', addMessage);

// Ajoutez cette ligne pour la route AI response
router.get('/:conversationId/ai-response', getAIResponse);

router.put('/:conversationId', updateConversationName);
router.delete('/:conversationId', deleteConversation);

export default router;
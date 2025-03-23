// backend/controllers/conversationController.mjs
import fetch from 'node-fetch';
import pool from '../dbConfig.mjs';

const addMessage = async (req, res) => {
  const { conversationId } = req.params;
  const { sender, text } = req.body;

  try {
    const [result] = await pool.query(
      'INSERT INTO message (idConv, sender, message) VALUES (?, ?, ?)',
      [conversationId, sender, text]
    );
    const newMessage = { id: result.insertId, idConv: conversationId, sender, message: text };
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error adding message:', error);
    res.status(500).send('Server Error');
  }
};

const getConversations = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM conversations');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).send('Server Error');
  }
};

const createConversation = async (req, res) => {
  const { name } = req.body;
  try {
    const [result] = await pool.query('INSERT INTO conversations (titre) VALUES (?)', [name]);
    const newConversation = { id: result.insertId, titre: name };
    res.status(201).json(newConversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).send('Server Error');
  }
};

const getMessages = async (req, res) => {
  const { conversationId } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM message WHERE idConv = ?', [conversationId]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).send('Server Error');
  }
};

export { addMessage, getConversations, createConversation, getMessages };


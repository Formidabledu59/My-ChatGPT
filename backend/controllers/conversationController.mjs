// backend/controllers/conversationController.mjs
import fetch from 'node-fetch';
import pool from '../dbConfig.mjs';

const addMessage = async (req, res) => {
  const { inputText } = req.body;
  const MODEL_NAME = "deepseek-ai/DeepSeek-R1-Distill-Qwen-32B";

  try {
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${MODEL_NAME}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: inputText }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    res.json(result[0].generated_text);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Server Error");
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

